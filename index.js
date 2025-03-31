const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const router = require('./router');
const errorMiddleware = require('./middlewares/error-middlewares');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const app = express();
const allowedOrigins = ['https://igorpilot.github.io', 'https://igorpilot.github.io/ShopData', 'https://igorpilot.github.io/AutoShop', 'http://localhost:3000', 'http://localhost:3001'];

app.use((req, res, next) => {
    next();
});
app.get('/', (req, res) => {
    res.send('Сервер працює!');
});
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use('/locales', express.static('public/locales'));

app.use(express.json());
app.use(cookieParser());

app.use('/api', router);
app.use(errorMiddleware);

const start = async () => {
    try {
        await mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
        app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
    } catch (error) {
        console.log(error);
    }
};

start();
