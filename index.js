import mongoose from 'mongoose';
import express from 'express';
import config from 'config';


const app = express(); /* Создаем приложение */

const PORT = config.get('serverPort'); /* Получааем порт */


const start = async () => {
    try {
        await new mongoose.connect(config.get('dbURL'), /* Обращаемся к MongoDB */
            // {
            //     useNewUrlParser: true,
            //     useUnifiedTopology: true,
            //     useCreateIndex: true,
            // }
        );

        app.listen(PORT, () => {
            console.log('Server started on port: ', PORT); /* Слушаем сервер на нужном порту */
        });
    } catch (e) {
        console.log(e.message);
    }
};

start();