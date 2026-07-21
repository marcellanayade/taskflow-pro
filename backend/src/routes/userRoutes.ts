import { Router } from 'express';
import { UserController } from '../controllers/UserController';

const router = Router();
const userController = new UserController();

//create new user
router.post('/register', userController.register);

router.post('/login', userController.login);

router.post('/forgot-password', userController.forgotPassword);

// reset password with token
router.post('/reset-password/:token', userController.resetPassword);


export default router;