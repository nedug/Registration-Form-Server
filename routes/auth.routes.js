import Router from 'express';
import { User } from '../models/User.js';
import bcrypt from 'bcryptjs';
import { check, validationResult } from 'express-validator';
import config from 'config';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../middleware/auth.middleware.js';


export const authRouter = new Router();

authRouter.post('/registration',
    [
        check('email', 'Uncorrected email').isEmail(),
        check('password', 'Password must be longer than 3 and shorter than 12')
            .isLength({ min: 3, max: 10 }),
    ],
    async (req, res) => {
        try {
            console.log(req.body);

            const errors = validationResult(req); /* Валидация данных */
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: errors.errors[0].msg });
            }

            const { email, password } = req.body; /* Получаем ИМЕЙЛ и ПАРОЛь из тела запроса */

            const candidate = await User.findOne({ email }); /* Ищем ИМЕЙЛ в базе данных */

            if (candidate) { /* Проверка на наличие пользователя */
                return res.status(400).json({ message: `User with email ${email} already exist` });
            }

            const hashPassword = await bcrypt.hash(password, 8); /* Кодируем пароль */

            const user = new User({ email, password: hashPassword }); /* Создадим пользователя */
            await user.save(); /* Сохраним пользователя */

            return res.json({ message: `User ${email} was created` }); /* Ответ сервера на клиент */
        } catch (e) {
            console.log(e);
            res.send({ message: 'Server error' });
        }
    });


authRouter.post('/login',
    async (req, res) => {
        try {
            const { email, password } = req.body;/* Получаем ИМЕЙЛ и ПАРОЛь из тела запроса */

            const user = await User.findOne({ email });  /* Ищем ИМЕЙЛ в базе данных */

            if (!user) { /* Проверка если пользователь нe найден */
                return res.status(404).json({ message: 'User not found' });
            }

            user.dateLogin = new Date();
            await user.save(); /* Сохраним пользовтеля */

            const isPassValid = bcrypt.compareSync(password, user.password); /* Сравниваем пароль с запроса и Базы Данных */

            if (!isPassValid) { /* Проверка на корректный пароль */
                return res.status(400).json({ message: 'Invalid password' });
            }

            /* Создаем токен JWT */
            const token = jwt.sign({ id: user.id }, config.get('secretKey'), { expiresIn: '1h' });

            return res.json({ /* Возвращаем пользовател с Токеном на клиент */
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    date: user.date,
                    dateLogin: user.dateLogin,
                },
            });
        } catch (e) {
            console.log(e);
            res.send({ message: 'Server error' });
        }
    });


authRouter.get('/auth', authMiddleware,  /* Подключаем Middleware для раскодировки ТОКЕНА */
    async (req, res) => {
        try {
            const user = await User.findOne({ _id: req.user.id }); /* Найдем пользователя по id из токена */

            console.log(user);

            const token = jwt.sign({ id: user.id }, config.get('secretKey'), { expiresIn: '1h' }); /* Пересоздаем ТОКЕН */

            return res.json({ /* Возвращаем пользовател с Токеном на клиент */
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    date: user.date,
                    dateLogin: user.dateLogin,
                },
            });
        } catch (e) {
            console.log(e);
            res.send({ message: 'Server error' });
        }
    });


authRouter.delete('/delete', authMiddleware, /* Подключаем Middleware для раскодировки ТОКЕНА */
    async (req, res) => {
        try {
            const user = await User.findByIdAndRemove({ _id: req.user.id }); /* Удаляем пользователя */

            console.log(user);

            return res.json({ /* Возвращаем пользовател с Токеном на клиент */
                user: {
                    id: user.id,
                    email: user.email,
                },
            });
        } catch (e) {
            console.log(e);
            res.status(500).send({ message: 'Server error' });
        }
    });