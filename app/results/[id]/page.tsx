import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { siteUrl, appUrl } from "@/config/site";

interface Analysis {
  faceShape:          string;
  lookmaxScore:       number;
  skinTone:           string;
  strengths:          string[];
  improvements:       string[];
  hairRecommendations: string[];
  outfitStyle:        string;
  colorPalette:       string[];
  features:           Record<string, string>;
}

interface ResultData {
  id:        string;
  photoUrl:  string;
  analysis:  Analysis;
  looks:     Array<{ name: string; imageUrl: string }>;
  occasion:  string;
  createdAt: string;
}

async function fetchResult(id: string): Promise<ResultData | null> {
  try {
    const res = await fetch(`${siteUrl}/analyze/result/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

const BOT_RE = /facebookexternalhit|Facebot|facebookcatalog|LinkedInBot|Twitterbot|Googlebot|bingbot|Slackbot|WhatsApp|TelegramBot|Discordbot|bot|crawler|spider|scraper/i;

/* ── OG meta tags — Facebook scraper уншина ── */
export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const data = await fetchResult(id);
  if (!data) return { title: "Looka — AI Looksmax шинжилгээ" };

  const { analysis, looks, photoUrl } = data;
  const ogImage = looks?.[0]?.imageUrl ?? photoUrl;
  const score   = analysis.lookmaxScore;
  const title   = `Миний looksmax оноо ${score}/10 ✨`;
  const desc    = "Looka AI-д шинжлүүлж өөрийн looksmax оноогоо мэдээрэй!";

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      url:      `${appUrl}/results/${id}`,
      siteName: "looka.beauty",
      images:   [{ url: ogImage, width: 1024, height: 1024, alt: title }],
      type:     "website",
      locale:   "mn_MN",
    },
    twitter: {
      card:        "summary_large_image",
      title,
      description: desc,
      images:      [ogImage],
    },
  };
}

export default async function ResultPage(
  { params }: { params: Promise<{ id: string }> }
) {
  // Bot (Facebook, Google…): OG tags are already in <head> — render minimal page
  // Real user: server-side redirect to home, no flash
  const headersList = await headers();
  const ua = headersList.get("user-agent") ?? "";
  const isBot = BOT_RE.test(ua);

  if (!isBot) {
    redirect("/");
  }

  // Only bots reach here — render a minimal page so OG tags are valid
  const { id } = await params;
  const data = await fetchResult(id);
  if (!data) redirect("/");

  const score = data.analysis.lookmaxScore;
  return (
    <div style={{ padding: 32, fontFamily: "sans-serif" }}>
      <h1>Looka AI — Looksmax оноо {score}/10</h1>
      <p>Looka AI-д шинжлүүлж өөрийн looksmax оноогоо мэдээрэй!</p>
      <a href="https://looka.beauty">looka.beauty →</a>
    </div>
  );
}
