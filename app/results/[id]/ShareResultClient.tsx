"use client";

import Link from "next/link";

interface Analysis {
  faceShape:           string;
  lookmaxScore:        number;
  skinTone:            string;
  undertone?:          string;
  seasonalColor?:      string;
  hiddenStrengths?:    string[];
  strengths:           string[];
  improvements:        string[];
  makeupTips?:         string;
  hairRecommendations: string[];
  outfitStyle:         string;
  colorPalette:        string[];
  features:            Record<string, string>;
}

interface ResultData {
  id:        string;
  photoUrl:  string;
  analysis:  Analysis;
  looks:     Array<{ name: string; imageUrl: string }>;
  occasion:  string;
  createdAt: string;
}

function FacebookShareBtn({ url, label = "Facebook-т хуваалцах" }: { url: string; label?: string }) {
  function share() {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(fbUrl, "_blank", "width=640,height=480,noopener,noreferrer");
  }
  return (
    <button
      onClick={share}
      className="flex items-center gap-2 px-5 py-[11px] rounded-full font-bold text-[0.88rem] text-white cursor-pointer border-none transition-all hover:opacity-90"
      style={{ background: "#1877F2", boxShadow: "0 4px 14px rgba(24,119,242,0.4)" }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
      </svg>
      {label}
    </button>
  );
}

export default function ShareResultClient({ data, shareUrl }: { data: ResultData; shareUrl: string }) {
  const { analysis, looks, photoUrl } = data;
  const score = analysis.lookmaxScore;
  const scoreColor = score >= 8 ? "#16a34a" : score >= 6 ? "#9333ea" : "#d97706";
  const FEATURE_LABELS: Record<string, string> = {
    eyes: "Нүд", jawline: "Эрүү", chin: "Эрүүний доор", nose: "Хамар", lips: "Уруул",
  };

  return (
    <div className="min-h-screen bg-[#f2f2f7]">
      <div className="max-w-[720px] mx-auto px-5 py-12 pb-24">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-[#9333ea] font-bold text-[0.88rem]">← Looka</Link>
          <FacebookShareBtn url={shareUrl} />
        </div>

        {/* Score hero */}
        <div className="card p-6 mb-5">
          <div className="flex items-center gap-5 mb-4">
            {/* Selfie thumbnail */}
            <div className="w-20 h-20 rounded-[16px] overflow-hidden shrink-0 border border-[rgba(0,0,0,0.08)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoUrl} alt="selfie" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <p className="label-style mb-1">Looksmax оноо</p>
              <div className="flex items-end gap-2">
                <span className="text-[3rem] font-extrabold leading-none tracking-[-0.04em]" style={{ color: scoreColor }}>
                  {score}
                </span>
                <span className="text-[#aeaeb2] text-[1rem] mb-1">/10</span>
              </div>
              <p className="text-[0.85rem] text-[#6e6e73] mt-1">{analysis.faceShape} нүүр · {analysis.skinTone}</p>
            </div>
          </div>
          <div className="h-2 bg-[rgba(0,0,0,0.06)] rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${(score / 10) * 100}%`, background: scoreColor }} />
          </div>
          {analysis.colorPalette?.length > 0 && (
            <div className="flex gap-2 mt-4 flex-wrap">
              {analysis.colorPalette.map((c) => (
                <div key={c} className="w-8 h-8 rounded-xl border border-[rgba(0,0,0,0.08)]" style={{ background: c }} />
              ))}
            </div>
          )}
        </div>

        {/* Undertone + Seasonal */}
        {(analysis.undertone || analysis.seasonalColor) && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            {analysis.undertone && (
              <div className="card p-4">
                <p className="label-style mb-1" style={{ color: "#d97706" }}>🌡 Далд тон</p>
                <p className="text-[0.9rem] font-bold text-[#1c1c1e]">{analysis.undertone}</p>
              </div>
            )}
            {analysis.seasonalColor && (
              <div className="card p-4">
                <p className="label-style mb-1" style={{ color: "#059669" }}>🌸 Өнгөний улирал</p>
                <p className="text-[0.9rem] font-bold text-[#1c1c1e]">{analysis.seasonalColor}</p>
              </div>
            )}
          </div>
        )}

        {/* Hidden strengths */}
        {analysis.hiddenStrengths && analysis.hiddenStrengths.length > 0 && (
          <div className="card p-5 mb-4"
            style={{ background: "linear-gradient(135deg,rgba(147,51,234,0.04),rgba(167,139,250,0.02))", border: "1px solid rgba(147,51,234,0.15)" }}>
            <p className="label-style text-[#9333ea] mb-3">✨ Бусад анзаардаг онцлог</p>
            {analysis.hiddenStrengths.map((s, i) => (
              <div key={i} className="flex gap-2 text-[0.84rem] text-[#3a3a3c] mb-2">
                <span className="text-[#9333ea] shrink-0">✦</span>{s}
              </div>
            ))}
          </div>
        )}

        {/* Features */}
        {analysis.features && (
          <div className="card p-5 mb-4">
            <p className="label-style mb-3">Нүүрний онцлог</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(analysis.features).map(([k, v]) => (
                <div key={k} className="bg-[#f9f9fb] rounded-xl p-3 border border-[rgba(0,0,0,0.05)]">
                  <p className="label-style text-[#9333ea] mb-1">{FEATURE_LABELS[k] ?? k}</p>
                  <p className="text-[0.8rem] text-[#3a3a3c] leading-[1.5]">{String(v)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Strengths & improvements */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="card p-5">
            <p className="label-style text-[#16a34a] mb-3">✓ Давуу тал</p>
            {analysis.strengths?.map((s, i) => (
              <div key={i} className="flex gap-2 text-[0.82rem] text-[#3a3a3c] mb-1.5">
                <span className="text-[#16a34a] shrink-0 font-bold">+</span>{s}
              </div>
            ))}
          </div>
          <div className="card p-5">
            <p className="label-style text-[#9333ea] mb-3">↑ Зөвлөмж</p>
            {analysis.improvements?.map((s, i) => (
              <div key={i} className="flex gap-2 text-[0.82rem] text-[#3a3a3c] mb-1.5">
                <span className="text-[#9333ea] shrink-0 font-bold">→</span>{s}
              </div>
            ))}
          </div>
        </div>

        {/* Makeup tips */}
        {analysis.makeupTips && (
          <div className="card p-5 mb-4">
            <p className="label-style mb-2" style={{ color: "#ec4899" }}>💄 Нүүр будалт</p>
            <p className="text-[0.84rem] text-[#3a3a3c] leading-[1.65]">{analysis.makeupTips}</p>
          </div>
        )}

        {/* Generated looks */}
        {looks.length > 0 && (
          <div className="card p-5 mb-6">
            <p className="label-style mb-3">AI үүсгэсэн look-ууд</p>
            <div className="grid grid-cols-2 gap-3">
              {looks.map((l) => (
                <div key={l.name} className="relative rounded-xl overflow-hidden aspect-square bg-[#f5f5f7]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={l.imageUrl} alt={l.name} className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 px-2 pb-[6px] pt-[14px]"
                    style={{ background: "linear-gradient(to top,rgba(0,0,0,0.7),transparent)" }}>
                    <p className="text-[0.6rem] font-bold text-white text-center">{l.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom share + CTA */}
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <FacebookShareBtn url={shareUrl} label="Хуваалцах" />
          <Link href="/analyze"
            className="flex-1 text-center py-[11px] rounded-full font-bold text-[0.9rem] text-white"
            style={{ background: "linear-gradient(135deg,#9333ea,#7c3aed)", boxShadow: "0 4px 20px rgba(147,51,234,0.35)" }}>
            Өөрийн шинжилгээ хийх →
          </Link>
        </div>
      </div>
    </div>
  );
}
