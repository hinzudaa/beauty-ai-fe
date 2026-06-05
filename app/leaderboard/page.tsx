"use client";

import { useEffect, useState } from "react";
import { siteUrl } from "@/config/site";
import Image from "next/image";

interface Entry {
  rank:      number;
  username:  string;
  lookScore: number;
  avatarUrl: string | null;
}

const MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

const scoreColor = (s: number) =>
  s >= 90 ? "#16a34a" : s >= 75 ? "#9333ea" : s >= 60 ? "#d97706" : "#6e6e73";

export default function LeaderboardPage() {
  const [data,    setData]    = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${siteUrl}/leaderboard`)
      .then((r) => r.json())
      .then((d) => { setData(d.data ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      <div className="max-w-[600px] mx-auto px-5 pt-10 pb-24">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 text-[0.72rem] font-bold tracking-[0.12em] uppercase"
            style={{ background: "rgba(147,51,234,0.08)", color: "#9333ea", border: "1px solid rgba(147,51,234,0.2)" }}>
            ✦ Looksmax Rankings
          </div>
          <h1 className="text-[2rem] font-extrabold tracking-[-0.03em] text-[#1c1c1e] mb-2">
            Leaderboard 🏆
          </h1>
          <p className="text-[0.85rem] text-[#8e8e93]">
            Хамгийн өндөр looksmax оноотой хэрэглэгчид
          </p>
        </div>

        {/* Top 3 podium */}
        {!loading && data.length >= 3 && (
          <div className="flex items-end justify-center gap-3 mb-8">
            {/* 2nd */}
            <div className="flex flex-col items-center gap-2 pb-0">
              <div className="relative">
                {data[1].avatarUrl
                  ? <Image src={data[1].avatarUrl} alt={data[1].username} width={64} height={64}
                      className="rounded-full object-cover border-4 border-[#c0c0c0]" style={{ aspectRatio: "1" }} />
                  : <div className="w-16 h-16 rounded-full bg-gray-200 border-4 border-[#c0c0c0] flex items-center justify-center text-2xl">👤</div>
                }
                <span className="absolute -bottom-1 -right-1 text-xl">🥈</span>
              </div>
              <p className="text-[0.78rem] font-bold text-[#1c1c1e] max-w-[80px] truncate text-center">@{data[1].username}</p>
              <div className="px-3 py-1.5 rounded-xl text-[0.82rem] font-extrabold text-white"
                style={{ background: "linear-gradient(135deg,#9ca3af,#6b7280)", minWidth: 64, textAlign: "center" }}>
                {data[1].lookScore}
              </div>
              <div className="w-20 h-20 rounded-t-xl bg-[#e5e7eb]" />
            </div>

            {/* 1st */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                {data[0].avatarUrl
                  ? <Image src={data[0].avatarUrl} alt={data[0].username} width={80} height={80}
                      className="rounded-full object-cover border-4 border-[#fbbf24]" style={{ aspectRatio: "1" }} />
                  : <div className="w-20 h-20 rounded-full bg-yellow-100 border-4 border-[#fbbf24] flex items-center justify-center text-3xl">👤</div>
                }
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl">👑</span>
                <span className="absolute -bottom-1 -right-1 text-xl">🥇</span>
              </div>
              <p className="text-[0.85rem] font-extrabold text-[#1c1c1e] max-w-[90px] truncate text-center">@{data[0].username}</p>
              <div className="px-4 py-2 rounded-xl text-[0.88rem] font-extrabold text-white"
                style={{ background: "linear-gradient(270deg,#9333ea,#c084fc,#7c3aed)", minWidth: 72, textAlign: "center", boxShadow: "0 4px 16px rgba(147,51,234,0.4)" }}>
                {data[0].lookScore}
              </div>
              <div className="w-20 h-28 rounded-t-xl" style={{ background: "linear-gradient(270deg,#9333ea,#7c3aed)" }} />
            </div>

            {/* 3rd */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                {data[2].avatarUrl
                  ? <Image src={data[2].avatarUrl} alt={data[2].username} width={56} height={56}
                      className="rounded-full object-cover border-4 border-[#cd7f32]" style={{ aspectRatio: "1" }} />
                  : <div className="w-14 h-14 rounded-full bg-orange-100 border-4 border-[#cd7f32] flex items-center justify-center text-2xl">👤</div>
                }
                <span className="absolute -bottom-1 -right-1 text-xl">🥉</span>
              </div>
              <p className="text-[0.75rem] font-bold text-[#1c1c1e] max-w-[72px] truncate text-center">@{data[2].username}</p>
              <div className="px-3 py-1.5 rounded-xl text-[0.78rem] font-extrabold text-white"
                style={{ background: "linear-gradient(135deg,#cd7f32,#b45309)", minWidth: 56, textAlign: "center" }}>
                {data[2].lookScore}
              </div>
              <div className="w-20 h-14 rounded-t-xl bg-[#fed7aa]" />
            </div>
          </div>
        )}

        {/* Full list — shows from rank 1 if <3 entries, else from rank 4 */}
        <div className="flex flex-col gap-2">
          {loading
            ? [...Array(5)].map((_, i) => (
                <div key={i} className="h-16 rounded-2xl bg-white/60 animate-pulse" />
              ))
            : (data.length >= 3 ? data.slice(3) : data).map((e) => (
                <div key={e.rank}
                  className="flex items-center gap-4 px-5 py-3 rounded-2xl bg-white/70 border border-white/80"
                  style={{ backdropFilter: "blur(12px)", boxShadow: "0 2px 12px rgba(147,51,234,0.06)" }}>
                  <span className="text-[0.85rem] font-extrabold text-[#aeaeb2] w-6 text-center shrink-0">
                    {MEDAL[e.rank] ?? e.rank}
                  </span>
                  {e.avatarUrl
                    ? <Image src={e.avatarUrl} alt={e.username} width={40} height={40}
                        className="rounded-full object-cover shrink-0 border-2 border-purple-100" style={{ aspectRatio: "1" }} />
                    : <div className="w-10 h-10 rounded-full bg-purple-50 border-2 border-purple-100 flex items-center justify-center text-lg shrink-0">👤</div>
                  }
                  <p className="flex-1 text-[0.88rem] font-bold text-[#1c1c1e] truncate">@{e.username}</p>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[1.1rem] font-extrabold" style={{ color: scoreColor(e.lookScore) }}>
                      {e.lookScore}
                    </span>
                    <span className="text-[0.65rem] text-[#aeaeb2] font-semibold">/100</span>
                  </div>
                </div>
              ))
          }
          {!loading && data.length === 0 && (
            <div className="text-center py-16">
              <p className="text-[2rem] mb-3">🏆</p>
              <p className="text-[0.9rem] font-bold text-[#1c1c1e] mb-1">Leaderboard хоосон байна</p>
              <p className="text-[0.8rem] text-[#8e8e93]">Шинжилгээ хийж эхний байранд орно уу!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
