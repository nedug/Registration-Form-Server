import Router from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { fileController } from '../controllers/fileController.js';


export const fileRouter = new Router();

fileRouter.post('', authMiddleware, fileController.createDir);
// fileRouter.post('/upload', authMiddleware, fileController.uploadFile)
// fileRouter.post('/avatar', authMiddleware, fileController.uploadAvatar)
fileRouter.get('', authMiddleware, fileController.getFiles)
// fileRouter.get('/download', authMiddleware, fileController.downloadFile)
// fileRouter.get('/search', authMiddleware, fileController.searchFile)
// fileRouter.delete('/', authMiddleware, fileController.deleteFile)
// fileRouter.delete('/avatar', authMiddleware, fileController.deleteAvatar)