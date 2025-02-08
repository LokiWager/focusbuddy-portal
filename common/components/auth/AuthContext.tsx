import { LoginResponse } from "@/common/api/api";
import { getJWTFromLocalStorage } from "@/common/core/user";
import { createContext, use, useEffect, useState } from "react";

interface AuthContextValue {
  user: LoginResponse | null;
  setUser: (token: LoginResponse) => void;
  ready: boolean;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
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

  return (
    <AuthContext.Provider value={{ user, setUser, ready }}>
      {children}
    </AuthContext.Provider>
  );
}
