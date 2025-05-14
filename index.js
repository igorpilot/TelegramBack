import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import router from './router/index.js';
import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001','https://fe9b-88-212-17-217.ngrok-free.app', 'https://proj-six-dun.vercel.app'];

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, "Hi, are you ready for earn?", {
        reply_markup: {
            keyboard: keyboard,
            resize_keyboard: true,
            one_time_keyboard: true
        }
    });
});

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
