"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import useSWR from "swr";
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
  const [token, setToken] = useState<string | null>(() => tokenStore.get());

  const { data: user, isLoading, mutate } = useSWR<IUser | null>(
    token ? "/auth/me" : null,
    () => getMe(),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      onError: () => {
        tokenStore.clear();
        setToken(null);
      },
    }
  );

  const login = (tok: string, u: IUser) => {
    tokenStore.set(tok);
    setToken(tok);
    mutate(u, { revalidate: false });
  };

  const logout = () => {
    tokenStore.clear();
    setToken(null);
    mutate(null, { revalidate: false });
  };

  return (
    <AuthContext.Provider value={{ user: user ?? null, loading: isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
