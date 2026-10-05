export interface User {
  id: string;
  fullName: string;
  email: string;
  balance: number;
}

export function isUser(value: unknown): value is User {
  if (typeof value !== 'object' || value === null) return false;
  const user = value as Partial<User>;
  return typeof user.id === 'string' && user.id.length > 0
    && typeof user.fullName === 'string' && user.fullName.trim().length > 0
    && typeof user.email === 'string' && user.email.includes('@')
    && typeof user.balance === 'number' && Number.isFinite(user.balance)
    && user.balance >= 0;
}
