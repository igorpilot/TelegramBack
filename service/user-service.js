import dotenv from 'dotenv';
import User from '../models/user-model.js';
import Task from '../models/task-model.js';

dotenv.config();


class UserService {
    async ensureTelegramUser({ telegramUser, referrerId }) {
        const { id, first_name, last_name, username, photo_url } = telegramUser;

        let user = await User.findOne({ telegramId: id });

        if (user && user.photoUrl !== photo_url) {
            user.photoUrl = photo_url;
            await user.save();
        }

        if (!user) {
            user = await User.create({
                telegramId: id,
                firstName: first_name,
                lastName: last_name,
                username,
                photoUrl: photo_url,
                balance: referrerId ? 1000 : 100,
                usdt: referrerId ? 5 : 0,
                hourlyProfit: referrerId ? 50 : 10,
                level: 1,
                lastActiveAt: new Date(),
                consecutiveLoginDays: 1,
                history: [],
                referralFrom: referrerId || null,
            });

            if (referrerId) {
                const referrerExists = await User.findOne({ telegramId: referrerId });
                if (referrerExists) {
                    await User.updateOne(
                        { telegramId: referrerId },
                        {
                            $addToSet: { friends: id },
                            $inc: {
                                balance: 1000 * referrerExists.level,
                                hourlyProfit: 100 * referrerExists.level,
                                experience: 100 * referrerExists.level
                            }
                        }
                    );
                }
            }
        } else {
            const today = new Date();
            const last = user.lastActiveAt ? new Date(user.lastActiveAt) : null;
            const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const lastDate = last ? new Date(last.getFullYear(), last.getMonth(), last.getDate()) : null;
            const dailyTaskIds = ['23', '210'];

            if (lastDate) {
                const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
                if (diffDays >= 1) {
                    user.completedTasks = user.completedTasks.filter(taskId => !dailyTaskIds.includes(taskId));
                    user.ticketsUsedToday = 0;
                    user.consecutiveLoginDays = diffDays === 1 ? user.consecutiveLoginDays + 1 : 1;
                }
            } else {
                user.consecutiveLoginDays = 1;
            }

            await user.save();
        }

        return user;
    }

}
export default  new UserService();