const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const router = require('./router');
const errorMiddleware = require('./middlewares/error-middlewares');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const app = express();

// Логування запитів до запуску інших middleware
app.use((req, res, next) => {
    console.log(`📥 Отримано запит: ${req.method} ${req.url}`);
    next();
});
app.get('/', (req, res) => {
    console.log("Кореневий маршрут був викликаний.");
    res.send('Сервер працює!');
});
// Налаштування CORS
app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
}));

// Обробник для кореневого шляху


// Використання інших middleware
app.use(express.json());
app.use(cookieParser());

// Маршрути
app.use('/api', router);

// Обробка помилок
app.use(errorMiddleware);

// Запуск сервера
const start = async () => {
    try {
        await mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
        app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
    } catch (error) {
        console.log(error);
    }
};

start();
