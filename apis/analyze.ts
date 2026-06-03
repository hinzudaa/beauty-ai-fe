import { siteUrl } from "@/config/site";
import { HttpRequest } from "@/utils/request";

const http = new HttpRequest(null, `${siteUrl}/analyze`);

export interface AnalyzeResult {
  faceShape: string;
  skinTone: string;
  styleType: string;
  recommendations: string[];
  colorPalette: string[];
}

export function analyzeImage(imageDataUrl: string): Promise<AnalyzeResult> {
  return http.post("/", { image: imageDataUrl });
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
