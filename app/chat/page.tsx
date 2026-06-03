"use client";
import { useState, useRef, useEffect } from "react";

const F = "var(--font-montserrat), 'Helvetica Neue', Arial, sans-serif";

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
    return <p key={i} style={{ marginBottom: 4, fontFamily: F }} dangerouslySetInnerHTML={{ __html: html }} />;
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
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 56px)", fontFamily: F, padding: "0 24px" }} className="md:px-12 lg:px-20">

      {/* Header */}
      <div style={{ paddingTop: 40, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <span style={{ fontFamily: F, fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#9333ea", display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 13px", borderRadius: 999, background: "rgba(147,51,234,0.08)", border: "1px solid rgba(147,51,234,0.2)", marginBottom: 16 }}>
              ✦ &nbsp;04 · Premium
            </span>
            <h1 style={{ fontFamily: F, fontSize: "clamp(2.2rem,5vw,3.5rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.06, color: "#1c1c1e" }}>
              <span style={{ background: "linear-gradient(135deg,#9333ea,#7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>AI</span> Стилист
            </h1>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }} className="hidden md:flex">
            <p style={{ fontFamily: F, fontSize: "2rem", fontWeight: 800, color: "#1c1c1e", lineHeight: 1 }}>24/7</p>
            <p style={{ fontFamily: F, fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#8e8e93" }}>Онлайн зөвлөмж</p>
          </div>
        </div>
        <div style={{ height: 1, background: "rgba(0,0,0,0.07)", marginBottom: 8 }} />
      </div>

      {/* Quick prompts */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "10px 0", flexShrink: 0 }}>
        {QUICK.map((p) => (
          <button key={p} onClick={() => send(p)}
            style={{ fontFamily: F, fontSize: "0.78rem", fontWeight: 500, color: "#6e6e73", background: "#fff", border: "1px solid rgba(0,0,0,0.08)", padding: "8px 16px", borderRadius: 999, whiteSpace: "nowrap", flexShrink: 0, cursor: "pointer", transition: "all 0.15s", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            {p}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16, padding: "12px 0" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", gap: 12, justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            {m.role === "ai" && (
              <div style={{ width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2, background: "rgba(147,51,234,0.1)", border: "1px solid rgba(147,51,234,0.2)" }}>
                <span style={{ color: "#9333ea", fontSize: "0.65rem" }}>✦</span>
              </div>
            )}
            <div style={{
              maxWidth: "78%", padding: "14px 18px", fontSize: "0.9rem", lineHeight: 1.7,
              borderRadius: m.role === "user" ? "20px 20px 5px 20px" : "20px 20px 20px 5px",
              background: m.role === "user" ? "#1c1c1e" : "#fff",
              color: m.role === "user" ? "#fff" : "#1c1c1e",
              border: m.role === "user" ? "none" : "1px solid rgba(0,0,0,0.07)",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}>
              {m.role === "ai" ? renderText(m.text) : m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-start" }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "rgba(147,51,234,0.1)", border: "1px solid rgba(147,51,234,0.2)" }}>
              <span style={{ color: "#9333ea", fontSize: "0.65rem" }}>✦</span>
            </div>
            <div style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.07)", padding: "14px 18px", borderRadius: "20px 20px 20px 5px", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              {[0,1,2].map((i) => <span key={i} className="animate-dot-blink" style={{ width: 7, height: 7, borderRadius: "50%", background: "#9333ea", display: "inline-block", animationDelay: `${i*0.15}s` }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "12px 0 20px", flexShrink: 0, borderTop: "1px solid rgba(0,0,0,0.07)" }}>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            placeholder="Асуултаа бич..."
            style={{
              flex: 1, background: "#fff", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 16,
              padding: "14px 20px", fontSize: "0.9rem", fontFamily: F, color: "#1c1c1e",
              outline: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            style={{
              padding: "14px 22px", borderRadius: 14, fontFamily: F, fontSize: "0.9rem", fontWeight: 700, border: "none", cursor: input.trim() ? "pointer" : "not-allowed", transition: "all 0.15s",
              background: input.trim() ? "#1c1c1e" : "rgba(0,0,0,0.06)",
              color: input.trim() ? "#fff" : "#aeaeb2",
              boxShadow: input.trim() ? "0 4px 12px rgba(0,0,0,0.18)" : "none",
            }}>
            →
          </button>
        </div>
      </div>
    </div>
  );
}
