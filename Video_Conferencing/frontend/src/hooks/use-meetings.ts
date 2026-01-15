import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./use-auth";

export type Meeting = {
  id: string;
  title: string;
  roomId: string;
  createdAt: string;
  scheduledAt?: string;
  duration?: number;
  status?: "instant" | "scheduled" | "completed";
};

const STORAGE_KEY = "vc_meetings";

function readMeetings(): Meeting[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Meeting[]) : [];
  } catch {
    return [];
  }
}

function writeMeetings(meetings: Meeting[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(meetings));
}

function getApiBaseUrl() {
  return import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || "http://localhost:5000";
}

function makeId(length = 10) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

export function useMeetings() {
  const { token } = useAuth();

  return useQuery({
    queryKey: ["meetings", "history"],
    queryFn: async () => {
      if (!token) return readMeetings();

      const res = await fetch(`${getApiBaseUrl()}/api/meetings`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return readMeetings();

      const payload = await res.json().catch(() => null);
      const meetings = Array.isArray(payload?.meetings) ? (payload.meetings as Meeting[]) : [];
      if (meetings.length) writeMeetings(meetings);
      return meetings;
    },
  });
}

// useMeetingHistory removed (history not needed)

export function useMeeting(roomId: string) {
  const { token } = useAuth();

  return useQuery({
    queryKey: ["meetings", "byRoomId", roomId],
    queryFn: async () => {
      if (!roomId) return null;
      if (token) {
        const res = await fetch(`${getApiBaseUrl()}/api/meetings/code/${encodeURIComponent(roomId)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const payload = await res.json().catch(() => null);
          const meeting = payload?.meeting as Meeting | undefined;
          if (meeting?.roomId) return meeting;
        }
      }

      const existing = readMeetings().find((m) => m.roomId === roomId);
      return existing || {
        id: roomId,
        title: "Meeting",
        roomId,
        createdAt: new Date().toISOString(),
      };
    },
    enabled: !!roomId,
    retry: false,
  });
}

export function useCreateMeeting() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: async (title: string) => {
      if (token) {
        const res = await fetch(`${getApiBaseUrl()}/api/meetings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: title || "New Meeting",
            date: new Date().toISOString(),
            duration: 45,
          }),
        });
        const payload = await res.json().catch(() => null);
        if (!res.ok) throw new Error(payload?.message || "Failed to create meeting");
        const meeting = payload?.meeting as Meeting | undefined;
        if (!meeting?.roomId) throw new Error("Invalid create meeting response");

        const meetings = [meeting, ...readMeetings()];
        writeMeetings(meetings);
        return meeting;
      }

      const meeting: Meeting = {
        id: makeId(12),
        title: title || "New Meeting",
        roomId: makeId(10),
        createdAt: new Date().toISOString(),
        scheduledAt: new Date().toISOString(),
        duration: 45,
        status: "instant",
      };
      writeMeetings([meeting, ...readMeetings()]);
      return meeting;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings", "history"] });
    },
  });
}

export function useScheduleMeeting() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: async (input: { title: string; scheduledAt: string; duration: number }) => {
      if (token) {
        const res = await fetch(`${getApiBaseUrl()}/api/meetings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: input.title || "Scheduled Meeting",
            date: input.scheduledAt,
            duration: input.duration,
          }),
        });

        const payload = await res.json().catch(() => null);
        if (!res.ok) throw new Error(payload?.message || "Failed to schedule meeting");
        return payload?.meeting as Meeting;
      }

      const meeting: Meeting = {
        id: makeId(12),
        title: input.title || "Scheduled Meeting",
        roomId: makeId(10),
        createdAt: new Date().toISOString(),
        scheduledAt: input.scheduledAt,
        duration: input.duration,
        status: "scheduled",
      };
      writeMeetings([meeting, ...readMeetings()]);
      return meeting;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings", "history"] });
    },
  });
}

export function useUpdateMeeting() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: async (input: { id: string; title?: string; scheduledAt?: string; duration?: number }) => {
      if (token) {
        const res = await fetch(`${getApiBaseUrl()}/api/meetings/${encodeURIComponent(input.id)}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: input.title,
            date: input.scheduledAt,
            duration: input.duration,
          }),
        });

        const payload = await res.json().catch(() => null);
        if (!res.ok) throw new Error(payload?.message || "Failed to update meeting");
        return payload?.meeting as Meeting;
      }

      // Local fallback
      const meetings = readMeetings();
      const idx = meetings.findIndex((m) => m.id === input.id);
      if (idx === -1) throw new Error("Meeting not found");
      const updated = {
        ...meetings[idx],
        title: input.title ?? meetings[idx].title,
        scheduledAt: input.scheduledAt ?? meetings[idx].scheduledAt,
        duration: input.duration ?? meetings[idx].duration,
      } as Meeting;
      meetings[idx] = updated;
      writeMeetings(meetings);
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings", "history"] });
    },
  });
}

export function useDeleteMeeting() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      if (token) {
        const res = await fetch(`${getApiBaseUrl()}/api/meetings/${encodeURIComponent(id)}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const payload = await res.json().catch(() => null);
          throw new Error(payload?.message || "Failed to delete meeting");
        }
        return true;
      }

      const meetings = readMeetings().filter((m) => m.id !== id);
      writeMeetings(meetings);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings", "history"] });
    },
  });
}
