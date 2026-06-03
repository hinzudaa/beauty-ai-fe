"use client";

import { createContext, useContext, useSyncExternalStore, ReactNode } from "react";
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

function subscribeToStorage(cb: () => void) {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const token = useSyncExternalStore(
    subscribeToStorage,
    () => tokenStore.get(),
    () => null
  );

  const { data: user, isLoading, mutate } = useSWR<IUser | null>(
    token ? "/auth/me" : null,
    () => getMe(),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      onError: () => {
        tokenStore.clear();
      },
    }
  );

  const login = (tok: string, u: IUser) => {
    tokenStore.set(tok);
    mutate(u, { revalidate: false });
  };

  const logout = () => {
    tokenStore.clear();
    mutate(null, { revalidate: false });
  };

  return (
    <AuthContext.Provider value={{ user: user ?? null, loading: isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
