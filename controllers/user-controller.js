import User from '../models/user-model.js';

class UserController {
    async telegramAuth (req, res)  {
        try {
            const { id, first_name, last_name, username, photo_url, hash } = req.body;

            let user = await User.findOne({ telegramId: id });

            if (!user) {
                user = await User.create({
                    telegramId: id,
                    firstName: first_name,
                    lastName: last_name,
                    username,
                    photoUrl: photo_url,
                    balance: 100,
                    usdt: 0,
                    level: 1,
                    lastActiveAt: new Date(),
                    history: [],
                });
            }

            res.json(user);
        } catch (e) {
            console.error(e);
            res.status(500).json({ message: "Server error in telegramAuth" });
        }
    };
    async logout (req, res)  {
        console.log("Отримано запит логауту", req.body);
            try {
                const { userInfo } = req.body;

                const user = await User.findOne({ telegramId: userInfo.telegramId });
                if (!user) return res.status(404).json({ message: "User not found" });

                user.balance = userInfo.balance;
                user.hourlyProfit= userInfo.hourlyProfit;
                user.lastActiveAt = new Date();
                await user.save();

                return res.json({ message: "User activity updated" });
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

}

export default new UserController();