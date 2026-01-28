export type ApiEnvelopeSuccess<T> = {
  data: T;
  message?: string;
};

export type ApiEnvelopeError = {
  error: {
    code?: string;
    message: string;
    fields?: Record<string, string>;
  };
};

export class ApiClientError extends Error {
  status: number;
  code?: string;
  fields?: Record<string, string>;

  constructor(params: { status: number; message: string; code?: string; fields?: Record<string, string> }) {
    super(params.message);
    this.name = "ApiClientError";
    this.status = params.status;
    this.code = params.code;
    this.fields = params.fields;
  }
}

const TOKEN_KEY = "skillforge_token";

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null) {
  try {
    if (!token) localStorage.removeItem(TOKEN_KEY);
    else localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

function getBaseUrl() {
  const raw = (import.meta as any).env?.VITE_API_URL as string | undefined;
  const base = (raw || "").trim().replace(/\/$/, "");
  return base;
}

function isFormData(body: unknown): body is FormData {
  return typeof FormData !== "undefined" && body instanceof FormData;
}

export async function apiFetch<T>(
  path: string,
  options?: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
    auth?: boolean;
  }
): Promise<T> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${path}`;

  const method = options?.method || (options?.body ? "POST" : "GET");
  const auth = options?.auth !== false;

  const headers: Record<string, string> = {
    ...(options?.headers || {}),
  };

  const token = auth ? getAuthToken() : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  const body = options?.body;
  const init: RequestInit = { method, headers };

  if (body !== undefined) {
    if (isFormData(body)) {
      init.body = body;
    } else {
      headers["Content-Type"] = headers["Content-Type"] || "application/json";
      init.body = JSON.stringify(body);
    }
  }

  const res = await fetch(url, init);
  const text = await res.text();

  const json = (() => {
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  })();

  if (!res.ok) {
    const err = (json as ApiEnvelopeError | null)?.error;
    throw new ApiClientError({
      status: res.status,
      message: err?.message || res.statusText || "Request failed",
      code: err?.code,
      fields: err?.fields,
    });
  }

  const envelope = json as ApiEnvelopeSuccess<T> | null;
  if (envelope && typeof envelope === "object" && "data" in envelope) {
    return (envelope as ApiEnvelopeSuccess<T>).data;
  }

  // Fallback for non-enveloped endpoints
  return json as T;
}

export function toQueryString(params: Record<string, unknown>) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    if (Array.isArray(v)) {
      for (const item of v) q.append(k, String(item));
    } else {
      q.set(k, String(v));
    }
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}
