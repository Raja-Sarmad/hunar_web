"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  AuthAPI,
  getStoredUser,
  getToken,
  setSession,
  type ApiUser,
} from "@/lib/api";

type AuthContextValue = {
  user: ApiUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<ApiUser>;
  signup: (input: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    role: "user" | "provider";
  }) => Promise<ApiUser>;
  logout: () => void;
  refresh: () => Promise<void>;
  updateProfile: (input: {
    name?: string;
    phone?: string;
  }) => Promise<ApiUser>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { user: me } = await AuthAPI.me();
      setSession(token, me);
      setUser(me);
    } catch {
      setSession(null, null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setUser(getStoredUser());
    refresh();
  }, [refresh]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login: async (email, password) => {
        const { token, user: next } = await AuthAPI.login({ email, password });
        setSession(token, next);
        setUser(next);
        return next;
      },
      signup: async (input) => {
        const { token, user: next } = await AuthAPI.signup(input);
        setSession(token, next);
        setUser(next);
        return next;
      },
      logout: () => {
        setSession(null, null);
        setUser(null);
      },
      refresh,
      updateProfile: async (input) => {
        const { user: next } = await AuthAPI.updateMe(input);
        const token = getToken();
        if (token) setSession(token, next);
        setUser(next);
        return next;
      },
    }),
    [user, loading, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
