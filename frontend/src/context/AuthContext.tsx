import { createContext, useContext, useState, type ReactNode } from 'react';
import type { User } from '../models/user.model';
import { authService, getStoredUsers } from '../services/auth.service';
import { getItem, removeItem, setItem, STORAGE_KEYS } from '../services/storage.service';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateBalance: (balance: number) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function restoreUser(): User | null {
  const session = getItem<unknown>(STORAGE_KEYS.session);
  if (typeof session !== 'object' || session === null || !('userId' in session)
    || typeof session.userId !== 'string') return null;
  return getStoredUsers().find((user) => user.id === session.userId) ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(restoreUser);

  async function login(email: string, password: string): Promise<void> {
    const loggedInUser = await authService.login({ email, password });
    setItem(STORAGE_KEYS.session, { userId: loggedInUser.id });
    setUser(loggedInUser);
  }

  function logout(): void {
    removeItem(STORAGE_KEYS.session);
    setUser(null);
  }

  function updateBalance(balance: number): void {
    if (!user) throw new Error('Inicia sesión para actualizar el saldo.');
    if (!Number.isFinite(balance) || balance < 0) throw new Error('El saldo debe ser un número válido mayor o igual a cero.');
    const updatedUser = { ...user, balance };
    setItem(STORAGE_KEYS.user, getStoredUsers().map((stored) => stored.id === user.id ? updatedUser : stored));
    setUser(updatedUser);
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: user !== null, login, logout, updateBalance }}>
      {children}
    </AuthContext.Provider>
  );
}

// Keep the requested provider and hook together in this small project.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe utilizarse dentro de AuthProvider.');
  return context;
}
