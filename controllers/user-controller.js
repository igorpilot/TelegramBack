import User from '../models/user-model.js';
import Task from '../models/task-model.js';

class UserController {
    async telegramAuth(req, res) {
        try {
            const { id, first_name, last_name, username, photo_url, hash } = req.body;
            let referrerId = req.query.start;
            if (referrerId && referrerId.startsWith('ref_')) {
                referrerId = referrerId.split('_')[1];
            }

            let user = await User.findOne({ telegramId: id });
            if (user && user.photoUrl !== photo_url) {
                user.photoUrl = photo_url;
                    await user.save()

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
                    level: 1,
                    lastActiveAt: new Date(),
                    consecutiveLoginDays: 1,
                    history: [],
                    referralFrom: referrerId || null,
                });

                if (referrerId) {
                    const referrerExists = await User.exists({ telegramId: referrerId });
                    if (referrerExists) {
                        await User.updateOne(
                            { telegramId: referrerId },
                            {
                                $addToSet: { friends: id },
                                $inc: {
                                    balance: 1000,
                                    hourlyProfit: 50
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
                        // 🧹 Очистити щоденні таски
                        user.completedTasks = user.completedTasks.filter(
                            (taskId) => !dailyTaskIds.includes(taskId)
                        );
                        user.ticketsUsedToday = 0

                        // 🔁 Оновити streak
                        user.consecutiveLoginDays = diffDays === 1 ? user.consecutiveLoginDays + 1 : 1;
                    }
                } else {
                    user.consecutiveLoginDays = 1;
                }

                await user.save();
            }
            res.json(user);
        } catch (e) {
            console.error(e);
            res.status(500).json({ message: "Server error in telegramAuth" });
        }
    }
    async getFriends(req, res) {
        try {
            const { id } = req.params;

            // Знаходимо користувача з його друзями (з populate якщо потрібні повні дані)
            const user = await User.findOne({ telegramId: id }).select('friends');

            if (!user) {
                return res.status(404).json({ message: "Користувача не знайдено" });
            }

            // Знаходимо всіх друзів (базова версія)
            const friends = await User.find({
                telegramId: { $in: user.friends }
            }).select('telegramId username firstName lastName photoUrl hourlyProfit createdAt');

            res.json(friends);
        } catch (e) {
            console.error('Помилка при отриманні друзів:', e);
            res.status(500).json({ message: "Помилка сервера" });
        }
    }
    async updateUser (req, res)  {
            try {
                const { userInfo } = req.body;

                const user = await User.findOne({ telegramId: userInfo.telegramId });
                if (!user) return res.status(404).json({ message: "User not found" });

                user.balance = userInfo.balance;
                user.hourlyProfit= userInfo.hourlyProfit;
                user.lastActiveAt = new Date();
                await user.save();

                return res.json({ message: "User activity updated", user:user });
            } catch (e) {
                console.error(e);
                return res.status(500).json({ message: "Server error" });
            }
    }
    async claimCoins (req, res)  {
        try {
            const { userInfo} = req.body;
            const user = await User.findOne({telegramId: userInfo.telegramId});
            if (!user) return res.status(404).json({ message: "User not found" });
            const now = Date.now();
            const CLAIM_TIME = 3 * 60 * 60;
            if (user.lastClaim && now - user.lastClaim < CLAIM_TIME) {
                return res.status(400).json({ message: "Ще не пройшло 3 години" });
            }
            user.balance = userInfo.balance + 100;
            user.hourlyProfit = userInfo.hourlyProfit;
            user.lastClaim = now;

            await user.save();

            res.json(user);
        } catch (e) {
            console.error(e);
            res.status(500).json({ message: "Server error in claimCoins" });
        }
    }
    async dailyReward(req, res) {
        try {
            const { userId, actuallyBalance } = req.body;
            const user = await User.findOne({ telegramId: userId });

            if (!user) return res.status(404).json({ message: "User not found" });

            const now = new Date();

            if (user.lastDailyReward) {
                const last = new Date(user.lastDailyReward);
                const isSameDay =
                    last.getFullYear() === now.getFullYear() &&
                    last.getMonth() === now.getMonth() &&
                    last.getDate() === now.getDate();

                if (isSameDay) {
                    return res.status(400).json({ message: "Ви вже відкривали сьогодні" });
                }
            }

            const reward = 50;
            user.balance= actuallyBalance +reward;
            user.lastDailyReward = now;
            await user.save();

            return res.json(user);
        } catch (e) {
            console.error(e);
            return res.status(500).json({ message: "Server error" });
        }
    }
    async collectPassiveIncome(req, res) {
        const MAX_OFFLINE_TIME = 3 * 60 * 60 * 1000; // 3 години в мілісекундах

        try {
            const { userId } = req.body;
            const user = await User.findOne({ telegramId: userId });

            if (!user) return res.status(404).json({ message: "User not found" });

            const now = Date.now();
            const diff = now - user.lastActiveAt;
            const effectiveTime = Math.min(diff, MAX_OFFLINE_TIME);

            const seconds = Math.floor(effectiveTime / 1000);

            // Дохід за секунду = годинний дохід / 3600
            const incomePerSecond = user.hourlyProfit / 3600;
            const passiveProfit = parseFloat((incomePerSecond * seconds).toFixed(2));

            user.balance = parseFloat((user.balance + passiveProfit).toFixed(2));
            user.lastActiveAt = now;
            await user.save();

            return res.json({ passiveProfit, balance: user.balance });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ message: "Server error" });
        }
    }
    async postTask(req, res) {
        try {
            let {task} = req.body;
            if (!task) {
                return res.status(400).json({ error: "Task data is required" });
            }

            const newTask = await Task.create(task);
            return res.status(201).json(newTask);
        }catch (e) {
            console.error(e);
        }
    }
    async getTasks(req, res) {
        try {
            const tasks = await Task.find();
            return res.status(200).json(tasks);
        } catch (e) {
            console.error("Failed to fetch tasks:", e);
            return res.status(500).json({ error: "Failed to get tasks" });
        }
    }
    async checkTask(req, res) {
        try {
            const { task } = req.body;
            const { id } = req.params;
            const user = await User.findOne({ telegramId: id });
            if (!user) return res.status(404).json({ message: "User not found" });
            if (user.completedTasks.includes(task.id)) {
                return res.status(400).json({ message: "Task already completed" });
            }
            if (task.type === "friends") {
                if ((user.friends.length) >= task.number ) {
                    user.completedTasks.push(task.id);
                    user.balance += task.reward;
                    await user.save();
                    return res.json({ message: "Task completed", user: user });
                } else { return res.status(404).json({ message: "Task not completed" }); }
            }
            if (task.type === "tickets") {
                const today = new Date();
                const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                const lastUse = user.lastTicketUseDate ? new Date(user.lastTicketUseDate) : null;

                const isSameDay = lastUse && lastUse >= todayStart;
                const ticketsUsed = isSameDay ? user.ticketsUsedToday : 0;

                if (ticketsUsed >= task.number) {
                    if (!user.completedTasks.includes(task.id)) {
                        user.completedTasks.push(task.id);
                        user.balance += task.reward;
                        await user.save();
                    }
                    return res.json({ message: "Task completed", user: user });
                } else {
                    return res.status(400).json({ message: "Not enough tickets used" });
                }
            }
            if (task.type === "login") {
                if (user.consecutiveLoginDays >= task.number) {
                    if (!user.completedTasks.includes(task.id)) {
                        user.completedTasks.push(task.id);
                        user.balance += task.reward;
                        await user.save();
                        return res.json({ message: "Task completed", user: user });
                    } else {
                        return res.status(400).json({ message: "Task already completed" });
                    }
                } else {
                    return res.status(400).json({ message: "Not enough consecutive days" });
                }
            }

        } catch (e) {
            console.error(e);
            return res.status(500).json({ message: "Server error" });
        }
    }
    async useTicket(req, res) {
        try {
            const { id } = req.params;
            const {lottery} = req.body
            const user = await User.findOne({ telegramId: id });
            if (!user) return res.status(404).json({ message: "User not found" });

            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const last = user.lastTicketUseDate ? new Date(user.lastTicketUseDate) : null;

            if (!last || last < today) {
                user.ticketsUsedToday = 1;
            } else {
                user.ticketsUsedToday += 1;
            }

            user.lastTicketUseDate = now;
            user.balance -= lottery.cost;
            user.hourlyProfit += lottery.hourlyProfit;
            await user.save();

            res.json({ user: user });
        } catch (e) {
            console.error(e);
            res.status(500).json({ message: "Server error using ticket" });
        }
    }

}

export default new UserController();