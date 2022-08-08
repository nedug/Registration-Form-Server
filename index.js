import mongoose from 'mongoose';
import express from 'express';
import config from 'config';


const app = express();

const PORT = config.get('serverPort');


const start = async () => {
    try {
        await new mongoose.connect(config.get('dbURL'),
            // {
            //     useNewUrlParser: true,
            //     useUnifiedTopology: true,
            //     useCreateIndex: true,
            // }
        );


        app.listen(PORT, () => {
            console.log('Server started on port: ', PORT);
        });

    } catch (e) {

    }
};

start();