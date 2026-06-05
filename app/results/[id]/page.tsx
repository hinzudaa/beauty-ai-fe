import type { Metadata } from "next";
import { siteUrl, appUrl } from "@/config/site";
import ShareResultClient from "./ShareResultClient";
import Link from "next/link";

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

/* ── OG meta tags — what Facebook shows when the link is shared ── */
export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const data = await fetchResult(id);
  if (!data) {
    return { title: "Looka — AI Looksmax шинжилгээ" };
  }

  const { analysis, looks, photoUrl } = data;

  // Best image: first AI-generated look (portrait 3:4), fallback to selfie
  const ogImage = looks?.[0]?.imageUrl ?? photoUrl;
  const score   = analysis.lookmaxScore;
  const title   = `Миний looksmax оноо ${score}/10 ✨`;
  const desc    = "Looka AI-д шинжлүүлж өөрийн looksmax оноогоо мэдээрэй!";
  const pageUrl = `${appUrl}/results/${id}`;

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      url:      pageUrl,
      siteName: "looka.beauty",
      images:   [{
        url:    ogImage,
        width:  1024,
        height: 1024,
        alt:    title,
      }],
      type: "website",
      locale: "mn_MN",
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
  const { id } = await params;
  const data = await fetchResult(id);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-[1rem] text-[#6e6e73] mb-4">Шинжилгээ олдсонгүй.</p>
          <Link href="/" className="text-[#9333ea] font-semibold">← Нүүр хуудас</Link>
        </div>
      </div>
    );
  }

  return <ShareResultClient data={data} shareUrl={`${appUrl}/results/${id}`} />;
}
