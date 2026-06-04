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
  plan:           "basic" | "standard" | "pro";
  status:         "active" | "expired";
  expiresAt:      string;
  monthlyUsage:   number;
  usageLimit:     number;
  usageRemaining: number;
  usageResetAt?:  string;
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
  usage:        Record<string, number>;
}

export const getProfile = (): Promise<ProfileData> => http.get("/");

export interface SavedAnalysis {
  id:        string;
  photoUrl:  string;
  analysis:  {
    faceShape:        string;
    lookmaxScore:     number;
    skinTone:         string;
    undertone?:       string;
    seasonalColor?:   string;
    hiddenStrengths?: string[];
    strengths:        string[];
    improvements:     string[];
    makeupTips?:      string;
    hairRecommendations: string[];
    outfitStyle:      string;
    colorPalette:     string[];
    features:         Record<string, string>;
  };
  looks:     Array<{ name: string; imageUrl: string }>;
  occasion:  string;
  createdAt: string;
}

export interface AnalysesPage {
  data:  SavedAnalysis[];
  total: number;
  page:  number;
  pages: number;
}

export const getAnalyses = (page = 1): Promise<AnalysesPage> =>
  http.get("/analyses", { page });
