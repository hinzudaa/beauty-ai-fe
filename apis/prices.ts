import { siteUrl } from "@/config/site";

export interface Prices {
  basicPrice:    number;
  standardPrice: number;
  proPrice:      number;
}

const DEFAULTS: Prices = { basicPrice: 19999, standardPrice: 24999, proPrice: 29999 };

/** Fetch current subscription prices from backend (no auth required) */
export async function getPrices(): Promise<Prices> {
  try {
    const res = await fetch(`${siteUrl}/prices`, { cache: "no-store" });
    if (!res.ok) return DEFAULTS;
    return res.json();
  } catch {
    return DEFAULTS;
  }
}
