import { Router } from 'express';
import { login, register } from '../controllers/auth.controller.js';
import { LoginDto } from '../dto/login.dto.js';
import { RegisterDto } from '../dto/register.dto.js';
import { validationMiddleware } from '../middlewares/validation.js';

export const authRouter = Router();

authRouter.post('/register', validationMiddleware(RegisterDto), register);
authRouter.post('/login', validationMiddleware(LoginDto), login);