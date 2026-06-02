"use client";
import { useState } from "react";

const BADGE = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/15 border border-gold/30 text-gold text-[0.68rem] tracking-[0.14em] uppercase font-medium font-sans";
const LABEL = "text-[0.68rem] tracking-[0.18em] uppercase font-medium text-white/35 font-sans";
const CARD  = "bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm";

const events = [
  { id: "interview", label: "Ажлын ярилцлага", sub: "Professional", icon: "◈" },
  { id: "date",      label: "Date night",       sub: "Evening",      icon: "◉" },
  { id: "casual",    label: "Өдөр тутмын",      sub: "Casual",       icon: "○" },
  { id: "party",     label: "Party / Найр",      sub: "Night out",    icon: "✦" },
  { id: "wedding",   label: "Хурим / Ёслол",    sub: "Formal",       icon: "◇" },
  { id: "sport",     label: "Спорт",             sub: "Active",       icon: "◎" },
];
const seasons = ["Зун", "Намар", "Өвөл", "Хавар"];
const styles  = ["Minimal", "Feminine", "Streetwear", "Classic", "Boho"];

type Outfit = { name: string; items: string[]; colors: string[]; tip: string };
const OUTFITS: Record<string, Outfit[]> = {
  interview: [
    { name: "Power Professional", items: ["Structured blazer (camel/navy)", "High-waist tailored trousers", "Button-up silk blouse", "Block heel pumps", "Leather tote bag"], colors: ["#c8956c","#1e3a5f","#f5f5f0"], tip: "Blazer-ийг unbutton өмсвөл relaxed confidence харагдана." },
    { name: "Smart Minimal",      items: ["White fitted turtleneck", "Wide-leg trousers (charcoal)", "Loafers", "Structured handbag", "Gold necklace"],                      colors: ["#f0f0f0","#4a4a4a","#1a1a1a"], tip: "Цагаан + charcoal хослол ухаалаг, итгэлтэй харагдуулна." },
  ],
  date: [
    { name: "Effortless Chic", items: ["Silk slip dress (dusty rose)", "Strappy heeled sandals", "Small shoulder bag", "Layered necklace"], colors: ["#d4a0a0","#c8956c","#f5f0eb"], tip: "Нэг bold accessory — бусдыг minimal байлга." },
    { name: "Edgy Feminine",   items: ["Fitted leather jacket", "Flowy midi skirt (black)", "Ankle boots", "Crossbody bag"],               colors: ["#2a2a2a","#3d3d3d","#c9a96e"],  tip: "Leather + flowy — feminine ба edgy тэнцвэрийг олно." },
  ],
  casual: [
    { name: "Seoul Casual",    items: ["Oversized graphic tee", "Wide-leg jeans", "Chunky sneakers", "Canvas tote"],   colors: ["#a8d8ea","#f5f5f5","#333"], tip: "Oversized top + wide-leg pants — shoe visible байх хэрэгтэй." },
    { name: "Cozy Minimalist", items: ["Knit cardigan (oatmeal)", "Straight-leg jeans", "White sneakers", "Crossbody"], colors: ["#d4c5a9","#5a7a6a","#fff"],  tip: "Neutral tones-ийг earth accent-аар амилуул." },
  ],
  party:   [{ name: "Night Out Glam",       items: ["Sequin mini skirt", "Fitted black crop top", "Strappy heels", "Clutch", "Statement earrings"], colors: ["#c9a96e","#1a1a1a","#fff"],     tip: "One statement piece — хоёулааг давхарлахгүй." }],
  wedding: [{ name: "Garden Wedding Guest", items: ["Floral midi dress (blush/sage)", "Block heel sandals", "Satin clutch", "Pearl earrings"],    colors: ["#e8d5d5","#8a9e7a","#f5f0eb"], tip: "Цагаан өнгөнөөс зайл. Comfortable shoes — бүтэн өдөр зогсоно." }],
  sport:   [{ name: "Athleisure Chic",      items: ["High-waist leggings (black)", "Sports bra + loose tank", "Chunky sneakers", "Mini backpack"],  colors: ["#1a1a1a","#c9a96e","#fff"],     tip: "Matching set — хурдан, stylish." }],
};

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-sans transition-all ${
        active
          ? "bg-gold text-black font-semibold shadow-[0_2px_16px_rgba(192,132,216,0.3)]"
          : "bg-white/[0.04] text-white/45 border border-white/[0.08] hover:text-white/75 hover:border-white/20"
      }`}>
      {label}
    </button>
  );
}

export default function OutfitPage() {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState("Зун");
  const [selectedStyle, setSelectedStyle] = useState("Minimal");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Outfit[] | null>(null);

  function generate() {
    if (!selectedEvent) return;
    setLoading(true); setResult(null);
    setTimeout(() => { setLoading(false); setResult(OUTFITS[selectedEvent] ?? OUTFITS.casual); }, 1800);
  }

  return (
    <div className="min-h-screen px-6 md:px-12 lg:px-20 pt-14 pb-24">

      {/* ── HERO ── */}
      <section className="mb-16">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div className="max-w-2xl">
            <span className={BADGE}>✦ &nbsp;02 · MVP гол</span>
            <h1 className="mt-5" style={{ fontSize: "clamp(3rem, 6vw, 5rem)", letterSpacing: "-0.03em", lineHeight: 1.04 }}>
              Хувцас<br />
              <span className="text-gold">Генератор</span>
            </h1>
            <p className="mt-5 text-base text-white/45 font-sans max-w-sm" style={{ lineHeight: 1.8 }}>
              Event сонгоод улирал, style-аа тохируулж AI-аар хувцас хослол авах.
            </p>
          </div>
          <div className="shrink-0 flex flex-col items-start md:items-end gap-1 pb-1">
            <p className="text-3xl font-kenoky text-white">06</p>
            <p className={LABEL}>Event сонголт</p>
          </div>
        </div>
        <div className="mt-10 h-px w-full bg-gradient-to-r from-gold/40 via-gold/10 to-transparent" />
      </section>

      {/* ── SPLIT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 items-start">

        {/* LEFT — controls */}
        <div className="space-y-8">
          {/* Event grid */}
          <div>
            <p className={`${LABEL} mb-4`}>Event сонгох</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {events.map((e) => (
                <button key={e.id} onClick={() => { setSelectedEvent(e.id); setResult(null); }}
                  className={`p-5 rounded-2xl text-left transition-all group ${
                    selectedEvent === e.id
                      ? "bg-gold/10 border border-gold/40 shadow-[0_0_30px_rgba(192,132,216,0.1)]"
                      : "bg-white/[0.025] border border-white/[0.07] hover:border-white/18 hover:bg-white/[0.035]"
                  }`}>
                  <span className={`text-base mb-2 block ${selectedEvent === e.id ? "text-gold" : "text-white/30"}`}>{e.icon}</span>
                  <p className="text-sm text-white/85 font-sans font-medium mb-1">{e.label}</p>
                  <p className={`text-xs font-sans ${selectedEvent === e.id ? "text-gold/70" : "text-white/30"}`}>{e.sub}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className={`${LABEL} mb-3`}>Улирал</p>
              <div className="flex flex-wrap gap-2">
                {seasons.map((s) => <Chip key={s} label={s} active={selectedSeason === s} onClick={() => setSelectedSeason(s)} />)}
              </div>
            </div>
            <div>
              <p className={`${LABEL} mb-3`}>Style</p>
              <div className="flex flex-wrap gap-2">
                {styles.map((s) => <Chip key={s} label={s} active={selectedStyle === s} onClick={() => setSelectedStyle(s)} />)}
              </div>
            </div>
          </div>

          <button onClick={generate} disabled={!selectedEvent || loading}
            className={`w-full py-4 rounded-2xl text-sm font-semibold font-sans transition-all ${
              selectedEvent
                ? "bg-gold text-black hover:opacity-85 shadow-[0_4px_30px_rgba(192,132,216,0.25)]"
                : "bg-white/[0.03] text-white/20 border border-white/[0.06] cursor-not-allowed"
            }`}
            style={{ letterSpacing: "0.1em" }}>
            {loading ? "Үүсгэж байна..." : "Зөвлөмж авах →"}
          </button>
        </div>

        {/* RIGHT — preview / results */}
        <div className="space-y-4">
          {!result && !loading && (
            <>
              <p className={`${LABEL} mb-4`}>Хэрхэн ажилдаг вэ</p>
              {[
                { step: "01", text: "Event-ээ сонго — ажил, date, найр гэх мэт" },
                { step: "02", text: "Улирал ба style-аа тохируул" },
                { step: "03", text: "AI таны сонголтод тохирсон хослол гаргана" },
              ].map((s) => (
                <div key={s.step} className={`${CARD} p-5 flex gap-4 items-start`}>
                  <span className="text-gold/50 font-kenoky text-2xl leading-none shrink-0">{s.step}</span>
                  <p className="text-sm text-white/50 font-sans pt-1" style={{ lineHeight: 1.65 }}>{s.text}</p>
                </div>
              ))}
              <div className="p-5 rounded-2xl bg-gold/[0.04] border border-gold/18 mt-2">
                <p className="text-xs text-white/35 font-sans" style={{ lineHeight: 1.8 }}>
                  Event сонгосны дараа <span className="text-gold/60">Зөвлөмж авах</span> товч идэвхжинэ.
                </p>
              </div>
            </>
          )}

          {loading && (
            <div className={`${CARD} p-12 text-center`}>
              <div className="flex gap-2.5 justify-center mb-5">
                {[0,1,2].map((i) => (
                  <span key={i} className="w-2 h-2 rounded-full inline-block bg-gold animate-dot-blink"
                    style={{ animationDelay: `${i * 0.18}s` }} />
                ))}
              </div>
              <p className="text-base text-white/70 font-sans mb-1">Хослол үүсгэж байна</p>
              <p className="text-xs text-white/25 font-sans" style={{ letterSpacing: "0.08em" }}>{selectedSeason} · {selectedStyle}</p>
            </div>
          )}

          {result && (
            <div className="space-y-4 animate-fade-up">
              {result.map((outfit, i) => (
                <div key={i} className={`${CARD} p-6`}>
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <p className={`${LABEL} mb-1.5`}>Хослол {i + 1}</p>
                      <h3 style={{ fontSize: "1.15rem", letterSpacing: "-0.02em", fontFamily: "var(--font-kenoky)", fontWeight: 300, color: "#ede0f8" }}>{outfit.name}</h3>
                    </div>
                    <div className="flex gap-1.5 mt-1">
                      {outfit.colors.map((c) => (
                        <div key={c} className="w-5 h-5 rounded-full border border-white/10 shadow-sm" style={{ background: c }} />
                      ))}
                    </div>
                  </div>
                  <ul className="space-y-2.5 mb-5">
                    {outfit.items.map((item) => (
                      <li key={item} className="flex gap-3.5 text-sm text-white/50 font-sans" style={{ lineHeight: 1.55 }}>
                        <span className="text-gold/60 shrink-0">—</span>{item}
                      </li>
                    ))}
                  </ul>
                  <div className="rounded-xl p-4 bg-gold/[0.05] border border-gold/20">
                    <p className="text-xs font-sans" style={{ lineHeight: 1.75, color: "rgba(192,132,216,0.75)" }}>
                      <span className="opacity-60">Стилистийн зөвлөмж — </span>{outfit.tip}
                    </p>
                  </div>
                </div>
              ))}
              <button onClick={() => { setSelectedEvent(null); setResult(null); }}
                className="w-full py-3.5 rounded-2xl text-sm text-white/30 bg-white/[0.02] border border-white/[0.06] font-sans hover:text-white/55 transition-colors"
                style={{ letterSpacing: "0.08em" }}>
                Дахин үүсгэх
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
