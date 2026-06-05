"use client";

import { createContext, useContext, useSyncExternalStore, useState, ReactNode } from "react";
import useSWR from "swr";
import { getMe } from "@/apis";
import { tokenStore } from "@/utils/request";
import type { IUser } from "@/types/auth";
import UsernameModal from "@/components/UsernameModal";

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
  const [showUsernameModal, setShowUsernameModal] = useState(false);

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
      onError: () => { tokenStore.clear(); },
      onSuccess: (u) => {
        // Show username modal if logged in but no username set
        if (u && !u.username) setShowUsernameModal(true);
      },
    }
  );

  const login = (tok: string, u: IUser) => {
    tokenStore.set(tok);
    mutate(u, { revalidate: false });
    if (!u.username) setShowUsernameModal(true);
  };

  const logout = () => {
    tokenStore.clear();
    mutate(null, { revalidate: false });
    setShowUsernameModal(false);
  };

  return (
    <AuthContext.Provider value={{ user: user ?? null, loading: isLoading, login, logout }}>
      {children}
      {showUsernameModal && (
        <UsernameModal onDone={(username) => {
          setShowUsernameModal(false);
          mutate((prev) => prev ? { ...prev, username } : prev, { revalidate: false });
        }} />
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
