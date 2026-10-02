import { randomUUID } from 'node:crypto';
import type { AuthResponseDto } from '../dto/auth-response.dto.js';
import type { LoginDto } from '../dto/login.dto.js';
import type { RegisterDto } from '../dto/register.dto.js';
import { ApiError } from '../errors/api-error.js';
import type { User } from '../models/user.model.js';

export function register(data: RegisterDto): AuthResponseDto {
  if (data.password !== data.confirmPassword) {
    throw new ApiError(400, 'Revisa los campos indicados.', [
      { field: 'confirmPassword', messages: ['confirmPassword must match password'] },
    ]);
  }

  const user: User = {
    id: randomUUID(),
    fullName: data.fullName,
    email: data.email,
    balance: 0,
  };

  return { status: 'success', message: 'User registered.', user };
}

// Only checks the submitted format. React compares the local credentials.
export function login(data: LoginDto): AuthResponseDto {
  return {
    status: 'success',
    message: `Login input validated for ${data.email}. Compare credentials in the frontend.`,
  };
}