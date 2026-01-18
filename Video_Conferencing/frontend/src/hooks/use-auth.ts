import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type User = {
  id: string;
  username: string;
  email: string;
  name?: string;
  avatarUrl?: string;
};

export type InsertUser = {
  username: string;
  email: string;
  password: string;
};

const AUTH_STORAGE_KEY = "vc_auth";

function getApiBaseUrl() {
  return import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || "http://localhost:5000";
}

function readStoredAuth(): { token: string; user: User } | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeStoredAuth(auth: { token: string; user: User }) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
}

function clearStoredAuth() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function useAuth() {
  const queryClient = useQueryClient();

  const userQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const auth = readStoredAuth();
      return auth?.user ?? null;
    },
    staleTime: Infinity,
  });

  const tokenQuery = useQuery({
    queryKey: ["auth", "token"],
    queryFn: async () => {
      const auth = readStoredAuth();
      return auth?.token ?? null;
    },
    staleTime: Infinity,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const res = await fetch(`${getApiBaseUrl()}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(payload?.message || "Login failed");
      }

      const token = payload?.token;
      const user = payload?.user;
      if (!token || !user) throw new Error("Invalid login response");

      writeStoredAuth({
        token,
        user: {
          id: String(user.id),
          username: String(user.username),
          email: String(user.email),
          name: typeof user.name === "string" ? user.name : undefined,
          avatarUrl: typeof user.avatarUrl === "string" ? user.avatarUrl : undefined,
        },
      });

      return user as User;
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["auth", "me"], user);
      const auth = readStoredAuth();
      queryClient.setQueryData(["auth", "token"], auth?.token ?? null);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: InsertUser) => {
      const res = await fetch(`${getApiBaseUrl()}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.message || "Registration failed");
      }

      const payload = await res.json().catch(() => null);
      const token = payload?.token;
      const user = payload?.user;
      if (!token || !user) throw new Error("Invalid register response");

      writeStoredAuth({
        token,
        user: {
          id: String(user.id),
          username: String(user.username),
          email: String(user.email),
          name: typeof user.name === "string" ? user.name : undefined,
          avatarUrl: typeof user.avatarUrl === "string" ? user.avatarUrl : undefined,
        },
      });

      return user as User;
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["auth", "me"], user);
      const auth = readStoredAuth();
      queryClient.setQueryData(["auth", "token"], auth?.token ?? null);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      clearStoredAuth();
    },
    onSuccess: () => {
      queryClient.setQueryData(["auth", "me"], null);
      queryClient.setQueryData(["auth", "token"], null);
    },
  });

  return {
    user: userQuery.data,
    token: tokenQuery.data,
    isLoading: userQuery.isLoading,
    error: userQuery.error,
    login: loginMutation,
    register: registerMutation,
    logout: logoutMutation,
  };
}
