import { siteUrl } from "@/config/site";
import { HttpRequest } from "@/utils/request";

const http = new HttpRequest(null, `${siteUrl}/analyze`);

/* ── Types ───────────────────────────────────────────────────────── */

export interface LooksMaxAnalysis {
  faceShape:          string;
  lookmaxScore:       number;         // 1–10
  features: {
    eyes:     string;
    jawline:  string;
    chin:     string;
    nose:     string;
    lips:     string;
  };
  skinTone:           string;
  strengths:          string[];
  improvements:       string[];
  hairRecommendations: string[];
  outfitStyle:        string;
  colorPalette:       string[];
}

export interface FullAnalysisResult {
  analysis:   LooksMaxAnalysis;
  occasion:   string;
  analysisId: string;   // MongoDB _id — used to save looks back + view history
}

export interface GeneratedLook {
  name:     string;
  imageUrl: string;
}

/* ── API calls ───────────────────────────────────────────────────── */

/**
 * GPT-4o Vision analyzes the selfie with a looksmaxxing prompt.
 * Returns in ~5s. Follow up with generateLooks() for DALL-E images.
 */
export function runFullAnalysis(photoUrl: string, event: string): Promise<FullAnalysisResult> {
  return http.post("/full", { url: photoUrl, event });
}

/**
 * gpt-image-1 image editing — хэрэглэгчийн SELFIE дээр тулгуурлан
 * нүүр 100% хэвээр хадгалж, зөвхөн үс/хувцасыг өөрчилнө.
 *
 * @param imageUrl  Original selfie Cloudinary URL
 * @param analysis  GPT-4o looksmax analysis
 * @param occasion  Selected occasion for outfit prompt
 */
export function generateLooks(
  imageUrl:   string,
  analysisId: string,
  analysis:   Pick<LooksMaxAnalysis, "faceShape" | "skinTone" | "hairRecommendations" | "outfitStyle">,
  occasion:   string
): Promise<{ looks: GeneratedLook[] }> {
  return http.post("/generate-looks", { imageUrl, analysisId, analysis, occasion });
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
