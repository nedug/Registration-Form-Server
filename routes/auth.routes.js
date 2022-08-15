import Router from 'express';
import { User } from '../models/User.js';
import bcrypt from 'bcryptjs';
import { check, validationResult } from 'express-validator';
import config from 'config';
import { v4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { mailService } from '../service/mail-service.js';


export const authRouter = new Router();

authRouter.post('/registration',
    [
        check('email', 'Uncorrected email').isEmail(),
        check('password', 'Password min 3 and max 12 symbols')
            .isLength({ min: 3, max: 10 }),
    ],
    async (req, res) => {
        try {
            console.log(req.body);

            const errors = validationResult(req); /* Валидация данных */
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: errors.errors[0].msg });
            }

            const { email, password, isNeedActivate } = req.body; /* Получаем ИМЕЙЛ и ПАРОЛь из тела запроса */

            const candidate = await User.findOne({ email }); /* Ищем ИМЕЙЛ в базе данных */

            if (candidate) { /* Проверка на наличие пользователя */
                return res.status(400).json({ message: `User with email ${email} already exist` });
            }

            const hashPassword = await bcrypt.hash(password, 8); /* Кодируем пароль */

            // const user = new User({ email, password: hashPassword }); /* Создадим пользователя */

            if (isNeedActivate) {
                const activationLink = v4(); // v34fa-asfasf-142saf-sa-asf
                const user = await User.create({ email, password: hashPassword, activationLink });
                await mailService.sendActivationMail(email, `${process.env.API_URL}/api/auth//activate/${activationLink}`);
            } else {
                const user = await User.create({ email, password: hashPassword, isActivated: true });
            }

            // await user.save(); /* Сохраним пользователя */

            return res.json({ message: `User ${email} was created` }); /* Ответ сервера на клиент */
        } catch (e) {
            console.log(e);
            res.status(500).send({ message: 'Server error' });
        }
    });


authRouter.post('/login',
    [
        check('email', 'Uncorrected email').isEmail(),
        check('password', 'Password min 3 and max 12 symbols')
            .isLength({ min: 3, max: 10 }),
    ],
    async (req, res) => {
        const errors = validationResult(req); /* Валидация данных */
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.errors[0].msg });
        }

        try {
            const { email, password, checkbox } = req.body; /* Получаем ИМЕЙЛ и ПАРОЛь из тела запроса */

            const user = await User.findOne({ email }); /* Ищем ИМЕЙЛ в базе данных */

            if (!user) { /* Проверка если пользователь нe найден */
                return res.status(404).json({ message: 'User not found' });
            }

            user.dateLogin = new Date();
            user.isSaveSession = checkbox;
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
                    isActivated: user.isActivated,
                    activationLink: user.activationLinkemail,
                    dateAuth: user.dateAuth,
                    dateLogin: user.dateLogin,
                    notes: user.notes,
                    isSaveSession: user.isSaveSession,
                },
            });
        } catch (e) {
            console.log(e);
            res.send({ message: 'Server error' });
        }
    });


authRouter.get('/activate/:link',
    async (req, res) => {

        try {
            // const { email, password } = req.body; /* Получаем ИМЕЙЛ и ПАРОЛь из тела запроса */
            //
            // const user = await User.findOne({ email }); /* Ищем ИМЕЙЛ в базе данных */
            //
            // if (!user) { /* Проверка если пользователь нe найден */
            //     return res.status(404).json({ message: 'User not found' });
            // }


            const activationLink = req.params.link;

            const user = await User.findOne({activationLink});
            if (!user) {
                return res.status(404).json({ message: 'Неккоректная ссылка активации' });
            }
            user.isActivated = true;
            await user.save();

            return res.redirect(process.env.CLIENT_URL);



            // user.dateLogin = new Date();
            // user.isSaveSession = checkbox;
            // await user.save(); /* Сохраним пользовтеля */
            //
            // const isPassValid = bcrypt.compareSync(password, user.password); /* Сравниваем пароль с запроса и Базы Данных */
            //
            // if (!isPassValid) { /* Проверка на корректный пароль */
            //     return res.status(400).json({ message: 'Invalid password' });
            // }
            //
            // /* Создаем токен JWT */
            // const token = jwt.sign({ id: user.id }, config.get('secretKey'), { expiresIn: '1h' });
            //
            // return res.json({ /* Возвращаем пользовател с Токеном на клиент */
            //     token,
            //     user: {
            //         id: user.id,
            //         email: user.email,
            //         dateAuth: user.dateAuth,
            //         dateLogin: user.dateLogin,
            //         notes: user.notes,
            //         isSaveSession: user.isSaveSession,
            //     },
            // });
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
                    isActivated: user.isActivated,
                    activationLink: user.activationLinkemail,
                    dateAuth: user.dateAuth,
                    dateLogin: user.dateLogin,
                    notes: user.notes,
                    isSaveSession: user.isSaveSession,
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


authRouter.patch('/change',
    [
        check('newPassword', 'Password min 3 and max 12 symbols')
            .isLength({ min: 3, max: 10 }),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req); /* Валидация данных */
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: errors.errors[0].msg });
            }
            const { email, newPassword } = req.body;/* Получаем ИМЕЙЛ и ПАРОЛь из тела запроса */

            const user = await User.findOne({ email });  /* Ищем ИМЕЙЛ в базе данных */

            if (!user) { /* Проверка если пользователь нe найден */
                return res.status(404).json({ message: 'User not found' });
            }

            const hashNewPassword = await bcrypt.hash(newPassword, 8); /* Кодируем пароль */
            user.password = hashNewPassword;

            await user.save(); /* Сохраним пользовтеля */

            // /* Создаем токен JWT */
            const token = jwt.sign({ id: user.id }, config.get('secretKey'), { expiresIn: '1h' });

            return res.json({ /* Возвращаем пользовател с Токеном на клиент */
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    dateAuth: user.dateAuth,
                    notes: user.notes,
                    dateLogin: user.dateLogin,
                    isSaveSession: user.isSaveSession,
                },
            });
        } catch (e) {
            console.log(e);
            res.send({ message: 'Server error' });
        }
    });


authRouter.post('/notes', authMiddleware, /* Подключаем Middleware для раскодировки ТОКЕНА */
    [
        check('notes', 'min 1 symbol')
            .isLength({ min: 1 }),
        check('notes', 'max 50 symbos')
            .isLength({ max: 50 }),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req); /* Валидация данных */
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: errors.errors[0].msg });
            }

            const { notes } = req.body;

            const user = await User.findOne({ _id: req.user.id });

            user.notes.push(notes);
            await user.save(); /* Сохраним пользовтеля */

            console.log(user);

            // /* Создаем токен JWT */
            const token = jwt.sign({ id: user.id }, config.get('secretKey'), { expiresIn: '1h' });

            return res.json({ /* Возвращаем пользовател с Токеном на клиент */
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    dateAuth: user.dateAuth,
                    dateLogin: user.dateLogin,
                    isSaveSession: user.isSaveSession,
                    notes: user.notes,
                },
            });
        } catch (e) {
            console.log(e);
            res.status(500).send({ message: 'Server error' });
        }
    });


authRouter.get('/users', authMiddleware,  /* Подключаем Middleware для раскодировки ТОКЕНА */
    async (req, res) => {
        try {
            const users = await User.find(); /* Найдем всех пользователей */

            return res.json({
                users,
            });
        } catch (e) {
            console.log(e);
            res.send({ message: 'Server error' });
        }
    });


authRouter.delete('/removeUsers', authMiddleware,  /* Подключаем Middleware для раскодировки ТОКЕНА */
    async (req, res) => {
        try {
            const users = await User.deleteMany({}); /* Удалим всех пользователей */

            return res.json({ message: `All users were removed` }); /* Ответ сервера на клиент */
        } catch (e) {
            console.log(e);
            res.send({ message: 'Server error' });
        }
    });