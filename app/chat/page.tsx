"use client";
import { useState, useRef, useEffect } from "react";

const BADGE = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/15 border border-gold/30 text-gold text-[0.68rem] tracking-[0.14em] uppercase font-medium font-sans";
const LABEL = "text-[0.68rem] tracking-[0.18em] uppercase font-medium text-white/35 font-sans";

type Message = { role: "user" | "ai"; text: string };

const QUICK = [
  "Маргааш interview байна, юу өмсөх вэ?",
  "Date night-д тохирсон хувцас санал өг",
  "Офист casual өмсөхөд ямар өнгө тохиромжтой?",
  "K-pop style-ийг Монгол болгочих",
  "Намрын шинэ wardrobe-д юу оруулах вэ?",
];

const AI: Record<string, string> = {
  interview: `**Ажлын ярилцлагад** — Structured blazer + tailored trousers хамгийн найдвартай хослол.\n\n**Өнгө:** Navy, charcoal, camel — итгэл төрүүлдэг tone.\n\n**Shoes:** Block heel эсвэл loafer — comfortable байх нь чухал.\n\n**Avoid:** Casual sneaker, маш тод өнгө, хэт богино hem.`,
  date:      `**Date night** —\n\nSilk slip dress (dusty rose/black) + strappy sandals — Effortless Chic.\n\nFitted leather jacket + flowy midi skirt + ankle boots — Edgy Feminine.\n\n**Зөвлөмж:** Нэг "wow" piece сонго — хувцас эсвэл accessory, хоёулааг нэгэн зэрэг биш.`,
  casual:    `**Офис casual өнгөний гид** —\n\n✓ White + camel → цэвэрхэн, professional\n✓ Navy + cream → classic, polished\n✓ Olive + rust → warm, autumn-ready\n\n**Гол зарчим:** 2-оос илүү өнгө хольж болохгүй.`,
  kpop:      `**K-pop → Монгол хувилбар** —\n\nOversized hoodie + high-waist jeans → accessible, on-trend.\nMonochrome set → top + bottom ижил өнгө → simple ба modern.\nPlatform sneaker, chunky boot → statement footwear.\n\nМанайд 4 улирал тул layering чухал — функциональ байлга.`,
  wardrobe:  `**Намрын capsule wardrobe** —\n\n1. Camel trench coat\n2. White button-up shirt\n3. Dark wash straight jeans\n4. Chunky knit sweater (oatmeal)\n5. Black turtleneck\n6. Tailored trousers (charcoal)\n7. Leather ankle boots\n8. White sneakers\n9. Structured tote bag\n10. Denim jacket\n\nPalette: camel + white + black + rust + olive — бүгд хоорондоо mix хийгдэнэ.`,
};

function getResponse(text: string) {
  const l = text.toLowerCase();
  if (l.includes("interview") || l.includes("ярилцлага")) return AI.interview;
  if (l.includes("date") || l.includes("night")) return AI.date;
  if (l.includes("casual") || l.includes("офис") || l.includes("өнгө")) return AI.casual;
  if (l.includes("k-pop") || l.includes("kpop") || l.includes("монгол болг")) return AI.kpop;
  if (l.includes("wardrobe") || l.includes("намар") || l.includes("шинэ")) return AI.wardrobe;
  return `**"${text}"** гэсэн асуултын хувьд —\n\nЕрөнхий зарчим: **fit → color → style** дарааллаар ажиллах.\n\nДэлгэрэнгүй зөвлөгөө авахын тулд event, body type, budget-ийг нэмж хэлнэ үү.`;
}

function renderText(text: string) {
  return text.split("\n").map((line, i) => {
    const html = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    return <p key={i} className="mb-1 font-sans" dangerouslySetInnerHTML={{ __html: html }} />;
  });
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", text: "Сайн байна уу. Би таны хувийн AI стилист. Хувцас, үс засал, грим — ямар ч асуулт асуугаарай." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  function send(text: string) {
    if (!text.trim() || loading) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setLoading(true);
    setTimeout(() => {
      setMessages((m) => [...m, { role: "ai", text: getResponse(text) }]);
      setLoading(false);
    }, 1400);
  }

  return (
    <div className="flex flex-col px-6 md:px-12 lg:px-20" style={{ height: "calc(100vh - 60px)" }}>

      {/* ── HERO HEADER ── */}
      <div className="pt-10 shrink-0">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className={BADGE}>✦ &nbsp;04 · Premium</span>
            <h1 className="mt-4" style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)", letterSpacing: "-0.03em", lineHeight: 1.06 }}>
              <span className="text-gold">AI</span> Стилист
            </h1>
          </div>
          <div className="hidden md:flex flex-col items-end gap-1 pb-1">
            <p className="text-2xl font-kenoky text-white/80">24/7</p>
            <p className={LABEL}>Онлайн зөвлөмж</p>
          </div>
        </div>
        <div className="h-px w-full bg-gradient-to-r from-white/20 via-white/5 to-transparent mb-3" />
      </div>

      {/* ── QUICK PROMPTS ── */}
      <div className="flex gap-2 overflow-x-auto py-3 shrink-0">
        {QUICK.map((p) => (
          <button key={p} onClick={() => send(p)}
            className="text-xs text-white/40 bg-white/[0.04] border border-white/[0.07] px-4 py-2 rounded-full whitespace-nowrap flex-shrink-0 hover:text-white/70 hover:border-white/[0.15] transition-all font-sans">
            {p}
          </button>
        ))}
      </div>

      {/* ── MESSAGES ── */}
      <div className="flex-1 overflow-y-auto space-y-5 py-4 pr-1">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "ai" && (
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-white/[0.08] border border-white/[0.12]">
                <span className="text-white text-[0.6rem]">✦</span>
              </div>
            )}
            <div
              className={`max-w-[78%] px-5 py-4 text-sm ${
                m.role === "user"
                  ? "bg-white/[0.08] text-white/85 border border-white/[0.1]"
                  : "bg-white/[0.03] text-white/60 border border-white/[0.06]"
              }`}
              style={{
                borderRadius: m.role === "user" ? "20px 20px 5px 20px" : "20px 20px 20px 5px",
                lineHeight: 1.75,
                backdropFilter: "blur(8px)",
              }}>
              {m.role === "ai" ? renderText(m.text) : m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-white/[0.08] border border-white/[0.12]">
              <span className="text-white text-[0.6rem]">✦</span>
            </div>
            <div className="bg-white/[0.025] border border-white/[0.07] px-5 py-4 flex items-center gap-2"
              style={{ borderRadius: "20px 20px 20px 5px", backdropFilter: "blur(8px)" }}>
              {[0,1,2].map((i) => (
                <span key={i} className="w-1.5 h-1.5 rounded-full inline-block bg-gold animate-dot-blink"
                  style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── INPUT ── */}
      <div className="py-4 shrink-0 border-t border-white/[0.05]">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            placeholder="Асуултаа бич..."
            className="flex-1 bg-white/[0.04] border border-white/[0.07] rounded-[20px] px-5 py-4 text-sm text-white font-sans outline-none placeholder:text-white/20 focus:border-white/[0.2] transition-all"
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            className={`px-6 rounded-[16px] text-sm font-sans font-semibold transition-all ${
              input.trim()
                ? "bg-white text-black hover:opacity-90"
                : "bg-white/[0.03] text-white/20 border border-white/[0.06]"
            }`}>
            →
          </button>
        </div>
      </div>
    </div>
  );
}
