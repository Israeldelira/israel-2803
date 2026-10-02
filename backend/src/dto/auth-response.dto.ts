import type { User } from '../models/user.model.js';

export interface AuthResponseDto {
  status: 'success';
  message: string;
  user?: User;
}
