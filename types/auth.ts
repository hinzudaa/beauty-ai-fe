export interface IUser {
  _id: string;
  phone: string;
  phoneVerified: boolean;
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
