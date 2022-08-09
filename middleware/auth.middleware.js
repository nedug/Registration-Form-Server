import config from 'config';
import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
    if (req.method === 'OPTIONS') { /* Пропускаем запрос OPTIONS */
        return next();
    }
    try {
        const token = req.headers.authorization.split(' ')[1]; /* Забираем токен из Authorization: `Bearer ${localStorage.getItem('token')}` } }, */

        if (!token) {
            return res.status(401).json({ message: 'Auth error' });
        }

        const decoded = jwt.verify(token, config.get('secretKey')); /* Раскодируем ТОКЕН */

        req.user = decoded; /* Передаем с запросам раскодированный ТОКЕН в формате { id: '62f1091c9796d8546dd6aa26', iat: 1660035617, exp: 1660039217 } */

        next();
    } catch (e) {
        return res.status(401).json({ message: 'Auth error' });
    }
};