'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'teacher' | 'admin';
  profileImage?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  /** Whether stored auth data (if any) has been loaded from localStorage */
  isReady: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface StoredAuth {
  token: string | null;
  user: User | null;
}

// localStorage is only available in the browser, so reads must happen
// after mount (SSR-safe). Resolving through a promise keeps the state
// update out of the effect body (avoids cascading renders).
function readStoredAuth(): Promise<StoredAuth> {
  return Promise.resolve().then(() => {
    if (typeof window === 'undefined') return { token: null, user: null };
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      if (storedToken && storedUser) {
        return { token: storedToken, user: JSON.parse(storedUser) as User };
      }
    } catch {
      // Corrupted storage — ignore and treat as logged out
    }
    return { token: null, user: null };
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    readStoredAuth().then((stored) => {
      if (cancelled) return;
      if (stored.token && stored.user) {
        setToken(stored.token);
        setUser(stored.user);
      }
      setIsReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isReady, login, logout, isAuthenticated: !!token }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
