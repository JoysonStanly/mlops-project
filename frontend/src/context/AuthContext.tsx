import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { api } from '../lib/api';
import type { AuthResponse, User } from '../types';

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('ape_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('ape_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser) as User);
    }
    setLoading(false);
  }, []);

  async function saveSession(response: AuthResponse) {
    localStorage.setItem('ape_token', response.token);
    localStorage.setItem('ape_user', JSON.stringify(response.user));
    setToken(response.token);
    setUser(response.user);
  }

  function toMessage(error: unknown, fallback: string) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message;
      if (typeof message === 'string' && message.trim()) {
        return message;
      }
    }
    if (error instanceof Error && error.message.trim()) {
      return error.message;
    }
    return fallback;
  }

  async function login(email: string, password: string) {
    try {
      const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
      await saveSession(data);
    } catch (error) {
      throw new Error(toMessage(error, 'Unable to sign in'));
    }
  }

  async function register(name: string, email: string, password: string) {
    try {
      const { data } = await api.post<AuthResponse>('/auth/register', { name, email, password });
      await saveSession(data);
    } catch (error) {
      throw new Error(toMessage(error, 'Unable to create account'));
    }
  }

  function logout() {
    localStorage.removeItem('ape_token');
    localStorage.removeItem('ape_user');
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
