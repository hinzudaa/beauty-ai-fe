import type { FullAnalysisResult } from "@/apis/analyze";

const RESULT_KEY    = "bai_result";
const PHOTO_URL_KEY = "bai_cloud_url";

/** Persist analysis result across hard-refresh (sessionStorage survives F5 but not tab close) */
export const resultStore = {
  setResult(r: FullAnalysisResult) {
    if (typeof window === "undefined") return;
    try { sessionStorage.setItem(RESULT_KEY, JSON.stringify(r)); } catch {}
  },
  getResult(): FullAnalysisResult | null {
    if (typeof window === "undefined") return null;
    try {
      const s = sessionStorage.getItem(RESULT_KEY);
      return s ? (JSON.parse(s) as FullAnalysisResult) : null;
    } catch { return null; }
  },

  setPhotoUrl(url: string) {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(PHOTO_URL_KEY, url);
  },
  getPhotoUrl(): string | null {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem(PHOTO_URL_KEY);
  },

  clear() {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem(RESULT_KEY);
    sessionStorage.removeItem(PHOTO_URL_KEY);
  },
};
