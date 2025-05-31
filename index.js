import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import router from './router/index.js';
import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';
import UserController from "./controllers/user-controller.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001','https://a6bf-88-212-17-217.ngrok-free.app', 'https://proj-six-dun.vercel.app'];
const keyboard = [
    ["Почати", "Допомога"],
    ["Налаштування"]
];
bot.onText(/\/start$/, (msg) => {
    const chatId = msg.chat.id;
    sendWelcomeMessage(chatId);
});

bot.onText(/\/start (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const startParam = match[1];

    if (startParam.startsWith('ref_')) {
        const referrerId = startParam.split('_')[1];

        try {
            const req = {
                body: {
                    id: msg.from.id,
                    first_name: msg.from.first_name,
                    last_name: msg.from.last_name,
                    username: msg.from.username,
                },
                query: {
                    start: referrerId
                }
            };

            const res = {
                json: (data) => console.log('User created:', data),
                status: (code) => ({
                    json: (data) => console.error('Error:', code, data)
                })
            };

            await UserController.telegramAuth(req, res);
        } catch (e) {
            console.error('Помилка реферальної системи:', e);
        }
    }

    sendWelcomeMessage(chatId);
});
bot.onText(/\/start gift_lottery-(\d+)-([a-f0-9\-]+)-(.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const fromUserId = match[1];
    const giftId = match[2];
    const lotteryId = match[3];


    try {
        const req = {
            body: {
                telegramUser: {
                    id: msg.from.id,
                    first_name: msg.from.first_name,
                    last_name: msg.from.last_name,
                    username: msg.from.username,
                },
                gift: {
                    from: fromUserId,
                    lotteryId: lotteryId,
                    giftId
                }
            }
        };

        const res = {
            json: (data) => {
                bot.sendMessage(chatId, data.message);

                if (data.success && data.notifySender) {
                    bot.sendMessage(fromUserId, `✅ Ваш подарунок був прийнятий користувачем @${msg.from.username || msg.from.first_name}`);
                }
            },
            status: (code) => ({
                json: (data) => {
                    bot.sendMessage(chatId, `❌ ${data.message || "Помилка при обробці подарунка."}`);
                }
            })
        };

        await UserController.receiveGiftLottery(req, res);

    } catch (e) {
        console.error("Помилка в обробці подарунка:", e);
        bot.sendMessage(chatId, `❌ Сталася непередбачувана помилка.`);
    }

    sendWelcomeMessage(chatId);
});
function sendWelcomeMessage(chatId) {
    bot.sendMessage(chatId, "Hi, are you ready for earn?", {
        reply_markup: {
            keyboard: keyboard,
            resize_keyboard: true,
            one_time_keyboard: true
        }
    });
}

app.set('trust proxy', 1);
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));

app.get('/', (req, res) => {
    res.send('Server is working!');
});

app.use('/locales', express.static('public/locales'));

app.use(express.json());
app.use(cookieParser());
app.use('/api', router);

const start = async () => {
    try {
        await mongoose.connect(process.env.DB_URL, { useUnifiedTopology: true, useNewUrlParser: true });
        app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
    } catch (error) {
        console.log(error);
    }
};

start();
