"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getMe } from "@/apis";
import { tokenStore } from "@/utils/request";
import type { IUser } from "@/types/auth";

interface AuthContextValue {
  user: IUser | null;
  loading: boolean;
  login: (token: string, user: IUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate session from localStorage on mount
  useEffect(() => {
    const token = tokenStore.get();
    if (!token) { setLoading(false); return; }

    getMe()
      .then((u) => setUser(u))
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  function login(token: string, u: IUser) {
    tokenStore.set(token);
    setUser(u);
  }

  function logout() {
    tokenStore.clear();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
