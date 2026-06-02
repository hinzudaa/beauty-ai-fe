"use client";
import { useState, useRef } from "react";
import Image from "next/image";

const BADGE = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/15 border border-gold/30 text-gold text-[0.68rem] tracking-[0.14em] uppercase font-medium font-sans";
const LABEL = "text-[0.68rem] tracking-[0.18em] uppercase font-medium text-white/35 font-sans";
const CARD  = "bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm";

const MOCK = {
  faceShape: "Зууван",
  hair: [
    { name: "Textured Lob",          length: "Богино-дунд", desc: "Jaw line дороос 5–8 cm урт. Зууван нүүрэнд хамгийн их тохиромжтой. Дурын текстурт ажилладаг." },
    { name: "Curtain Bangs + Layers", length: "Урт",         desc: "Face-framing layer нэмбэл нүүрийг зөөлөн тойрогдуулна." },
    { name: "Sleek Low Bun",          length: "Урт",         desc: "Ёслол болон ажлын үед ideal. Нүүрний бүх онцлогийг тодотгоно." },
    { name: "Wolf Cut",               length: "Дунд-Урт",   desc: "Volume-rich. Зузаан ба дунд зузааны үсэнд хамгийн сайн." },
  ],
  makeup: [
    { name: "No-Makeup Makeup", desc: "Tinted moisturizer, cream blush, clear gloss. Байгалийн гоо сайхныг онцолно.", colors: ["#e8b4a0","#d4957a","#f5e6d3"] },
    { name: "Soft Glam",        desc: "Warm eyeshadow, defined lash line, satin lip. Ёслол болон date-д тохиромжтой.", colors: ["#c8956c","#8b5e52","#e8c4a0"] },
    { name: "Monochromatic",    desc: "Нэг өнгийг нүд, хацар, уруул дээр — cohesive look.", colors: ["#d4a0a0","#c08080","#e8c8c8"] },
  ],
};

export default function HairstylePage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<typeof MOCK | null>(null);
  const [tab, setTab] = useState<"hair" | "makeup">("hair");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) { setPreview(URL.createObjectURL(file)); setResult(null); }
  function analyze() { setLoading(true); setTimeout(() => { setLoading(false); setResult(MOCK); }, 2000); }

  return (
    <div className="min-h-screen px-6 md:px-12 lg:px-20 pt-14 pb-24">

      {/* ── HERO ── */}
      <section className="mb-16">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div className="max-w-2xl">
            <span className={BADGE}>✦ &nbsp;03 · Үс · Грим</span>
            <h1 className="mt-5" style={{ fontSize: "clamp(3rem, 6vw, 5rem)", letterSpacing: "-0.03em", lineHeight: 1.04 }}>
              Үс засал &<br />
              <span className="text-gold">Грим</span>
            </h1>
            <p className="mt-5 text-base text-white/45 font-sans max-w-sm" style={{ lineHeight: 1.8 }}>
              Зургаа upload хийж нүүрний хэлбэрт тохирсон үс засал, грим зөвлөмж авах.
            </p>
          </div>
          <div className="shrink-0 flex flex-col items-start md:items-end gap-1 pb-1">
            <p className="text-3xl font-kenoky text-white">07</p>
            <p className={LABEL}>Зөвлөмжийн тоо</p>
          </div>
        </div>
        <div className="mt-10 h-px w-full bg-gradient-to-r from-gold/40 via-gold/10 to-transparent" />
      </section>

      {/* ── SPLIT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

        {/* LEFT — upload */}
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
                <p className="text-sm text-white/30 font-sans" style={{ letterSpacing: "0.06em" }}>Дахин дарж солих</p>
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
                  <p className="text-sm text-white/25 font-sans">Урд тал харсан, тодорхой зураг хамгийн сайн</p>
                </div>
              </div>
            )}
          </div>

          {preview && !loading && !result && (
            <button onClick={analyze}
              className="w-full py-4 rounded-2xl text-sm text-black bg-gold font-semibold font-sans hover:opacity-85 transition-opacity shadow-[0_4px_30px_rgba(192,132,216,0.25)]"
              style={{ letterSpacing: "0.1em" }}>
              Шинжлэх →
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
              <p className="text-base text-white/70 font-sans">Шинжилж байна...</p>
            </div>
          )}

          {result && (
            <button onClick={() => { setPreview(null); setResult(null); }}
              className="w-full py-3.5 rounded-2xl text-sm text-white/30 bg-white/[0.02] border border-white/[0.06] font-sans hover:text-white/55 transition-colors"
              style={{ letterSpacing: "0.08em" }}>
              Дахин шинжлэх
            </button>
          )}
        </div>

        {/* RIGHT — info or results */}
        {!result && !loading && (
          <div className="space-y-4 lg:pt-2">
            <p className={`${LABEL} mb-4`}>Юу авах вэ</p>
            {[
              { icon: "◈", label: "Үс засал",  desc: "Нүүрний хэлбэрт тохирсон 4 үс заслын зөвлөмж" },
              { icon: "◉", label: "Грим look",  desc: "Арьсны тонд нийцсэн 3 грим стиль + өнгөний палет" },
              { icon: "✦", label: "Хувийн гид", desc: "Таны нүүрний онцлогт тулгуурласан зөвлөмж" },
            ].map((f) => (
              <div key={f.label} className={`${CARD} p-5 flex gap-4 items-start hover:border-gold/20 transition-colors group`}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gold/8 border border-gold/20 shrink-0 group-hover:bg-gold/12 transition-colors">
                  <span className="text-gold/70 text-sm">{f.icon}</span>
                </div>
                <div>
                  <p className="text-sm text-white/80 font-sans font-medium mb-1">{f.label}</p>
                  <p className="text-sm text-white/35 font-sans" style={{ lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {result && (
          <div className="animate-fade-up lg:pt-2 space-y-4">
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-gold/[0.05] border border-gold/22">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gold/12 border border-gold/25 shrink-0">
                <span className="text-gold text-sm">◈</span>
              </div>
              <div>
                <p className={LABEL}>Нүүрний хэлбэр</p>
                <p className="text-base text-white/80 font-sans mt-1">{result.faceShape} нүүр</p>
              </div>
            </div>

            <div className="flex gap-2">
              {(["hair", "makeup"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-6 py-2.5 rounded-full text-sm font-sans font-medium transition-all ${
                    tab === t
                      ? "bg-gold text-black shadow-[0_2px_16px_rgba(192,132,216,0.3)]"
                      : "bg-white/[0.04] text-white/45 border border-white/[0.08] hover:text-white/75"
                  }`}>
                  {t === "hair" ? "Үс засал" : "Грим"}
                </button>
              ))}
            </div>

            {tab === "hair" && (
              <div className="space-y-3">
                {result.hair.map((h) => (
                  <div key={h.name} className={`${CARD} p-5 hover:border-gold/20 transition-colors`}>
                    <div className="flex items-start justify-between mb-2.5">
                      <h3 style={{ fontSize: "0.95rem", letterSpacing: "-0.01em", fontFamily: "var(--font-kenoky)", fontWeight: 300, color: "#ede0f8" }}>{h.name}</h3>
                      <span className="text-[0.62rem] text-white/35 font-sans px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.07] shrink-0 ml-3">{h.length}</span>
                    </div>
                    <p className="text-sm text-white/50 font-sans" style={{ lineHeight: 1.7 }}>{h.desc}</p>
                  </div>
                ))}
              </div>
            )}

            {tab === "makeup" && (
              <div className="space-y-3">
                {result.makeup.map((m) => (
                  <div key={m.name} className={`${CARD} p-5 hover:border-gold/20 transition-colors`}>
                    <div className="flex items-center justify-between mb-2.5">
                      <h3 style={{ fontSize: "0.95rem", letterSpacing: "-0.01em", fontFamily: "var(--font-kenoky)", fontWeight: 300, color: "#ede0f8" }}>{m.name}</h3>
                      <div className="flex gap-1.5">
                        {m.colors.map((c) => (
                          <div key={c} className="w-5 h-5 rounded-full border border-white/10" style={{ background: c }} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-white/50 font-sans" style={{ lineHeight: 1.7 }}>{m.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
