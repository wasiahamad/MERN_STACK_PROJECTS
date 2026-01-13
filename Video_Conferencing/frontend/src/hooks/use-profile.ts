import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./use-auth";

export type Profile = {
  id: string;
  username: string;
  email: string;
  name?: string;
  avatarUrl?: string;
};

function getApiBaseUrl() {
  return import.meta.env.VITE_API_URL || "http://localhost:5000";
}

export function useProfile() {
  const { token, user } = useAuth();

  return useQuery({
    queryKey: ["profile", "me"],
    enabled: !!token,
    queryFn: async () => {
      const res = await fetch(`${getApiBaseUrl()}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.message || "Failed to load profile");
      return payload?.user as Profile;
    },
    placeholderData: user
      ? ({ id: user.id, username: user.username, email: user.email } as Profile)
      : undefined,
  });
}

export function useUpdateProfile() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { name?: string; username?: string; email?: string; avatarUrl?: string; password?: string }) => {
      if (!token) throw new Error("Not authenticated");

      const res = await fetch(`${getApiBaseUrl()}/api/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(input),
      });

      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.message || "Failed to update profile");
      return payload?.user as Profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
    },
  });
}
