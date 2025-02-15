"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "@/lib/fetch";

interface User {
  id: string;
  email: string;
  name: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: async () => {},
  logout: () => {},
  isLoading: true,
  error: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to fetch the latest user using the /me endpoint.
  const fetchUser = async (authToken: string) => {
    try {
      const fetchedUser = await apiFetch<User>("/api/auth/me", {
        token: authToken,
      });
      setUser(fetchedUser);
    } catch (error) {
      console.error("Failed to fetch user", error);
      setError("Failed to fetch user");
      setToken(null);
      localStorage.removeItem("token");
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      fetchUser(savedToken).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  // Modified login that accepts only the token.
  const login = async (authToken: string) => {
    setToken(authToken);
    localStorage.setItem("token", authToken);
    await fetchUser(authToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, isLoading, error }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
