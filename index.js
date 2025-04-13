import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import router from './router/index.js';
import errorMiddleware from './middlewares/error-middlewares.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();
const allowedOrigins = ['https://igorpilot.github.io', 'https://igorpilot.github.io/ShopData', 'https://igorpilot.github.io/AutoShop', 'http://localhost:3000', 'http://localhost:3001'];

app.use((req, res, next) => {
    next();
});
app.get('/', (req, res) => {
    res.send('Server is working!');
});
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));
app.use('/locales', express.static('public/locales'));

app.use(express.json());
app.use(cookieParser());
app.use('/api', router);
app.use(errorMiddleware);

const start = async () => {
    try {
        await mongoose.connect(process.env.DB_URL, { useUnifiedTopology: true, useNewUrlParser: true});
        app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
    } catch (error) {
        console.log(error);
    }
};

start();
