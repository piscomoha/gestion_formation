import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { authApi, type LoginPayload } from "@/api/auth.api";
import type { AuthUser, UserRole } from "@/types";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  logout: () => Promise<void>;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const raw = localStorage.getItem("tms_user");
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  });
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("tms_token"),
  );
  const [isLoading, setIsLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      return;
    }

    authApi
      .me()
      .then((currentUser) => {
        setUser(currentUser);
        localStorage.setItem("tms_user", JSON.stringify(currentUser));
      })
      .catch(() => {
        localStorage.removeItem("tms_token");
        localStorage.removeItem("tms_user");
        setToken(null);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(user && token),
      async login(payload) {
        const response = await authApi.login(payload);
        localStorage.setItem("tms_token", response.token);
        localStorage.setItem("tms_user", JSON.stringify(response.user));
        setToken(response.token);
        setUser(response.user);
        toast.success(`Bienvenue ${response.user.name}`);
        return response.user;
      },
      async logout() {
        try {
          await authApi.logout();
        } finally {
          localStorage.removeItem("tms_token");
          localStorage.removeItem("tms_user");
          setToken(null);
          setUser(null);
        }
      },
      hasRole(roles) {
        return Boolean(user && roles.includes(user.role));
      },
    }),
    [isLoading, token, user],
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
