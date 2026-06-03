import { siteUrl } from "@/config/site";
import { HttpRequest } from "@/utils/request";

const http = new HttpRequest(null, `${siteUrl}/hairstyle`);

export interface HairItem   { name: string; length: string; desc: string; }
export interface MakeupItem { name: string; desc: string; colors: string[]; }

export interface HairstyleResult {
  faceShape: string;
  hair: HairItem[];
  makeup: MakeupItem[];
}

export const analyzeHairstyle = (imageDataUrl: string): Promise<HairstyleResult> =>
  http.post("/", { image: imageDataUrl });
