import { siteUrl } from "@/config/site";
import { HttpRequest } from "@/utils/request";

const http = new HttpRequest(null, `${siteUrl}/outfit`);

export interface OutfitItem {
  name: string;
  items: string[];
  colors: string[];
  tip: string;
}

export interface OutfitResult {
  outfits: OutfitItem[];
}

export const generateOutfit = (
  event: string,
  season: string,
  style: string,
  image?: string
): Promise<OutfitResult> =>
  http.post("/", { event, season, style, ...(image ? { image } : {}) });
