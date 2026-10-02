import type { Request, Response } from 'express';
import type { LoginDto } from '../dto/login.dto.js';
import type { RegisterDto } from '../dto/register.dto.js';
import { ApiError } from '../errors/api-error.js';
import * as authService from '../services/auth.service.js';

function handleError(res: Response, error: unknown): void {
  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      status: 'error',
      message: error.message,
      ...(error.errors ? { errors: error.errors } : {}),
    });
    return;
  }

  res.status(500).json({ status: 'error', message: 'Unexpected error' });
}

export function register(req: Request, res: Response): void {
  try {
    res.status(201).json(authService.register(req.body as RegisterDto));
  } catch (error) {
    handleError(res, error);
  }
}

export function login(req: Request, res: Response): void {
  try {
    res.status(200).json(authService.login(req.body as LoginDto));
  } catch (error) {
    handleError(res, error);
  }
}