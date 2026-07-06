"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { getCurrentAdmin, loginAdmin } from "@/lib/api/auth";
import { ACCESS_TOKEN_KEY } from "@/lib/api/client";
import type { AdminLoginRequest, AdminLoginResponse, StoredAdmin } from "@/types/auth";

const AUTH_STORAGE_KEY = "manbanjalbu-bo-auth";
const ADMIN_STORAGE_KEY = "manbanjalbu-bo-admin";

type AuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  admin: StoredAdmin | null;
  login: (request: AdminLoginRequest) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function toStoredAdmin(response: AdminLoginResponse): StoredAdmin {
  return {
    memberId: response.memberId,
    loginId: response.loginId,
    name: response.name,
    roleName: response.roleName,
    canManageProduct: response.canManageProduct,
    canManageMember: response.canManageMember,
    canManageOrder: response.canManageOrder,
    canManageSystem: response.canManageSystem,
  };
}

function persistSession(token: string, admin: StoredAdmin) {
  localStorage.setItem(AUTH_STORAGE_KEY, "true");
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(admin));
}

function clearSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(ADMIN_STORAGE_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [admin, setAdmin] = useState<StoredAdmin | null>(null);

  const applyAdmin = useCallback((nextAdmin: StoredAdmin) => {
    setAdmin(nextAdmin);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setAdmin(null);
    setIsAuthenticated(false);
  }, []);

  const login = useCallback(async (request: AdminLoginRequest) => {
    clearSession();
    setAdmin(null);
    setIsAuthenticated(false);

    const response = await loginAdmin(request);

    if (!response.accessToken) {
      throw new Error("액세스 토큰을 받지 못했습니다.");
    }

    const storedAdmin = toStoredAdmin(response);
    persistSession(response.accessToken, storedAdmin);
    applyAdmin(storedAdmin);
  }, [applyAdmin]);

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      const storedAdmin = localStorage.getItem(ADMIN_STORAGE_KEY);

      if (!token) {
        clearSession();
        setIsLoading(false);
        return;
      }

      if (storedAdmin) {
        try {
          applyAdmin(JSON.parse(storedAdmin) as StoredAdmin);
        } catch {
          localStorage.removeItem(ADMIN_STORAGE_KEY);
        }
      }

      try {
        const currentAdmin = await getCurrentAdmin();
        const nextAdmin = toStoredAdmin(currentAdmin);
        persistSession(token, nextAdmin);
        applyAdmin(nextAdmin);
      } catch {
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    void restoreSession();
  }, [applyAdmin, logout]);

  const value = useMemo(
    () => ({
      isAuthenticated,
      isLoading,
      admin,
      login,
      logout,
    }),
    [admin, isAuthenticated, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
