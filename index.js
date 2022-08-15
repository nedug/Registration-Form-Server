import mongoose from 'mongoose';
import express from 'express';
import config from 'config';
import { authRouter } from './routes/auth.routes.js';
import cors from 'cors';


const app = express(); /* Создаем приложение */

const PORT = process.env.PORT || config.get('serverPort'); /* Получааем порт */


app.use(express.json()); /* Работаем с JSON */
// app.use(corsMiddleware); /* CORS */
app.use(cors());
app.use('/api/auth', authRouter); /* Обрабатываем роуты /api/auth */
app.use('/api/delete', authRouter); /* Обрабатываем роуты /api/delete */
app.use('/api/notes', authRouter); /* Обрабатываем роуты /api/notes */
app.use('/api/users', authRouter); /* Обрабатываем роуты /api/users */
app.use('/api/removeUsers', authRouter); /* Обрабатываем роуты /api/removeUsers */
// app.use('/api/activate/:link', authRouter); /* Обрабатываем роуты /api/removeUsers */


const start = async () => {
    try {
        await new mongoose.connect(config.get('dbURL')); /* Обращаемся к MongoDB */

        app.listen(PORT, () => {
            console.log('Server started on port: ', PORT); /* Слушаем сервер на нужном порту */
        });
    } catch (e) {
        console.log(e.message);
    }
};

start();