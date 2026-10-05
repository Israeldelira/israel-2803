import { isUser, type User } from '../models/user.model';
import { getItem, setItem, STORAGE_KEYS } from './storage.service';

interface LoginInput {
  email: string;
  password: string;
}

interface RegisterInput extends LoginInput {
  fullName: string;
  confirmPassword: string;
}

interface Credentials {
  userId: string;
  salt: string;
  passwordHash: string;
}

const apiUrl = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');
const invalidLogin = 'Correo o contraseña incorrectos.';

export function getStoredUsers(): User[] {
  const stored = getItem<unknown>(STORAGE_KEYS.user);
  return Array.isArray(stored) ? stored.filter(isUser) : [];
}

function getCredentials(): Credentials[] {
  const stored = getItem<unknown>(STORAGE_KEYS.credentials);
  if (!Array.isArray(stored)) return [];
  return stored.filter((value: unknown): value is Credentials => {
    if (typeof value !== 'object' || value === null) return false;
    const credential = value as Partial<Credentials>;
    return typeof credential.userId === 'string'
      && typeof credential.salt === 'string' && /^[a-f0-9]{32}$/.test(credential.salt)
      && typeof credential.passwordHash === 'string' && /^[a-f0-9]{64}$/.test(credential.passwordHash);
  });
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

// Local simulation only: these credentials and the session can be altered in the browser.
async function hashPassword(password: string, salt: string): Promise<string> {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Abre la aplicación en localhost o mediante HTTPS para iniciar sesión.');
  }
  try {
    const key = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'],
    );
    const saltBytes = Uint8Array.from(salt.match(/.{2}/g) ?? [], (byte) => parseInt(byte, 16));
    const result = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: saltBytes, iterations: 100_000, hash: 'SHA-256' }, key, 256,
    );
    return toHex(new Uint8Array(result));
  } catch {
    throw new Error('No fue posible procesar la contraseña. Intenta nuevamente.');
  }
}

async function post(path: 'register' | 'login', input: LoginInput | RegisterInput): Promise<unknown> {
  const fallback = path === 'register'
    ? 'No fue posible registrar el usuario.' : 'No fue posible iniciar sesión.';
  if (!apiUrl) throw new Error('No fue posible conectar con el servicio. Intenta más tarde.');

  let response: Response;
  try {
    response = await fetch(`${apiUrl}/auth/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
  } catch {
    throw new Error('No fue posible conectar con el servicio. Intenta nuevamente.');
  }
  if (!response.ok) {
    if (path === 'login' && [400, 401, 403].includes(response.status)) throw new Error(invalidLogin);
    if (path === 'register' && response.status === 409) throw new Error('Este correo ya está registrado.');
    throw new Error(fallback);
  }
  try {
    const data: unknown = await response.json();
    if (typeof data !== 'object' || data === null || !('status' in data) || data.status !== 'success') {
      throw new Error(fallback);
    }
    return data;
  } catch {
    throw new Error(fallback);
  }
}

async function register(input: RegisterInput): Promise<User> {
  const email = input.email.trim().toLowerCase();
  const users = getStoredUsers();
  if (users.some((user) => user.email === email)) throw new Error('Este correo ya está registrado.');

  const salt = toHex(crypto.getRandomValues(new Uint8Array(16)));
  const passwordHash = await hashPassword(input.password, salt);
  const data = await post('register', { ...input, email, fullName: input.fullName.trim() });
  if (typeof data !== 'object' || data === null || !('user' in data) || !isUser(data.user)) {
    throw new Error('No fue posible registrar el usuario.');
  }
  const user: User = { id: data.user.id, fullName: data.user.fullName, email, balance: 0 };
  // The public user never contains a password or its hash.
  setItem(STORAGE_KEYS.credentials, [...getCredentials(), { userId: user.id, salt, passwordHash }]);
  setItem(STORAGE_KEYS.user, [...users, user]);
  return user;
}

async function login(input: LoginInput): Promise<User> {
  const email = input.email.trim().toLowerCase();
  await post('login', { ...input, email });
  const user = getStoredUsers().find((stored) => stored.email === email);
  const credential = getCredentials().find((stored) => stored.userId === user?.id);
  if (!user || !credential) throw new Error(invalidLogin);
  const passwordHash = await hashPassword(input.password, credential.salt);
  if (passwordHash !== credential.passwordHash) throw new Error(invalidLogin);
  return user;
}

export const authService = { register, login };
