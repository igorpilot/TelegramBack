import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import router from './router/index.js';
import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';

dotenv.config();

// Встановлення порту та налаштування Express
const PORT = process.env.PORT || 5000;
const app = express();

// Бот Telegram
const token = process.env.TELEGRAM_BOT_TOKEN; // Встановлення токену з .env
const bot = new TelegramBot(token, { polling: true });

// Налаштування дозволених доменів для CORS
const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];

// Створення обробника команди /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    // Визначення кнопки для запуску гри
    const keyboard = [
        [
            {
                text: "🎮 Запустити гру", // Текст кнопки
                web_app: { url: process.env.GAME_URL || 'https://1b60-88-212-17-217.ngrok-free.app' } // URL гри з змінної середовища
            }
        ]
    ];

    // Відправка повідомлення з кнопкою
    bot.sendMessage(chatId, "Привіт! Готовий до гри?", {
        reply_markup: {
            keyboard: keyboard,
            resize_keyboard: true, // Щоб кнопка була адаптована під розмір екрану
            one_time_keyboard: true // Кнопка з'являється лише один раз
        }
    });
});

// Налаштування CORS та підключення статичних файлів
app.set('trust proxy', 1);
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));

// Роут для основної сторінки
app.get('/', (req, res) => {
    res.send('Server is working!');
});

// Для локалізацій
app.use('/locales', express.static('public/locales'));

// Middleware для обробки JSON та cookie
app.use(express.json());
app.use(cookieParser());

// API маршрути
app.use('/api', router);

// Підключення до MongoDB
const start = async () => {
    try {
        await mongoose.connect(process.env.DB_URL, { useUnifiedTopology: true, useNewUrlParser: true });
        app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
    } catch (error) {
        console.log(error);
    }
};

start();
