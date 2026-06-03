import { siteUrl } from "@/config/site";
import { HttpRequest } from "@/utils/request";

const http = new HttpRequest(null, `${siteUrl}/profile`);

export interface ProfilePayment {
  invoiceId: string;
  amount:    number;
  status:    "pending" | "paid" | "failed";
  type:      string;
  createdAt: string;
  paidAt?:   string;
}

export interface Subscription {
  plan:           "basic" | "pro";
  status:         "active" | "expired";
  expiresAt:      string;
  monthlyUsage:   number;
  usageLimit:     number;
  usageRemaining: number;
}

export interface ProfileData {
  user: {
    id:            string;
    phone:         string;
    phoneVerified: boolean;
    createdAt:     string;
  };
  subscription: Subscription | null;
  payments:     ProfilePayment[];
  usage:        { analyze: number; outfit: number; hairstyle: number };
}

export const getProfile = (): Promise<ProfileData> => http.get("/");
