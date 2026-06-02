"use client";
import Image from "next/image";
import { useState, useRef } from "react";

const BADGE = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.1] text-white/60 text-[0.68rem] tracking-[0.14em] uppercase font-medium font-sans";
const LABEL = "text-[0.68rem] tracking-[0.18em] uppercase font-medium text-white/30 font-sans";
const CARD  = "bg-white/[0.04] border border-white/[0.07] rounded-[20px] backdrop-blur-xl";

const MOCK_MAKEUP = {
  skinType: "Хосолмол (Combination)",
  undertone: "Warm",
  looks: [
    {
      name: "Daily Natural",
      occasion: "Өдөр тутмын",
      steps: ["SPF moisturizer", "Tinted foundation (light coverage)", "Cream blush (peach/coral)", "Clear brow gel", "Nude lip gloss"],
      colors: ["#f5e6d3", "#e8c4a0", "#d4957a"],
      tip: "Skin prep хамгийн чухал — hydration foundation-аас илүү чухал.",
    },
    {
      name: "Soft Glam",
      occasion: "Ажил / Уулзалт",
      steps: ["Full coverage foundation", "Warm bronzer contour", "Shimmer eyeshadow (champagne)", "Mascara x2", "Mauve satin lip"],
      colors: ["#c8956c", "#8b5e52", "#e8c4a0"],
      tip: "Champagne shimmer зууван нүүрэнд гэрэлтсэн мэт харагдуулна.",
    },
    {
      name: "Night Glam",
      occasion: "Гала / Party",
      steps: ["Flawless base + setting powder", "Smoky eye (brown-black)", "Wing liner", "False lashes", "Deep berry lip"],
      colors: ["#3a1a2a", "#8b3a5a", "#c84080"],
      tip: "Нүд тод бол уруул nude — хоёр зэрэг bold биш.",
    },
  ],
  lipPalette: ["#c84060", "#d4957a", "#e8c4a0", "#8b3a3a", "#a04060"],
};

const INFO_CARDS = [
  { icon: "☀", label: "Өдрийн look", desc: "Natural, minimal, skin-first" },
  { icon: "✦", label: "Night Glam", desc: "Bold, dramatic, editorial" },
  { icon: "◉", label: "Lip color палет", desc: "Seasonal tones" },
  { icon: "◈", label: "Step-by-step гид", desc: "Алхам алхмаар заана" },
];

export default function MakeupPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<typeof MOCK_MAKEUP | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) { setPreview(URL.createObjectURL(file)); setResult(null); }
  function analyze() { setLoading(true); setTimeout(() => { setLoading(false); setResult(MOCK_MAKEUP); }, 2000); }

  return (
    <div className="min-h-screen px-6 md:px-12 lg:px-20 pt-16 pb-24">

      {/* ── HERO ── */}
      <section className="mb-16">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div className="max-w-2xl">
            <span className={BADGE}>✦ &nbsp;06 · Makeup</span>
            <h1 className="mt-5" style={{ fontSize: "clamp(3rem, 6vw, 5rem)", letterSpacing: "-0.03em", lineHeight: 1.04 }}>
              Грим<br />
              <span className="text-gold">Зөвлөгөө</span>
            </h1>
            <p className="mt-5 text-base text-white/55 font-sans max-w-sm" style={{ lineHeight: 1.8 }}>
              Царайны дүн шинжилгээнд тулгуурлан өдрийн болон night look зөвлөмж авах.
            </p>
          </div>
          <div className="shrink-0 flex flex-col items-start md:items-end gap-1 pb-1">
            <p className="text-3xl font-kenoky text-white">MUA</p>
            <p className={LABEL}>AI Makeup Artist</p>
          </div>
        </div>
        <div className="mt-10 h-px w-full bg-gradient-to-r from-white/20 via-white/5 to-transparent" />
      </section>

      {/* ── MAIN SPLIT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

        {/* LEFT */}
        <div className="space-y-4">
          <div
            className={`rounded-[24px] cursor-pointer transition-all overflow-hidden ${
              preview
                ? "border border-white/[0.14] bg-white/[0.04]"
                : "border border-dashed border-white/[0.1] bg-white/[0.02] hover:border-white/[0.2] hover:bg-white/[0.04]"
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
                    className="object-cover rounded-2xl border border-white/[0.12] shadow-[0_0_60px_rgba(168,100,255,0.12)]" />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-lg">
                    <span className="text-black text-xs font-bold">✦</span>
                  </div>
                </div>
                <p className="text-sm text-white/30 font-sans" style={{ letterSpacing: "0.06em" }}>Дахин дарж зураг солих</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-5 p-14" style={{ minHeight: "22rem" }}>
                <div className="relative">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center bg-white/[0.06] border border-white/[0.12]">
                    <span className="text-white/70 text-3xl">✦</span>
                  </div>
                  <div className="absolute inset-0 rounded-full bg-white/[0.08] animate-ping" style={{ animationDuration: "2.5s" }} />
                </div>
                <div className="text-center">
                  <p className="text-base text-white/70 font-sans mb-1.5">Зураг чирж тавих эсвэл дарах</p>
                  <p className="text-sm text-white/30 font-sans" style={{ letterSpacing: "0.04em" }}>JPG · PNG · WEBP · Selfie хамгийн сайн</p>
                </div>
              </div>
            )}
          </div>

          {preview && !loading && !result && (
            <button onClick={analyze}
              className="w-full bg-white text-black rounded-full font-semibold py-3.5 hover:scale-[1.02] hover:opacity-90 transition-all shadow-[0_0_40px_rgba(255,255,255,0.15)] font-sans text-sm"
              style={{ letterSpacing: "0.1em" }}>
              Makeup шинжлэх →
            </button>
          )}

          {loading && (
            <div className={`${CARD} shadow-[0_0_40px_rgba(168,100,255,0.06)] p-10 text-center`}>
              <div className="flex gap-2.5 justify-center mb-5">
                {[0,1,2].map((i) => (
                  <span key={i} className="w-2 h-2 rounded-full inline-block bg-white animate-dot-blink"
                    style={{ animationDelay: `${i * 0.18}s` }} />
                ))}
              </div>
              <p className="text-base text-white/70 font-sans mb-2">Шинжилж байна</p>
              <p className="text-xs text-white/30 font-sans" style={{ letterSpacing: "0.1em" }}>АРЬСНЫ ТОН · UNDERTONE · LOOK ЗАГВАР</p>
            </div>
          )}

          {result && (
            <button onClick={() => { setPreview(null); setResult(null); }}
              className="w-full py-3.5 bg-white/[0.06] text-white/60 border border-white/[0.08] rounded-full hover:text-white hover:border-white/[0.18] transition-all font-sans text-sm"
              style={{ letterSpacing: "0.08em" }}>
              Дахин шинжлэх
            </button>
          )}
        </div>

        {/* RIGHT — info or results */}
        {!result && !loading && (
          <div className="space-y-4 lg:pt-2">
            <p className={`${LABEL} mb-5`}>Юу авах вэ</p>
            {INFO_CARDS.map((f) => (
              <div key={f.label}
                className={`${CARD} shadow-[0_0_40px_rgba(168,100,255,0.06)] flex gap-5 p-5 hover:bg-white/[0.07] hover:border-white/[0.14] transition-all`}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/[0.06] border border-white/[0.1] shrink-0">
                  <span className="text-white/60 text-sm">{f.icon}</span>
                </div>
                <div>
                  <p className="text-sm text-white font-sans font-medium mb-1">{f.label}</p>
                  <p className="text-sm text-white/55 font-sans" style={{ lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {result && (
          <div className="space-y-4 lg:pt-2">
            {/* Skin type + undertone */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Арьсны төрөл", value: result.skinType },
                { label: "Undertone", value: result.undertone },
              ].map((s) => (
                <div key={s.label} className={`${CARD} shadow-[0_0_40px_rgba(168,100,255,0.06)] p-4 text-center hover:bg-white/[0.07] hover:border-white/[0.14] transition-all`}>
                  <p className={`${LABEL} mb-2`}>{s.label}</p>
                  <p className="text-xs text-white/75 font-sans mt-2" style={{ lineHeight: 1.5 }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* 3 look cards */}
            {result.looks.map((look) => (
              <div key={look.name} className={`${CARD} shadow-[0_0_40px_rgba(168,100,255,0.06)] p-5 hover:bg-white/[0.07] hover:border-white/[0.14] transition-all`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-white font-sans font-semibold">{look.name}</p>
                    <p className={`${LABEL} mt-1`}>{look.occasion}</p>
                  </div>
                  <div className="flex gap-1.5">
                    {look.colors.map((c) => (
                      <div key={c} className="w-5 h-5 rounded-full border border-white/10" style={{ background: c }} />
                    ))}
                  </div>
                </div>
                <ul className="space-y-2 mb-4">
                  {look.steps.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm text-white/55 font-sans" style={{ lineHeight: 1.6 }}>
                      <span className="text-white/25 shrink-0 text-xs mt-0.5">{i + 1}.</span>{step}
                    </li>
                  ))}
                </ul>
                <div className="bg-white/[0.03] border border-white/[0.07] rounded-[12px] p-3">
                  <p className="text-xs text-white/45 font-sans" style={{ lineHeight: 1.7 }}>
                    <span className="text-white/25 mr-2">✦</span>{look.tip}
                  </p>
                </div>
              </div>
            ))}

            {/* Lip palette */}
            <div className={`${CARD} shadow-[0_0_40px_rgba(168,100,255,0.06)] p-5`}>
              <p className={`${LABEL} mb-4`}>Lip color палет</p>
              <div className="flex gap-3">
                {result.lipPalette.map((c) => (
                  <div key={c} className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full border border-white/10 shadow-md" style={{ background: c }} />
                    <span className="text-[9px] text-white/30 font-sans">{c}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
