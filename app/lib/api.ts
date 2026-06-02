const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(res.status, (data as { error?: string }).error ?? res.statusText);
  }
  return data as T;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  phone: string;
  phoneVerified: boolean;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface OtpStartResponse {
  sessionId: string;
  smsUri: string;
  displayInstruction: string;
  expiresAt: string;
}

export type OtpVerifyResponse =
  | { status: "PENDING" }
  | AuthResponse;

export async function apiOtpStart(phone: string): Promise<OtpStartResponse> {
  return request<OtpStartResponse>("/auth/start", {
    method: "POST",
    body: JSON.stringify({ phone }),
  });
}

export async function apiOtpVerify(sessionId: string): Promise<OtpVerifyResponse> {
  return request<OtpVerifyResponse>("/auth/verify", {
    method: "POST",
    body: JSON.stringify({ sessionId }),
  });
}

export async function apiMe(token: string): Promise<AuthUser> {
  return request<AuthUser>("/auth/me", {}, token);
}
