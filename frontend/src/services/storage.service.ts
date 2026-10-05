export const STORAGE_KEYS = {
  user: 'auth.user',
  session: 'auth.session',
  credentials: 'auth.credentials',
} as const;

export function getItem<T>(key: string): T | null {
  try {
    const value = localStorage.getItem(key);
    return value === null ? null : JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    throw new Error('No fue posible guardar los datos. Habilita el almacenamiento del navegador e intenta nuevamente.');
  }
}

export function removeItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    throw new Error('No fue posible eliminar la sesión. Revisa el almacenamiento del navegador.');
  }
}
