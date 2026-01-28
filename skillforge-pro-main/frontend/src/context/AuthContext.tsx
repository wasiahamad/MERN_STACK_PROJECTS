import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import type { User } from "@/data/mockData";
import { apiFetch, ApiClientError, getAuthToken, setAuthToken } from "@/lib/apiClient";

interface AuthContextType {
  user: User | null;
  recruiterProfile: RecruiterProfile | null;
  isAuthenticated: boolean;
  authInitializing: boolean;
  loginWithPassword: (params: { email: string; password: string }) => Promise<void>;
  signup: (params: { email: string; password: string; role: "candidate" | "recruiter" }) => Promise<void>;
  verifyEmailOtp: (params: { email: string; otp: string; name?: string }) => Promise<void>;
  resendEmailOtp: (params: { email: string }) => Promise<void>;
  forgotPassword: (params: { email: string }) => Promise<void>;
  resetPassword: (params: { email: string; otp: string; newPassword: string }) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
  isCandidate: boolean;
  isRecruiter: boolean;
}

export type RecruiterProfile = {
  companyName?: string;
  website?: string;
  industry?: string;
  size?: string;
  about?: string;
  logo?: string;
  location?: string;
  isComplete?: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [recruiterProfile, setRecruiterProfile] = useState<RecruiterProfile | null>(null);
  const [authInitializing, setAuthInitializing] = useState(true);

  const refreshMe = async () => {
    const data = await apiFetch<{ user: User; recruiterProfile?: RecruiterProfile | null }>("/api/me");
    setUser(data.user);
    setRecruiterProfile(data.recruiterProfile ?? null);
  };

  const bootstrap = async () => {
    const token = getAuthToken();
    if (!token) {
      setAuthInitializing(false);
      return;
    }

    try {
      await refreshMe();
    } catch (e) {
      // Token invalid/expired or user not accessible → clear session
      if (e instanceof ApiClientError && (e.status === 401 || e.status === 403)) {
        setAuthToken(null);
      }
      setUser(null);
      setRecruiterProfile(null);
    } finally {
      setAuthInitializing(false);
    }
  };

  useEffect(() => {
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loginWithPassword = async (params: { email: string; password: string }) => {
    const data = await apiFetch<{ token: string; user: Pick<User, "id" | "email" | "role" | "name"> }>(
      "/api/auth/login",
      { method: "POST", body: params, auth: false }
    );
    setAuthToken(data.token);
    await refreshMe();
  };

  const signup = async (params: { email: string; password: string; role: "candidate" | "recruiter" }) => {
    await apiFetch<{ email: string; otpExpiresInMinutes: number }>("/api/auth/signup", {
      method: "POST",
      body: params,
      auth: false,
    });
  };

  const verifyEmailOtp = async (params: { email: string; otp: string; name?: string }) => {
    const data = await apiFetch<{ token: string; user: Pick<User, "id" | "email" | "role" | "name"> }>(
      "/api/auth/verify-email-otp",
      { method: "POST", body: params, auth: false }
    );
    setAuthToken(data.token);
    await refreshMe();
  };

  const resendEmailOtp = async (params: { email: string }) => {
    await apiFetch<{ email: string; otpExpiresInMinutes: number; resendCount: number }>(
      "/api/auth/resend-email-otp",
      { method: "POST", body: params, auth: false }
    );
  };

  const forgotPassword = async (params: { email: string }) => {
    await apiFetch<{ email: string; otpExpiresInMinutes?: number }>("/api/auth/forgot-password", {
      method: "POST",
      body: params,
      auth: false,
    });
  };

  const resetPassword = async (params: { email: string; otp: string; newPassword: string }) => {
    await apiFetch<{ ok: true }>("/api/auth/reset-password", {
      method: "POST",
      body: params,
      auth: false,
    });
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    setRecruiterProfile(null);
  };

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      recruiterProfile,
      isAuthenticated: !!user,
      authInitializing,
      loginWithPassword,
      signup,
      verifyEmailOtp,
      resendEmailOtp,
      forgotPassword,
      resetPassword,
      logout,
      refreshMe,
      isCandidate: user?.role === "candidate",
      isRecruiter: user?.role === "recruiter",
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, recruiterProfile, authInitializing]
  );

  return (
    <AuthContext.Provider
      value={value}
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
