"use client";

import { useState, useEffect, useCallback } from "react";
import { siteUrl } from "@/config/site";
import { tokenStore } from "@/utils/request";

interface Props {
  onDone: (username: string) => void;
}

export default function UsernameModal({ onDone }: Props) {
  const [value,     setValue]     = useState("");
  const [status,    setStatus]    = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const check = useCallback(async (name: string) => {
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(name)) { setStatus("invalid"); return; }
    setStatus("checking");
    try {
      const res = await fetch(`${siteUrl}/auth/check-username/${encodeURIComponent(name)}`, {
        headers: { Authorization: `Bearer ${tokenStore.get()}` },
      });
      const d = await res.json();
      setStatus(d.available ? "available" : "taken");
    } catch { setStatus("idle"); }
  }, []);

  useEffect(() => {
    if (!value) { setStatus("idle"); return; }
    const t = setTimeout(() => check(value), 500);
    return () => clearTimeout(t);
  }, [value, check]);

  async function handleSave() {
    if (status !== "available") return;
    setSaving(true); setError(null);
    try {
      const res = await fetch(`${siteUrl}/auth/username`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenStore.get()}` },
        body: JSON.stringify({ username: value }),
      });
      const d = await res.json();
      if (!res.ok) { setError(d.error ?? "Алдаа гарлаа"); return; }
      onDone(value);
    } catch { setError("Алдаа гарлаа"); }
    finally { setSaving(false); }
  }

  const statusIcon = status === "checking"  ? "⟳"
                   : status === "available" ? "✓"
                   : status === "taken"     ? "✗"
                   : status === "invalid"   ? "✗"
                   : "";
  const statusColor = status === "available" ? "#16a34a"
                    : (status === "taken" || status === "invalid") ? "#ef4444"
                    : "#8e8e93";

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-5"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-[380px] rounded-[28px] p-8 relative overflow-hidden"
        style={{
          background:      "rgba(255,255,255,0.95)",
          backdropFilter:  "blur(20px)",
          boxShadow:       "0 24px 64px rgba(0,0,0,0.2)",
          border:          "1px solid rgba(255,255,255,0.9)",
        }}>
        {/* Top shimmer */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent" />

        <div className="text-center mb-7">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "linear-gradient(270deg,#9333ea,#7c3aed)", boxShadow: "0 8px 24px rgba(147,51,234,0.35)" }}>
            <span className="text-[1.8rem]">✨</span>
          </div>
          <h2 className="text-[1.4rem] font-extrabold tracking-[-0.02em] text-[#1c1c1e] mb-1">
            Хэрэглэгчийн нэр
          </h2>
          <p className="text-[0.82rem] text-[#8e8e93] leading-[1.5]">
            Leaderboard-д харагдах нэрээ сонгоно уу.<br />
            1 сарын дараа өөрчлөх боломжтой.
          </p>
        </div>

        <div className="relative mb-2">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9333ea] font-bold text-[0.9rem]">@</span>
          <input
            type="text"
            placeholder="username"
            value={value}
            onChange={(e) => setValue(e.target.value.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20))}
            className="w-full pl-9 pr-10 py-4 rounded-[14px] text-[0.95rem] font-semibold text-[#1c1c1e] outline-none transition-all"
            style={{
              background: "rgba(147,51,234,0.05)",
              border:     `1.5px solid ${status === "available" ? "#16a34a" : status === "taken" || status === "invalid" ? "#ef4444" : "rgba(147,51,234,0.2)"}`,
            }}
            autoFocus
            autoComplete="off"
          />
          {statusIcon && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[0.9rem] font-bold"
              style={{ color: statusColor }}>
              {statusIcon}
            </span>
          )}
        </div>

        <p className="text-[0.72rem] mb-6 h-4" style={{ color: statusColor }}>
          {status === "available" ? "✓ Боломжтой нэр" :
           status === "taken"     ? "✗ Энэ нэр аль хэдийн бүртгэлтэй" :
           status === "invalid"   ? "✗ 3–20 тэмдэгт, үсэг/тоо/_ зөвхөн" :
           status === "checking"  ? "Шалгаж байна..." : ""}
        </p>

        {error && (
          <p className="text-[0.8rem] text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2 mb-4">{error}</p>
        )}

        <button
          onClick={handleSave}
          disabled={status !== "available" || saving}
          className="w-full py-4 rounded-full font-extrabold text-[0.95rem] text-white border-none transition-all"
          style={{
            background: status === "available" && !saving
              ? "linear-gradient(270deg,#9333ea,#c084fc,#7c3aed)"
              : "rgba(0,0,0,0.08)",
            color:      status === "available" && !saving ? "#fff" : "#c4b5fd",
            cursor:     status === "available" && !saving ? "pointer" : "not-allowed",
            boxShadow:  status === "available" && !saving ? "0 6px 24px rgba(147,51,234,0.4)" : "none",
          }}>
          {saving ? "Хадгалж байна..." : "Хадгалах →"}
        </button>
      </div>
    </div>
  );
}
