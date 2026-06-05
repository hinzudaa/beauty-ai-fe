"use client";

interface Props {
  url:      string;
  title?:   string;
  className?: string;
  size?:    "sm" | "md";
}

async function doShare(url: string, title: string = "Миний looksmax үр дүн — Looka AI") {
  // Mobile: native OS share sheet (FB, Messenger, Instagram, WhatsApp…)
  if (typeof navigator !== "undefined" && navigator.share) {
    try { await navigator.share({ title, url }); return; } catch { /* cancelled */ }
  }
  // Desktop fallback: Facebook sharer popup
  window.open(
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    "_blank",
    "width=640,height=480,noopener,noreferrer"
  );
}

export default function ShareButton({
  url,
  title = "Миний looksmax үр дүн — Looka AI",
  className = "",
  size = "md",
}: Props) {
  const pad  = size === "sm" ? "px-4 py-[9px]" : "px-5 py-[12px]";
  const text = size === "sm" ? "text-[0.8rem]" : "text-[0.88rem]";

  return (
    <button
      type="button"
      onClick={() => doShare(url, title)}
      className={`flex items-center gap-2 rounded-full font-bold text-white cursor-pointer border-none shrink-0 transition-all hover:opacity-90 ${pad} ${text} ${className}`}
      style={{ background: "#1877F2", boxShadow: "0 3px 12px rgba(24,119,242,0.35)" }}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="white" style={{ flexShrink: 0 }}>
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
      </svg>
      Хуваалцах
    </button>
  );
}
