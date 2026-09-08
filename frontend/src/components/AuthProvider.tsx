"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "../lib/types";

type AuthContextValue = {
  token: string | null;
  user: User | null;
  ready: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem("estateflow-token");
    const savedUser = localStorage.getItem("estateflow-user");
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.clear();
      }
    }
    setReady(true);
  }, []);

  const login = (nextToken: string, nextUser: User) => {
    localStorage.setItem("estateflow-token", nextToken);
    localStorage.setItem("estateflow-user", JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  };

  const logout = () => {
    localStorage.removeItem("estateflow-token");
    localStorage.removeItem("estateflow-user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
