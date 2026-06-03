import { siteUrl } from "@/config/site";

export interface Prices {
  basicPrice: number;
  proPrice:   number;
}

const DEFAULTS: Prices = { basicPrice: 19999, proPrice: 29999 };

/** Fetch current subscription prices from backend (no auth required) */
export async function getPrices(): Promise<Prices> {
  try {
    const res = await fetch(`${siteUrl}/prices`, { next: { revalidate: 300 } });
    if (!res.ok) return DEFAULTS;
    return res.json();
  } catch {
    return DEFAULTS;
  }
}
