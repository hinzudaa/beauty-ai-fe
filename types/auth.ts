export interface IUser {
  _id: string;
  phone: string;
  phoneVerified: boolean;
  username?: string | null;
  lookScore?: number | null;
  avatarUrl?: string | null;
}

export interface AuthResponse {
  token: string;
  user: IUser;
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
