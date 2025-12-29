import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { AuthResponse, User } from "../features/auth/types";
import { getStoredToken, removeStoredAuth, setStoredAuth } from "../utils/storage";
import { applyCompanyTheme, resetTheme } from "../utils/theme";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (payload: AuthResponse) => void;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type Props = {
  children: React.ReactNode;
};

export const AuthProvider: React.FC<Props> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => getStoredToken().user);
  const [token, setToken] = useState<string | null>(() => getStoredToken().token);

  // Apply saved theme on mount if user is logged in
  useEffect(() => {
    if (user?.company?.primaryColor) {
      applyCompanyTheme({
        primaryColor: user.company.primaryColor,
        secondaryColor: user.company.secondaryColor || undefined,
        accentColor: user.company.accentColor || undefined,
      });
    }
  }, []); // Run once on mount

  useEffect(() => {
    if (token) {
      setStoredAuth({ token, user });
    }
  }, [token, user]);

  const login = useCallback((payload: AuthResponse) => {
    const accessToken = payload.access_token;
    setToken(accessToken);
    setUser(payload.user ?? null);
    setStoredAuth({ token: accessToken, user: payload.user ?? null });

    // Apply company theme if available
    if (payload.user?.company?.primaryColor) {
      applyCompanyTheme({
        primaryColor: payload.user.company.primaryColor,
        secondaryColor: payload.user.company.secondaryColor || undefined,
        accentColor: payload.user.company.accentColor || undefined,
      });
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    removeStoredAuth();
    resetTheme(); // Reset to default theme on logout
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      login,
      logout,
      setUser
    }),
    [user, token, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

