"use client";
import { useState, useRef, useEffect } from "react";
import { siteUrl } from "@/config/site";
import { tokenStore, ApiError } from "@/utils/request";

type Message = { role: "user" | "ai"; text: string };

const QUICK = [
  "Маргааш interview байна, юу өмсөх вэ?",
  "Date night-д тохирсон хувцас санал өг",
  "Офист casual өмсөхөд ямар өнгө тохиромжтой?",
  "K-pop style-ийг Монгол болгочих",
  "Намрын шинэ wardrobe-д юу оруулах вэ?",
];

async function fetchChatReply(
  message: string,
  history: Array<{ role: "user" | "assistant"; content: string }>
): Promise<string> {
  const token = tokenStore.get();
  const res = await fetch(`${siteUrl}/chat/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ message, history }),
  });

  const json = await res.json();
  if (!res.ok) throw new ApiError(res.status, json?.error ?? "Request failed");
  return json.reply as string;
}

function renderText(text: string) {
  return text.split("\n").map((line, i) => {
    const html = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    return <p key={i} className="mb-1" dangerouslySetInnerHTML={{ __html: html }} />;
  });
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", text: "Сайн байна уу. Би таны хувийн AI стилист. Хувцас, үс засал, грим — ямар ч асуулт асуугаарай." },
  ]);
  const [input, setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [proError, setProError] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  // Convert message history to the format the backend expects
  function buildHistory() {
    return messages.slice(-10).map((m) => ({
      role: m.role === "ai" ? "assistant" as const : "user" as const,
      content: m.text,
    }));
  }

  async function send(text: string) {
    if (!text.trim() || loading) return;

    if (!tokenStore.get()) {
      setMessages((m) => [...m, {
        role: "ai",
        text: "Энэ боломжийг ашиглахын тулд эхлээд нэвтэрнэ үү.",
      }]);
      return;
    }

    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const history = buildHistory();
      const reply   = await fetchChatReply(text, history);
      setMessages((m) => [...m, { role: "ai", text: reply }]);
    } catch (err) {
      const isProErr = err instanceof ApiError && (err.status === 402 || err.message === "proRequired");
      if (isProErr) {
        setProError(true);
        setMessages((m) => [...m, {
          role: "ai",
          text: "AI Стилист чат нь **Pro захиалгад** зориулагдсан. Профайл хуудаснаас Pro захиалга авна уу.",
        }]);
      } else {
        setMessages((m) => [...m, {
          role: "ai",
          text: "Уучлаарай, хариу боловсруулахад алдаа гарлаа. Дахин оролдоно уу.",
        }]);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] px-6 md:px-12 lg:px-20">

      {/* Header */}
      <div className="pt-10 shrink-0">
        <div className="flex items-end justify-between mb-5">
          <div>
            <span className="label-style inline-flex items-center gap-[6px] px-[13px] py-[5px] rounded-full bg-[rgba(147,51,234,0.08)] border border-[rgba(147,51,234,0.2)] text-[#9333ea] mb-4">
              ✦ &nbsp;04 · Pro захиалга
            </span>
            <h1 className="text-[clamp(2.2rem,5vw,3.5rem)] tracking-[-0.03em] leading-[1.06] text-[#1c1c1e]">
              <span className="bg-clip-text text-transparent"
                style={{ background: "linear-gradient(135deg,#9333ea,#7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                AI
              </span> Стилист
            </h1>
          </div>
          <div className="hidden md:flex flex-col items-end gap-1">
            <p className="text-[2rem] font-extrabold text-[#1c1c1e] leading-none">24/7</p>
            <p className="label-style">Онлайн зөвлөмж</p>
          </div>
        </div>

        {/* Pro upgrade banner */}
        {proError && (
          <div className="mb-3 px-4 py-3 rounded-[14px] bg-[rgba(147,51,234,0.06)] border border-[rgba(147,51,234,0.2)] flex items-center justify-between gap-3">
            <p className="text-[0.82rem] text-[#6e6e73]">Энэ боломж Pro захиалгад зориулагдсан.</p>
            <a href="/profile" className="text-[0.82rem] font-bold text-[#9333ea] shrink-0">Pro авах →</a>
          </div>
        )}

        <div className="h-px bg-[rgba(0,0,0,0.07)] mb-2" />
      </div>

      {/* Quick prompts */}
      <div className="flex gap-2 overflow-x-auto py-[10px] shrink-0">
        {QUICK.map((p) => (
          <button key={p} onClick={() => send(p)}
            className="text-[0.78rem] font-medium text-[#6e6e73] bg-white border border-[rgba(0,0,0,0.08)] px-4 py-2 rounded-full whitespace-nowrap shrink-0 cursor-pointer transition-all duration-150 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
            {p}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 py-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "ai" && (
              <div className="w-[34px] h-[34px] rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-[rgba(147,51,234,0.1)] border border-[rgba(147,51,234,0.2)]">
                <span className="text-[#9333ea] text-[0.65rem]">✦</span>
              </div>
            )}
            <div className="max-w-[78%] px-[18px] py-[14px] text-[0.9rem] leading-[1.7] shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
              style={{
                borderRadius: m.role === "user" ? "20px 20px 5px 20px" : "20px 20px 20px 5px",
                background: m.role === "user" ? "#1c1c1e" : "#fff",
                color: m.role === "user" ? "#fff" : "#1c1c1e",
                border: m.role === "user" ? "none" : "1px solid rgba(0,0,0,0.07)",
              }}>
              {m.role === "ai" ? renderText(m.text) : m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-[34px] h-[34px] rounded-full flex items-center justify-center shrink-0 bg-[rgba(147,51,234,0.1)] border border-[rgba(147,51,234,0.2)]">
              <span className="text-[#9333ea] text-[0.65rem]">✦</span>
            </div>
            <div className="bg-white border border-[rgba(0,0,0,0.07)] px-[18px] py-[14px] rounded-[20px_20px_20px_5px] flex items-center gap-2 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
              {[0,1,2].map((i) => (
                <span key={i} className="animate-dot-blink w-[7px] h-[7px] rounded-full bg-[#9333ea] inline-block" style={{ animationDelay: `${i*0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="py-3 pb-5 shrink-0 border-t border-[rgba(0,0,0,0.07)]">
        <div className="flex gap-[10px]">
          <input
            type="text" value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            placeholder="Асуултаа бич..."
            className="flex-1 bg-white border border-[rgba(0,0,0,0.1)] rounded-[16px] px-5 py-[14px] text-[0.9rem] text-[#1c1c1e] outline-none shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
          />
          <button onClick={() => send(input)} disabled={!input.trim() || loading}
            className="px-[22px] py-[14px] rounded-[14px] text-[0.9rem] font-bold border-none transition-all duration-150"
            style={{
              background: input.trim() ? "#1c1c1e" : "rgba(0,0,0,0.06)",
              color: input.trim() ? "#fff" : "#aeaeb2",
              cursor: input.trim() ? "pointer" : "not-allowed",
              boxShadow: input.trim() ? "0 4px 12px rgba(0,0,0,0.18)" : "none",
            }}>
            →
          </button>
        </div>
      </div>
    </div>
  );
}
