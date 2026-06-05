"use client";

import { useState } from "react";
import { siteUrl } from "@/config/site";
import { tokenStore } from "@/utils/request";
import type { GeneratedLook } from "@/apis/analyze";

interface Props {
  lookScore:  number;
  looks:      GeneratedLook[];
  username:   string | null;
  onClose:    () => void;
}

export default function LeaderboardConsent({ lookScore, looks, username, onClose }: Props) {
  const [selected, setSelected] = useState<string | null>(looks[0]?.imageUrl ?? null);
  const [loading,  setLoading]  = useState(false);
  const [done,     setDone]     = useState(false);

  async function consent(show: boolean) {
    setLoading(true);
    try {
      await fetch(`${siteUrl}/auth/leaderboard-consent`, {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${tokenStore.get()}`,
        },
        body: JSON.stringify({ show, avatarUrl: show ? selected : undefined }),
      });
      setDone(true);
      setTimeout(onClose, 1500);
    } catch {
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-4 pt-[72px]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div className="relative z-[1] w-full max-w-[420px] rounded-[28px] overflow-hidden"
        style={{
          background:     "rgba(255,255,255,0.97)",
          backdropFilter: "blur(20px)",
          boxShadow:      "0 24px 64px rgba(0,0,0,0.18)",
          border:         "1px solid rgba(255,255,255,0.9)",
          maxHeight:      "90vh",
          overflowY:      "auto",
        }}>

        <div className="h-1 w-full shrink-0" style={{ background: "linear-gradient(270deg,#9333ea,#c084fc,#7c3aed)" }} />

        <div className="p-6">
          {done ? (
            <div className="text-center py-6">
              <div className="text-[3rem] mb-3">🏆</div>
              <p className="text-[1rem] font-extrabold text-[#1c1c1e]">Leaderboard-д нэмэгдлээ!</p>
              <p className="text-[0.82rem] text-[#8e8e93] mt-1">Ranking хуудасд харагдана</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="text-center mb-5">
                <p className="text-[0.72rem] font-bold text-[#9333ea] uppercase tracking-[0.1em] mb-1">🏆 Leaderboard</p>
                <h2 className="text-[1.15rem] font-extrabold text-[#1c1c1e] mb-1">
                  Оноо: <span style={{ color: "#9333ea" }}>{lookScore}/100</span>
                </h2>
                {username && <p className="text-[0.78rem] text-[#8e8e93]">@{username}</p>}
              </div>

              {/* Image picker */}
              {looks.length > 0 && (
                <div className="mb-5">
                  <p className="text-[0.75rem] font-bold text-[#6e6e73] uppercase tracking-[0.08em] mb-3">
                    Leaderboard-д харуулах зургаа сонгоно уу
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {looks.map((look) => (
                      <button
                        key={look.imageUrl}
                        type="button"
                        onClick={() => setSelected(look.imageUrl)}
                        className="relative rounded-[14px] overflow-hidden cursor-pointer border-none p-0 group"
                        style={{
                          aspectRatio: "3/4",
                          outline: selected === look.imageUrl
                            ? "3px solid #9333ea"
                            : "2px solid transparent",
                          boxShadow: selected === look.imageUrl
                            ? "0 0 0 3px rgba(147,51,234,0.2)"
                            : "none",
                          borderRadius: 14,
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={look.imageUrl} alt={look.name}
                          className="w-full h-full object-cover" />

                        {/* Selected checkmark */}
                        {selected === look.imageUrl && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                            style={{ background: "#9333ea" }}>
                            <span className="text-white text-[0.7rem] font-black">✓</span>
                          </div>
                        )}

                        {/* Name label */}
                        <div className="absolute bottom-0 left-0 right-0 px-2 pb-2 pt-6"
                          style={{ background: "linear-gradient(to top,rgba(0,0,0,0.7),transparent)" }}>
                          <p className="text-[0.65rem] font-bold text-white text-center">{look.name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!username && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 mb-4">
                  <p className="text-[0.78rem] text-amber-700">
                    ⚠️ Leaderboard-д нэмэгдэхийн тулд эхлээд хэрэглэгчийн нэр үүсгэнэ үү
                  </p>
                </div>
              )}

              <p className="text-[0.82rem] text-[#6e6e73] text-center mb-5 leading-[1.5]">
                Сонгосон зург болон оноог leaderboard-д харуулах уу?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => consent(false)}
                  disabled={loading}
                  className="flex-1 py-3 rounded-full font-bold text-[0.88rem] border border-[rgba(0,0,0,0.1)] text-[#6e6e73] cursor-pointer bg-transparent transition-all disabled:opacity-50"
                >
                  Үгүй
                </button>
                <button
                  onClick={() => consent(true)}
                  disabled={loading || !username || !selected}
                  className="flex-1 py-3 rounded-full font-extrabold text-[0.88rem] text-white border-none cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: "linear-gradient(270deg,#9333ea,#7c3aed)",
                    boxShadow:  "0 4px 16px rgba(147,51,234,0.35)",
                  }}
                >
                  {loading ? "..." : "🏆 Тийм"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
