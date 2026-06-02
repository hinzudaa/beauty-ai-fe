"use client";
import Image from "next/image";
import { useState, useRef } from "react";

const BADGE = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/15 border border-gold/30 text-gold text-[0.68rem] tracking-[0.14em] uppercase font-medium font-sans";
const LABEL = "text-[0.68rem] tracking-[0.18em] uppercase font-medium text-white/35 font-sans";
const CARD  = "bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm";

const MOCK = {
  faceShape: "Зууван (Oval)",
  skinTone: "Дулаан дунд",
  styleType: "Байгалийн минималист",
  recommendations: [
    "V-neck болон off-shoulder загвар таны нүүрний хэлбэрт хамгийн тохиромжтой.",
    "Drop болон hoop earring — jaw line-ийг онцолно.",
    "Terracotta, camel, olive өнгөнүүд арьсны тонд яг нийцнэ.",
    "Structured blazer + wide-leg trousers — таны style type-д бүрэн тохирно.",
    "Нэг том jewelry piece сонго, олон давхарлахаас зайлс.",
  ],
  colorPalette: ["#c8956c", "#8b6f47", "#6b7c5c", "#d4a853", "#a0522d"],
};

const FEATURES = [
  { icon: "◈", label: "Нүүрний хэлбэр", desc: "Oval, round, square, heart — AI тодорхойлно" },
  { icon: "◉", label: "Арьсны тон",      desc: "Warm, cool, neutral undertone шинжилгээ" },
  { icon: "✦", label: "Style type",       desc: "Таны гоо сайхны хувийн дүр төрхийг олно" },
];

export default function AnalyzePage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<typeof MOCK | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) { setPreview(URL.createObjectURL(file)); setResult(null); }
  function analyze() { setLoading(true); setTimeout(() => { setLoading(false); setResult(MOCK); }, 2200); }

  return (
    <div className="min-h-screen px-6 md:px-12 lg:px-20 pt-14 pb-24">

      {/* ── TOP HERO ── */}
      <section className="mb-16">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div className="max-w-2xl">
            <span className={BADGE}>✦ &nbsp;01 · AI Vision</span>
            <h1 className="mt-5" style={{ fontSize: "clamp(3rem, 6vw, 5rem)", letterSpacing: "-0.03em", lineHeight: 1.04 }}>
              Нүүрний<br />
              <span className="text-gold">Шинжилгээ</span>
            </h1>
            <p className="mt-5 text-base text-white/45 font-sans max-w-sm" style={{ lineHeight: 1.8 }}>
              Selfie upload хийж нүүрний хэлбэр, арьсны тон, style type-ийг тодорхойлуулаарай.
            </p>
          </div>
          <div className="shrink-0 flex flex-col items-start md:items-end gap-1 pb-1">
            <p className="text-3xl font-kenoky text-white">AI</p>
            <p className={LABEL}>Powered analysis</p>
          </div>
        </div>
        <div className="mt-10 h-px w-full bg-gradient-to-r from-gold/40 via-gold/10 to-transparent" />
      </section>

      {/* ── MAIN SPLIT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

        {/* LEFT — upload + action */}
        <div className="space-y-4">
          <div
            className={`rounded-3xl cursor-pointer transition-all overflow-hidden ${
              preview
                ? "border border-gold/40 bg-white/[0.03]"
                : "border border-dashed border-white/[0.12] bg-white/[0.02] hover:border-gold/25 hover:bg-white/[0.03]"
            }`}
            style={{ minHeight: "22rem" }}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith("image/")) handleFile(f); }}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
          >
            <input ref={inputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

            {preview ? (
              <div className="flex flex-col items-center justify-center gap-5 p-10 h-full" style={{ minHeight: "22rem" }}>
                <div className="relative">
                  <Image src={preview} alt="preview" width={220} height={220}
                    className="object-cover rounded-2xl border border-gold/30 shadow-[0_0_60px_rgba(192,132,216,0.15)]" />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gold flex items-center justify-center shadow-lg">
                    <span className="text-black text-xs font-bold">✦</span>
                  </div>
                </div>
                <p className="text-sm text-white/30 font-sans" style={{ letterSpacing: "0.06em" }}>Дахин дарж зураг солих</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-5 p-14" style={{ minHeight: "22rem" }}>
                <div className="relative">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center bg-gold/8 border border-gold/20">
                    <span className="text-gold/70 text-3xl">✦</span>
                  </div>
                  <div className="absolute inset-0 rounded-full bg-gold/5 animate-ping" style={{ animationDuration: "2.5s" }} />
                </div>
                <div className="text-center">
                  <p className="text-base text-white/70 font-sans mb-1.5">Зураг чирж тавих эсвэл дарах</p>
                  <p className="text-sm text-white/25 font-sans" style={{ letterSpacing: "0.04em" }}>JPG · PNG · WEBP · Selfie хамгийн сайн</p>
                </div>
              </div>
            )}
          </div>

          {preview && !loading && !result && (
            <button onClick={analyze}
              className="w-full py-4 rounded-2xl text-sm text-black bg-gold font-semibold font-sans hover:opacity-85 transition-opacity shadow-[0_4px_30px_rgba(192,132,216,0.25)]"
              style={{ letterSpacing: "0.1em" }}>
              AI-аар шинжлэх →
            </button>
          )}

          {loading && (
            <div className={`${CARD} p-10 text-center`}>
              <div className="flex gap-2.5 justify-center mb-5">
                {[0,1,2].map((i) => (
                  <span key={i} className="w-2 h-2 rounded-full inline-block bg-gold animate-dot-blink"
                    style={{ animationDelay: `${i * 0.18}s` }} />
                ))}
              </div>
              <p className="text-base text-white/70 font-sans mb-2">Шинжилж байна</p>
              <p className="text-xs text-white/25 font-sans" style={{ letterSpacing: "0.1em" }}>НҮҮРНИЙ ХЭЛБЭР · АРЬСНЫ ТОН · STYLE TYPE</p>
            </div>
          )}

          {result && (
            <button onClick={() => { setPreview(null); setResult(null); }}
              className="w-full py-3.5 rounded-2xl text-sm text-white/35 bg-white/[0.02] border border-white/[0.07] font-sans hover:text-white/60 transition-colors"
              style={{ letterSpacing: "0.08em" }}>
              Дахин шинжлэх
            </button>
          )}
        </div>

        {/* RIGHT — info panel or results */}
        {!result && !loading && (
          <div className="space-y-4 lg:pt-2">
            <p className={`${LABEL} mb-5`}>Юу тодорхойлогдох вэ</p>
            {FEATURES.map((f) => (
              <div key={f.label}
                className="flex gap-5 p-5 rounded-2xl bg-white/[0.025] border border-white/[0.07] hover:border-gold/20 transition-colors group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gold/8 border border-gold/20 shrink-0 group-hover:bg-gold/12 transition-colors">
                  <span className="text-gold text-sm">{f.icon}</span>
                </div>
                <div>
                  <p className="text-sm text-white/80 font-sans font-medium mb-1">{f.label}</p>
                  <p className="text-sm text-white/35 font-sans" style={{ lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </div>
            ))}
            <div className="mt-6 p-5 rounded-2xl bg-gold/[0.04] border border-gold/20">
              <p className="text-xs text-white/40 font-sans" style={{ lineHeight: 1.7, letterSpacing: "0.02em" }}>
                Зургаа upload хийхэд таны нүүрний хэлбэр, арьсны тон, style type-ийг AI шинжилж хувийн зөвлөмж гаргана.
              </p>
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-4 animate-fade-up lg:pt-2">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Нүүрний хэлбэр", value: result.faceShape },
                { label: "Арьсны тон",      value: result.skinTone  },
                { label: "Style type",       value: result.styleType },
              ].map((s) => (
                <div key={s.label} className={`${CARD} p-4 text-center`}>
                  <p className={`${LABEL} mb-2`}>{s.label}</p>
                  <p className="text-xs text-white/75 font-sans mt-2" style={{ lineHeight: 1.5 }}>{s.value}</p>
                </div>
              ))}
            </div>

            <div className={`${CARD} p-5`}>
              <p className={`${LABEL} mb-4`}>Өнгөний палет</p>
              <div className="flex gap-3">
                {result.colorPalette.map((c) => (
                  <div key={c} className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-xl border border-white/10 shadow-md" style={{ background: c }} />
                    <span className="text-[9px] text-white/25 font-sans">{c}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={`${CARD} p-5`}>
              <p className={`${LABEL} mb-4`}>AI зөвлөмж</p>
              <ul className="space-y-3.5">
                {result.recommendations.map((r, i) => (
                  <li key={i} className="flex gap-3.5 text-sm text-white/55 font-sans" style={{ lineHeight: 1.7 }}>
                    <span className="text-gold/70 shrink-0 mt-0.5">—</span>{r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
