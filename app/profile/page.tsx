"use client";

import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useAuth } from "@/lib/AuthContext";
import { useState } from "react";
import { getProfile, getAnalyses, ProfileData, SavedAnalysis } from "@/apis/profile";
import { appUrl } from "@/config/site";

const FEATURE: Record<string, { label: string; icon: string; color: string }> = {
  full:      { label: "Бүрэн шинжилгээ",   icon: "✦", color: "#9333ea" },
  // legacy keys for historical payments/usage display
  analyze:   { label: "Нүүрний шинжилгээ", icon: "◈", color: "#9333ea" },
  outfit:    { label: "Хувцас генератор",  icon: "◉", color: "#7c3aed" },
  hairstyle: { label: "Үс засал & Грим",   icon: "✦", color: "#a855f7" },
};


const PLAN_COLOR: Record<string, string> = {
  basic: "text-[#3b82f6] bg-[rgba(59,130,246,0.08)] border-[rgba(59,130,246,0.2)]",
  pro:   "text-[#9333ea] bg-[rgba(147,51,234,0.08)] border-[rgba(147,51,234,0.2)]",
};

function fmt(d: string) {
  return new Date(d).toLocaleDateString("mn-MN", { year: "numeric", month: "2-digit", day: "2-digit" });
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  // ── All hooks must be called unconditionally before any early return ──
  const { data, isLoading } = useSWR<ProfileData>(
    user ? "profile" : null,
    () => getProfile(),
    { revalidateOnFocus: false }
  );

  const [analysisPage, setAnalysisPage] = useState(1);
  const [expanded, setExpanded]         = useState<string | null>(null);

  const { data: analysesData, isLoading: analysesLoading } = useSWR(
    user ? `analyses-${analysisPage}` : null,
    () => getAnalyses(analysisPage),
    { revalidateOnFocus: false }
  );

  if (!user && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center flex flex-col gap-4">
          <p className="text-base text-[#6e6e73]">Профайл харахын тулд нэвтрэнэ үү</p>
          <a href="/login"
            className="inline-block bg-[#1c1c1e] text-white text-[0.87rem] font-bold px-6 py-[11px] rounded-full shadow-[0_4px_14px_rgba(0,0,0,0.18)]">
            Нэвтрэх →
          </a>
        </div>
      </div>
    );
  }

  const sub        = data?.subscription;
  const totalSpend = data?.payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0) ?? 0;
  const totalUsage = Object.values(data?.usage ?? {}).reduce((a, b) => a + b, 0);
  const usagePct   = sub ? Math.round((sub.monthlyUsage / sub.usageLimit) * 100) : 0;

  return (
    <div className="min-h-screen px-6 md:px-12 lg:px-20 pt-16 pb-24">

      {/* Hero */}
      <section className="mb-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="label-style mb-3">Профайл</p>
            <h1 className="text-[clamp(2rem,4vw,3rem)] tracking-[-0.02em]">
              {data?.user.phone ?? user?.phone ?? "—"}
            </h1>
            {data?.user.phoneVerified && (
              <span className="inline-flex items-center gap-[6px] mt-[10px] text-[0.72rem] font-bold text-[#16a34a] bg-[rgba(22,163,74,0.08)] border border-[rgba(22,163,74,0.2)] rounded-full px-3 py-[5px]">
                ✓ Баталгаажсан
              </span>
            )}
          </div>
        </div>
        <div className="mt-7 h-px bg-[rgba(0,0,0,0.07)]" />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left col */}
        <div className="flex flex-col gap-[14px]">

          {/* Subscription status */}
          {sub ? (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="label-style">Захиалга</p>
                <span className={`text-[0.7rem] font-bold px-[10px] py-1 rounded-full border ${PLAN_COLOR[sub.plan]}`}>
                  {sub.plan === "pro" ? "Pro" : "Basic"}
                </span>
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-[0.82rem] mb-2">
                  <span className="text-[#6e6e73]">Сарын ашиглалт</span>
                  <span className="font-bold text-[#1c1c1e]">{sub.monthlyUsage} / {sub.usageLimit}</span>
                </div>
                <div className="h-2 bg-[rgba(0,0,0,0.06)] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-[width] duration-700"
                    style={{
                      width: `${usagePct}%`,
                      background: usagePct >= 90 ? "#ef4444" : usagePct >= 60 ? "#d97706" : "#9333ea",
                    }} />
                </div>
                <p className="text-[0.72rem] text-[#8e8e93] mt-1">{sub.usageRemaining} шинжилгээ үлдсэн</p>
              </div>
              <div className="border-t border-[rgba(0,0,0,0.06)] pt-3 flex justify-between text-[0.8rem]">
                <span className="text-[#8e8e93]">Дуусах огноо</span>
                <span className="text-[#3a3a3c] font-medium">{fmt(sub.expiresAt)}</span>
              </div>
            </div>
          ) : (
            <div className="card p-5 text-center">
              <p className="text-[0.9rem] font-bold text-[#1c1c1e] mb-2">Захиалга байхгүй</p>
              <p className="text-[0.8rem] text-[#8e8e93] mb-4">Шинжилгээ авахын тулд захиалга сонгоно уу</p>
              <a href="/analyze" className="block py-[10px] rounded-full text-[0.85rem] font-bold text-white text-center"
                style={{ background: "linear-gradient(135deg,#9333ea,#7c3aed)", boxShadow: "0 4px 16px rgba(147,51,234,0.35)" }}>
                Захиалга авах →
              </a>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Нийт зарцуулсан", value: `${totalSpend.toLocaleString()}₮`, icon: "◇" },
              { label: "Нийт хэрэглэсэн", value: String(totalUsage),               icon: "◈" },
            ].map((s) => (
              <div key={s.label} className="card p-[18px]">
                <span className="text-[1.1rem] text-[#9333ea] block mb-[10px]">{s.icon}</span>
                <p className="text-[1.5rem] font-extrabold text-[#1c1c1e] tracking-[-0.02em]">{s.value}</p>
                <p className="label-style mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Feature usage */}
          <div className="card p-5">
            <p className="label-style mb-4">Боломжийн хэрэглээ</p>
            {isLoading ? (
              <div className="flex flex-col gap-[10px]">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-5 bg-[rgba(0,0,0,0.05)] rounded-lg" style={{ animation: "pulse 1.5s infinite" }} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {Object.entries(data?.usage ?? {}).filter(([, count]) => count > 0).length === 0
                  ? <p className="text-[0.82rem] text-[#aeaeb2]">Одоогоор хэрэглээ байхгүй байна</p>
                  : null}
                {Object.entries(data?.usage ?? {}).filter(([, count]) => count > 0).map(([feat, count]) => {
                  const meta = FEATURE[feat];
                  const pct  = totalUsage > 0 ? Math.round((count / totalUsage) * 100) : 0;
                  return (
                    <div key={feat}>
                      <div className="flex justify-between items-center mb-[6px]">
                        <span className="flex items-center gap-[6px] text-[0.82rem] font-medium">
                          <span className="text-[0.75rem]" style={{ color: meta?.color ?? "#6e6e73" }}>{meta?.icon}</span>
                          <span className="text-[#6e6e73]">{meta?.label ?? feat}</span>
                        </span>
                        <span className="text-[0.87rem] font-bold text-[#1c1c1e]">{count}</span>
                      </div>
                      <div className="h-1 bg-[rgba(0,0,0,0.06)] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-[width] duration-[0.6s] ease-out"
                          style={{ background: meta?.color ?? "#9333ea", width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card p-[18px]">
            <p className="label-style mb-[10px]">Бүртгэлийн огноо</p>
            <p className="text-[0.9rem] font-semibold text-[#3a3a3c]">
              {data?.user.createdAt ? fmt(data.user.createdAt) : "—"}
            </p>
          </div>
        </div>

        {/* Right col — payment history */}
        <div className="lg:col-span-2">
          <p className="label-style mb-[14px]">Төлбөрийн түүх</p>

          {isLoading ? (
            <div className="flex flex-col gap-[10px]">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card h-16" style={{ animation: "pulse 1.5s infinite" }} />
              ))}
            </div>
          ) : !data?.payments.filter((p) => p.status === "paid").length ? (
            <div className="card p-10 text-center">
              <p className="text-[0.9rem] text-[#8e8e93]">Одоогоор төлөгдсөн төлбөр байхгүй байна.</p>
              <p className="text-[0.82rem] text-[#aeaeb2] mt-[6px]">Захиалга хийхэд л энд харагдана.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {data.payments.filter((p) => p.status === "paid").map((p) => {
                const feat = FEATURE[p.type];
                const typeLabel =
                  p.type === "basic" ? "Basic захиалга" :
                  p.type === "pro"   ? "Pro захиалга"   :
                  feat?.label ?? p.type;
                return (
                  <div key={p.invoiceId} className="card px-5 py-[14px] flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-base shrink-0 text-[#16a34a]">
                        {p.type === "basic" || p.type === "pro" ? "★" : (feat?.icon ?? "◇")}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[0.87rem] font-semibold text-[#1c1c1e] overflow-hidden text-ellipsis whitespace-nowrap">{typeLabel}</p>
                        <p className="text-[0.75rem] text-[#8e8e93] mt-0.5">
                          {p.paidAt ? fmt(p.paidAt) : fmt(p.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[0.72rem] font-bold text-[#16a34a] bg-[rgba(22,163,74,0.08)] border border-[rgba(22,163,74,0.2)] px-[10px] py-1 rounded-full">
                        Төлсөн
                      </span>
                      <span className="text-[0.9rem] font-extrabold text-[#1c1c1e]">{p.amount.toLocaleString()}₮</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Шинжилгээний түүх ─────────────────────────── */}
      <section className="mt-10">
        <div className="flex items-center justify-between mb-5">
          <p className="label-style">Шинжилгээний түүх</p>
          {(analysesData?.total ?? 0) > 0 && (
            <span className="text-[0.75rem] text-[#8e8e93]">Нийт {analysesData?.total} шинжилгээ</span>
          )}
        </div>

        {analysesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card h-[200px] animate-pulse" />
            ))}
          </div>
        ) : !analysesData?.data.length ? (
          <div className="card p-10 text-center">
            <p className="text-[0.9rem] text-[#8e8e93]">Одоогоор шинжилгээ хийгдээгүй байна.</p>
            <a href="/analyze"
              className="inline-block mt-4 py-[10px] px-6 rounded-full text-[0.85rem] font-bold text-white"
              style={{ background: "linear-gradient(135deg,#9333ea,#7c3aed)" }}>
              Шинжилгээ хийх →
            </a>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {analysesData.data.map((a: SavedAnalysis) => (
                <div key={a.id} className="card overflow-hidden flex flex-col">

                  {/* Selfie + score */}
                  <div className="relative aspect-[4/3] bg-[#f5f5f7]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.photoUrl} alt="selfie" className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 bg-[#1c1c1e] text-white text-[0.7rem] font-extrabold px-2 py-1 rounded-lg">
                      {a.analysis.lookmaxScore}/10
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 px-3 pb-2 pt-6"
                      style={{ background: "linear-gradient(to top,rgba(0,0,0,0.65),transparent)" }}>
                      <p className="text-[0.65rem] font-bold text-white">{a.analysis.faceShape} · {new Date(a.createdAt).toLocaleDateString("mn-MN")}</p>
                    </div>
                  </div>

                  {/* Generated look thumbnails */}
                  {a.looks.length > 0 && (
                    <div className="flex gap-1 p-2">
                      {a.looks.slice(0, 4).map((l) => (
                        <div key={l.name} className="flex-1 aspect-square rounded-lg overflow-hidden bg-[#f5f5f7]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={l.imageUrl} alt={l.name} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Expand / collapse + share */}
                  <div className="mx-4 mb-3 mt-1 flex gap-2">
                    <button
                      onClick={() => setExpanded(expanded === a.id ? null : a.id)}
                      className="flex-1 py-[9px] rounded-full text-[0.8rem] font-semibold border border-[rgba(0,0,0,0.1)] text-[#6e6e73] cursor-pointer bg-transparent transition-all"
                    >
                      {expanded === a.id ? "Хаах ↑" : "Дэлгэрэнгүй харах ↓"}
                    </button>
                    <button
                      onClick={() => {
                        const url = `${appUrl}/results/${a.id}`;
                        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank", "width=640,height=480,noopener");
                      }}
                      className="flex items-center gap-[6px] px-4 py-[9px] rounded-full text-[0.8rem] font-bold text-white cursor-pointer border-none shrink-0"
                      style={{ background: "#1877F2" }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
                      </svg>
                      Share
                    </button>
                  </div>

                  {/* Full analyze result — exactly matches the analyze page */}
                  {expanded === a.id && (
                    <div className="border-t border-[rgba(0,0,0,0.06)] p-4 flex flex-col gap-4">

                      {/* Score card */}
                      <div className="bg-[#f9f9fb] rounded-[16px] p-4 border border-[rgba(0,0,0,0.05)]">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="label-style mb-1">Looksmax оноо</p>
                            <div className="flex items-end gap-1">
                              <span className="text-[2.4rem] font-extrabold text-[#1c1c1e] leading-none tracking-[-0.04em]">{a.analysis.lookmaxScore}</span>
                              <span className="text-[#aeaeb2] text-[0.9rem] mb-1">/10</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="label-style mb-1">Нүүрний хэлбэр</p>
                            <p className="text-[0.9rem] font-bold text-[#1c1c1e]">{a.analysis.faceShape}</p>
                            <p className="text-[0.75rem] text-[#8e8e93] mt-0.5">{a.analysis.skinTone}</p>
                          </div>
                        </div>
                        <div className="h-2 bg-[rgba(0,0,0,0.06)] rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${(a.analysis.lookmaxScore / 10) * 100}%`,
                              background: a.analysis.lookmaxScore >= 8 ? "linear-gradient(90deg,#16a34a,#22c55e)" : a.analysis.lookmaxScore >= 6 ? "linear-gradient(90deg,#9333ea,#a855f7)" : "linear-gradient(90deg,#d97706,#f59e0b)",
                            }} />
                        </div>
                        {a.analysis.colorPalette?.length > 0 && (
                          <div className="flex gap-2 mt-3 flex-wrap">
                            {a.analysis.colorPalette.map((c: string) => (
                              <div key={c} className="flex flex-col items-center gap-1">
                                <div className="w-8 h-8 rounded-[10px] border border-[rgba(0,0,0,0.08)]" style={{ background: c }} />
                                <span className="text-[0.5rem] text-[#aeaeb2]">{c}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Features breakdown */}
                      {a.analysis.features && Object.keys(a.analysis.features).length > 0 && (
                        <div>
                          <p className="label-style mb-3">Нүүрний онцлог</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {Object.entries(a.analysis.features).map(([key, val]) => {
                              const LABELS: Record<string, string> = { eyes: "Нүд", jawline: "Эрүү", chin: "Эрүүний доор", nose: "Хамар", lips: "Уруул" };
                              return (
                                <div key={key} className="bg-[#f9f9fb] rounded-xl p-3 border border-[rgba(0,0,0,0.05)]">
                                  <p className="label-style mb-1" style={{ color: "#9333ea" }}>{LABELS[key] ?? key}</p>
                                  <p className="text-[0.78rem] text-[#3a3a3c] leading-[1.5]">{String(val)}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Strengths & Improvements */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-[#f9f9fb] rounded-[16px] p-4 border border-[rgba(0,0,0,0.05)]">
                          <p className="label-style text-[#16a34a] mb-3">✓ Давуу тал</p>
                          {a.analysis.strengths?.map((s: string, i: number) => (
                            <div key={i} className="flex gap-2 text-[0.8rem] text-[#3a3a3c] mb-1.5">
                              <span className="text-[#16a34a] shrink-0 font-bold">+</span>{s}
                            </div>
                          ))}
                        </div>
                        <div className="bg-[#f9f9fb] rounded-[16px] p-4 border border-[rgba(0,0,0,0.05)]">
                          <p className="label-style text-[#9333ea] mb-3">↑ Looksmax зөвлөмж</p>
                          {a.analysis.improvements?.map((s: string, i: number) => (
                            <div key={i} className="flex gap-2 text-[0.8rem] text-[#3a3a3c] mb-1.5">
                              <span className="text-[#9333ea] shrink-0 font-bold">→</span>{s}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Hair & Style */}
                      {(a.analysis.hairRecommendations?.length > 0 || a.analysis.outfitStyle) && (
                        <div className="bg-[#f9f9fb] rounded-[16px] p-4 border border-[rgba(0,0,0,0.05)]">
                          <p className="label-style mb-3">Үс засал & Хувцаслалт</p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {a.analysis.hairRecommendations?.map((h: string) => (
                              <span key={h} className="text-[0.78rem] font-semibold text-[#9333ea] bg-[rgba(147,51,234,0.08)] border border-[rgba(147,51,234,0.2)] rounded-full px-3 py-1">
                                ✦ {h}
                              </span>
                            ))}
                          </div>
                          {a.analysis.outfitStyle && (
                            <p className="text-[0.8rem] text-[#6e6e73] leading-[1.6]">
                              <span className="font-semibold text-[#1c1c1e]">Стиль зөвлөмж: </span>{a.analysis.outfitStyle}
                            </p>
                          )}
                        </div>
                      )}

                      {/* AI generated look images */}
                      {a.looks.length > 0 && (
                        <div>
                          <p className="label-style mb-3">AI үүсгэсэн look-ууд</p>
                          <div className="grid grid-cols-2 gap-3">
                            {a.looks.map((l: { name: string; imageUrl: string }) => (
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
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {(analysesData?.pages ?? 0) > 1 && (
              <div className="flex justify-center gap-3 mt-6">
                <button disabled={analysisPage <= 1}
                  onClick={() => setAnalysisPage((p) => p - 1)}
                  className="px-4 py-2 rounded-full border border-[rgba(0,0,0,0.1)] text-[0.82rem] text-[#6e6e73] cursor-pointer disabled:opacity-30">
                  ← Өмнөх
                </button>
                <span className="flex items-center text-[0.82rem] text-[#8e8e93]">{analysisPage} / {analysesData?.pages}</span>
                <button disabled={analysisPage >= (analysesData?.pages ?? 1)}
                  onClick={() => setAnalysisPage((p) => p + 1)}
                  className="px-4 py-2 rounded-full border border-[rgba(0,0,0,0.1)] text-[0.82rem] text-[#6e6e73] cursor-pointer disabled:opacity-30">
                  Дараах →
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
