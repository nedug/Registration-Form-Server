import Router from 'express';
import { User } from '../models/User.js';
import bcrypt from 'bcryptjs';
import { check, validationResult } from 'express-validator';


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
                return res.status(400).json({ message: 'Uncorrected request', errors });
            }

            const { email, password } = req.body; /* Получаем ИМЕЙЛ и ПАРОЛь из тела запроса */

            const candidate = await User.findOne({ email }); /* Ищем ИМЕЙЛ в базе данных */

            if (candidate) { /* Проверка на наличие пользователя */
                return res.status(400).json({ message: `User with email ${email} already exist` });
            }

            const hashPassword = await bcrypt.hash(password, 8); /* Кодируем пароль  */
            const user = new User({ email, password: hashPassword }); /* Создадим пользовтеля */
            await user.save(); /* Сохраним пользовтеля */

            return res.json({ message: 'User was created' }); /* Ответ сервера на клиент */

        } catch (e) {
            console.log(e);
            res.send({ message: 'Server error' });
        }
    });