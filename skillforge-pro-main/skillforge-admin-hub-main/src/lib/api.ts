const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

/**
 * Make authenticated API request
 */
async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("admin_token");

  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Admin API endpoints
 */
export const adminApi = {
  // Get all recruiters with stats
  getRecruiters: async () => {
    const response = await apiFetch<{
      data: {
        recruiters: Recruiter[];
        total: number;
      };
      message: string;
    }>("/api/admin/recruiters");
    return response.data;
  },

  // Get all users
  getUsers: async () => {
    const response = await apiFetch<{
      data: {
        users: User[];
        total: number;
      };
      message: string;
    }>("/api/admin/users");
    return response.data;
  },
};

// Types
export interface Recruiter {
  id: string;
  email: string;
  name: string;
  phone: string;
  companyName: string;
  industry: string;
  website: string;
  location: string;
  about: string;
  logo: string;
  size: string;
  activeJobs: number;
  totalJobs: number;
  totalHires: number;
  isComplete: boolean;
  joinedAt: string;
  status: "active" | "inactive";
}

export interface User {
  _id: string;
  email: string;
  name: string;
  phone: string;
  role: "candidate" | "recruiter";
  createdAt: string;
  emailVerified: boolean;
}
