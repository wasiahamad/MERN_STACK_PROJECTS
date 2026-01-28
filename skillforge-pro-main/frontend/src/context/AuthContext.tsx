import React, { createContext, useContext, useState, ReactNode } from "react";
import { User, currentUser, recruiterUser } from "@/data/mockData";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (role: "candidate" | "recruiter") => void;
  logout: () => void;
  isCandidate: boolean;
  isRecruiter: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null); // Start logged out for demo

  const login = (role: "candidate" | "recruiter") => {
    if (role === "candidate") {
      setUser(currentUser);
    } else {
      setUser(recruiterUser);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        isCandidate: user?.role === "candidate",
        isRecruiter: user?.role === "recruiter",
      }}
    >
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
