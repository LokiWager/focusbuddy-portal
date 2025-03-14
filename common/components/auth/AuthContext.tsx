import { LoginResponse } from "@/common/api/api";
import { getJWTFromLocalStorage } from "@/common/core/user";
import { createContext, use, useEffect, useMemo, useState } from "react";

interface AuthContextValue {
  user: LoginResponse | null;
  setUser: (token: LoginResponse) => void;
  ready: boolean;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

export function useAuth() {
  const context = use(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useLoggedInAuth(): AuthContextValue & { user: LoginResponse } {
  const context = useAuth();
  if (!context.user) {
    throw new Error("User must be logged in");
  }
  return context as AuthContextValue & { user: LoginResponse };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<LoginResponse | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getJWTFromLocalStorage().then((user) => {
      if (user) {
        setUser(user);
      }
      setReady(true);
    });
  }, []);

  const value = useMemo(() => ({ user, setUser, ready }), [user, ready]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthFetch(): typeof fetch {
  const auth = useLoggedInAuth();
  return (input: RequestInfo | URL, init?: RequestInit) => {
    return fetch(input, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        "X-Auth-Token": auth.user.jwt,
        ...init?.headers,
      },
    });
  };
}
