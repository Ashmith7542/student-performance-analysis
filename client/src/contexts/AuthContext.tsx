import { createContext, useContext, useState, useEffect, ReactNode } from "react";

const API_URL = "/api";

export type UserRole = "student" | "teacher" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  rollNumber?: string;
  class?: string;
  department?: string;
  subject?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  signup: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const res = await fetch(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (data.success) {
            setUser(data.data);
          } else {
            localStorage.removeItem("token");
            localStorage.removeItem("currentUser");
          }
        }
      } catch (error) {
        console.log("Not authenticated");
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || "Login failed");
    }
    setUser(data.data.user);
    localStorage.setItem("token", data.data.token);
    localStorage.setItem("currentUser", JSON.stringify(data.data.user));
  };

  const signup = async (userData: any) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || "Signup failed");
    }
    setUser(data.data.user);
    localStorage.setItem("token", data.data.token);
    localStorage.setItem("currentUser", JSON.stringify(data.data.user));
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
