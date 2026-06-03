import { siteUrl } from "@/config/site";
import { HttpRequest } from "@/utils/request";

const http = new HttpRequest(null, `${siteUrl}/analyze`);

/* ── Result types ────────────────────────────────────────────────── */

export interface AnalyzeResult {
  faceShape:       string;
  skinTone:        string;
  styleType:       string;
  recommendations: string[];
  colorPalette:    string[];
}

export interface HairItem   { name: string; length: string; desc: string; }
export interface MakeupItem { name: string; desc: string; colors: string[]; }
export interface HairstyleResult {
  faceShape: string;
  hair:      HairItem[];
  makeup:    MakeupItem[];
}

export interface OutfitItem {
  name:   string;
  items:  string[];
  colors: string[];
  tip:    string;
}

export interface FullAnalysisResult {
  face:    AnalyzeResult;
  hair:    HairstyleResult;
  outfits: OutfitItem[];
}

/* ── API calls ───────────────────────────────────────────────────── */

/** Run face + hairstyle + outfit in one call — counts as 1 subscription use */
export function runFullAnalysis(imageDataUrl: string, event: string): Promise<FullAnalysisResult> {
  return http.post("/full", { image: imageDataUrl, event });
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
