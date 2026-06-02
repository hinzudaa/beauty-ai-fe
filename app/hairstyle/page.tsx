"use client";
import { useState, useRef } from "react";
import Image from "next/image";

const BADGE = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.1] text-white/60 text-[0.68rem] tracking-[0.14em] uppercase font-medium font-sans";
const LABEL = "text-[0.68rem] tracking-[0.18em] uppercase font-medium text-white/30 font-sans";
const CARD  = "bg-white/[0.04] border border-white/[0.07] rounded-[20px] backdrop-blur-xl";

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
    <div className="min-h-screen px-6 md:px-12 lg:px-20 pt-16 pb-24">

      {/* ── HERO ── */}
      <section className="mb-16">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div className="max-w-2xl">
            <span className={BADGE}>✦ &nbsp;03 · Үс · Грим</span>
            <h1 className="mt-5" style={{ fontSize: "clamp(3rem, 6vw, 5rem)", letterSpacing: "-0.03em", lineHeight: 1.04 }}>
              Үс засал &<br />
              <span className="text-white/80">Грим</span>
            </h1>
            <p className="mt-5 text-base text-white/55 font-sans max-w-sm" style={{ lineHeight: 1.8 }}>
              Зургаа upload хийж нүүрний хэлбэрт тохирсон үс засал, грим зөвлөмж авах.
            </p>
          </div>
          <div className="shrink-0 flex flex-col items-start md:items-end gap-1 pb-1">
            <p className="text-3xl font-kenoky text-white">07</p>
            <p className={LABEL}>Зөвлөмжийн тоо</p>
          </div>
        </div>
        <div className="mt-10 h-px w-full bg-gradient-to-r from-white/20 via-white/5 to-transparent" />
      </section>

      {/* ── SPLIT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

        {/* LEFT — upload */}
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
                <p className="text-sm text-white/30 font-sans" style={{ letterSpacing: "0.06em" }}>Дахин дарж солих</p>
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
                  <p className="text-sm text-white/30 font-sans">Урд тал харсан, тодорхой зураг хамгийн сайн</p>
                </div>
              </div>
            )}
          </div>

          {preview && !loading && !result && (
            <button onClick={analyze}
              className="w-full bg-white text-black rounded-full font-semibold py-3.5 hover:scale-[1.02] hover:opacity-90 transition-all shadow-[0_0_40px_rgba(255,255,255,0.15)] font-sans text-sm"
              style={{ letterSpacing: "0.1em" }}>
              Шинжлэх →
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
              <p className="text-base text-white/70 font-sans">Шинжилж байна...</p>
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
            <p className={`${LABEL} mb-4`}>Юу авах вэ</p>
            {[
              { icon: "◈", label: "Үс засал",  desc: "Нүүрний хэлбэрт тохирсон 4 үс заслын зөвлөмж" },
              { icon: "◉", label: "Грим look",  desc: "Арьсны тонд нийцсэн 3 грим стиль + өнгөний палет" },
              { icon: "✦", label: "Хувийн гид", desc: "Таны нүүрний онцлогт тулгуурласан зөвлөмж" },
            ].map((f) => (
              <div key={f.label} className={`${CARD} shadow-[0_0_40px_rgba(168,100,255,0.06)] p-5 flex gap-4 items-start hover:bg-white/[0.07] hover:border-white/[0.14] transition-all group`}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/[0.06] border border-white/[0.1] shrink-0 transition-colors">
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
          <div className="animate-fade-up lg:pt-2 space-y-4">
            {/* Face shape badge */}
            <div className={`${CARD} shadow-[0_0_40px_rgba(168,100,255,0.06)] flex items-center gap-4 p-5`}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/[0.06] border border-white/[0.1] shrink-0">
                <span className="text-white/60 text-sm">◈</span>
              </div>
              <div>
                <p className={LABEL}>Нүүрний хэлбэр</p>
                <p className="text-base text-white font-sans mt-1">{result.faceShape} нүүр</p>
              </div>
            </div>

            {/* Tab buttons */}
            <div className="flex gap-2">
              {(["hair", "makeup"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-6 py-2.5 rounded-full text-sm font-sans font-medium transition-all ${
                    tab === t
                      ? "bg-white text-black"
                      : "bg-white/[0.04] text-white/50 border border-white/[0.08] hover:text-white/80"
                  }`}>
                  {t === "hair" ? "Үс засал" : "Грим"}
                </button>
              ))}
            </div>

            {tab === "hair" && (
              <div className="space-y-3">
                {result.hair.map((h) => (
                  <div key={h.name} className={`${CARD} shadow-[0_0_40px_rgba(168,100,255,0.06)] p-5 hover:bg-white/[0.07] hover:border-white/[0.14] transition-all`}>
                    <div className="flex items-start justify-between mb-2.5">
                      <h3 style={{ fontSize: "0.95rem", letterSpacing: "-0.01em", fontFamily: "var(--font-kenoky)", fontWeight: 300, color: "rgba(255,255,255,0.9)" }}>{h.name}</h3>
                      <span className="text-[0.62rem] text-white/30 font-sans px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.07] shrink-0 ml-3">{h.length}</span>
                    </div>
                    <p className="text-sm text-white/55 font-sans" style={{ lineHeight: 1.7 }}>{h.desc}</p>
                  </div>
                ))}
              </div>
            )}

            {tab === "makeup" && (
              <div className="space-y-3">
                {result.makeup.map((m) => (
                  <div key={m.name} className={`${CARD} shadow-[0_0_40px_rgba(168,100,255,0.06)] p-5 hover:bg-white/[0.07] hover:border-white/[0.14] transition-all`}>
                    <div className="flex items-center justify-between mb-2.5">
                      <h3 style={{ fontSize: "0.95rem", letterSpacing: "-0.01em", fontFamily: "var(--font-kenoky)", fontWeight: 300, color: "rgba(255,255,255,0.9)" }}>{m.name}</h3>
                      <div className="flex gap-1.5">
                        {m.colors.map((c) => (
                          <div key={c} className="w-5 h-5 rounded-full border border-white/10" style={{ background: c }} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-white/55 font-sans" style={{ lineHeight: 1.7 }}>{m.desc}</p>
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
