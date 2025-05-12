import {verifyTelegramHash} from "../utils/telegramAuth.js";


class UserController {
    async telegramAuth (req, res)  {
        try {
            const { id, first_name, last_name, username, photo_url, hash } = req.body;
            const isValid = verifyTelegramHash(req.body, process.env.BOT_TOKEN);

            if (!isValid) return res.status(401).json({ message: "Invalid Telegram hash" });

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
            } else {
                user.lastActiveAt = new Date();
                await user.save();
            }

            res.json(user);
        } catch (e) {
            console.error(e);
            res.status(500).json({ message: "Server error" });
        }
    };
}

export default new UserController();