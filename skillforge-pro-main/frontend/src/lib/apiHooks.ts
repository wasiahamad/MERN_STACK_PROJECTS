import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Job, Application, Notification, DAOProposal, Candidate, User } from "@/data/mockData";
import { apiFetch, toQueryString } from "@/lib/apiClient";
import type { RecruiterProfile } from "@/context/AuthContext";

export function usePublicJobs(params: {
  search?: string;
  location?: string;
  type?: string;
  page?: number;
  pageSize?: number;
  skills?: string[];
  sort?: string;
}) {
  return useQuery({
    queryKey: ["jobs", params],
    queryFn: () => apiFetch<{ items: Job[]; total: number; page: number; pageSize: number }>(`/api/jobs${toQueryString(params)}`),
  });
}

export function usePublicJob(id?: string) {
  return useQuery({
    queryKey: ["job", id],
    enabled: !!id,
    queryFn: () => apiFetch<{ job: Job }>(`/api/jobs/${id}`),
  });
}

export function useRecommendedJobs(limit = 3) {
  return useQuery({
    queryKey: ["jobs", "recommended", limit],
    queryFn: () => apiFetch<{ items: Job[] }>(`/api/jobs/recommended${toQueryString({ limit })}`),
  });
}

export function useMyApplications(params: { status?: string; search?: string; page?: number; pageSize?: number; limit?: number }) {
  return useQuery({
    queryKey: ["applications", params],
    queryFn: () => apiFetch<{ items: Application[]; total: number; page: number; pageSize: number }>(`/api/applications${toQueryString(params)}`),
  });
}

export function useApplyToJob(jobId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { coverLetter?: string }) => apiFetch<{ applicationId: string; status: string }>(`/api/jobs/${jobId}/applications`, { method: "POST", body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["applications"] });
    },
  });
}

export function useRecruiterJobs(params: { status?: string; search?: string; page?: number; pageSize?: number; limit?: number }) {
  return useQuery({
    queryKey: ["recruiter", "jobs", params],
    queryFn: () => apiFetch<{ items: any[]; total: number; page: number; pageSize: number }>(`/api/recruiter/jobs${toQueryString(params)}`),
  });
}

export function useCreateRecruiterJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => apiFetch<{ job: any }>("/api/recruiter/jobs", { method: "POST", body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["recruiter", "jobs"] });
      qc.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}

export function useDeleteRecruiterJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => apiFetch<{ ok: true }>(`/api/recruiter/jobs/${jobId}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["recruiter", "jobs"] });
      qc.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}

export function useRecruiterCandidates(params: { search?: string; status?: string; jobId?: string; sort?: string; page?: number; pageSize?: number; limit?: number }) {
  return useQuery({
    queryKey: ["recruiter", "candidates", params],
    queryFn: () => apiFetch<{ items: Candidate[]; total: number; page: number; pageSize: number }>(`/api/recruiter/candidates${toQueryString(params)}`),
  });
}

export function useUpdateRecruiterCandidateStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { applicationId: string; status: string }) =>
      apiFetch<{ applicationId: string; status: string }>(`/api/recruiter/candidates/${params.applicationId}`, {
        method: "PATCH",
        body: { status: params.status },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["recruiter", "candidates"] });
      qc.invalidateQueries({ queryKey: ["recruiter", "activity"] });
    },
  });
}

export function useRecruiterActivity(limit = 10) {
  return useQuery({
    queryKey: ["recruiter", "activity", limit],
    queryFn: () => apiFetch<{ items: any[] }>(`/api/recruiter/activity${toQueryString({ limit })}`),
  });
}

export function useRecruiterProfile() {
  return useQuery({
    queryKey: ["recruiter", "profile"],
    queryFn: () => apiFetch<{ user: User; profile: RecruiterProfile | null }>("/api/recruiter/profile"),
  });
}

export function useUpdateRecruiterProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => apiFetch<{ user: User; profile: RecruiterProfile | null }>("/api/recruiter/profile", { method: "PUT", body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["recruiter", "profile"] });
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

export function useNotifications(unreadOnly?: boolean) {
  return useQuery({
    queryKey: ["notifications", { unreadOnly }],
    queryFn: () => apiFetch<{ items: Notification[] }>(`/api/notifications${toQueryString({ unreadOnly })}`),
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; read: boolean }) => apiFetch<{ id: string; read: boolean }>(`/api/notifications/${params.id}`, { method: "PATCH", body: { read: params.read } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useReadAllNotifications() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch<{ ok: true }>("/api/notifications/read-all", { method: "POST", body: {} }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useDaoProposals(status?: string) {
  return useQuery({
    queryKey: ["dao", "proposals", { status }],
    queryFn: () => apiFetch<{ items: DAOProposal[] }>(`/api/dao/proposals${toQueryString({ status })}`),
  });
}

export function useDaoMe(enabled: boolean) {
  return useQuery({
    queryKey: ["dao", "me"],
    enabled,
    queryFn: () => apiFetch<{ votingPower: number; reputation: number }>("/api/dao/me"),
  });
}

export function useVoteOnProposal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; vote: "for" | "against" }) =>
      apiFetch<{ proposal: DAOProposal }>(`/api/dao/proposals/${params.id}/votes`, { method: "POST", body: { vote: params.vote } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dao", "proposals"] });
    },
  });
}

export function useContactMessage() {
  return useMutation({
    mutationFn: (body: { name: string; email: string; subject: string; message: string }) =>
      apiFetch<{ id: string }>("/api/contact", { method: "POST", body, auth: false }),
  });
}

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: () => apiFetch<{ settings: any }>("/api/settings"),
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => apiFetch<{ settings: any }>("/api/settings", { method: "PUT", body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings"] }),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (body: { currentPassword: string; newPassword: string }) =>
      apiFetch<{ ok: true }>("/api/settings/password", { method: "POST", body }),
  });
}
