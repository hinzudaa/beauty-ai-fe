import { siteUrl } from "@/config/site";
import { HttpRequest } from "@/utils/request";
import type {
  IUser,
  OtpStartResponse,
  OtpVerifyResponse,
} from "@/types/auth";

const http = new HttpRequest(null, `${siteUrl}/auth`);

export const otpStart = (phone: string): Promise<OtpStartResponse> =>
  http.post("/start", { phone });


export const otpVerify = (sessionId: string): Promise<OtpVerifyResponse> =>
  http.post("/verify", { sessionId });

export const getMe = (): Promise<IUser> => http.get("/me");
