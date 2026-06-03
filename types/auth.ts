// ── User ──────────────────────────────────────────────────────────────────────

export interface IUser {
  _id: string;
  phone: string;
  phoneVerified: boolean;
}

// ── Auth responses ────────────────────────────────────────────────────────────

export interface AuthResponse {
  token: string;
  user: IUser;
}

// ── OTP ───────────────────────────────────────────────────────────────────────

export interface OtpStartPayload {
  phone: string;
}

export interface OtpStartResponse {
  sessionId: string;
  smsUri: string;              // sms:144773?body=...  tap-to-send on mobile
  displayInstruction: string;  // Mongolian instruction shown to the user
  expiresAt: string;           // ISO-8601, 300 s TTL
}

export type OtpVerifyResponse =
  | { status: "PENDING" }
  | AuthResponse;
