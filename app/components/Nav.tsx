"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/analyze",        label: "Шинжилгээ" },
  { href: "/outfit",         label: "Хувцас" },
  { href: "/hairstyle",      label: "Үс / Грим" },
  { href: "/makeup",         label: "Makeup" },
  { href: "/chat",           label: "AI Стилист" },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 lg:px-20 h-[60px] bg-black/70 backdrop-blur-2xl border-b border-white/[0.06]">
      <Link href="/" className="flex items-center gap-2 shrink-0">
        <span className="text-gold text-sm">✦</span>
        <span className="font-coffekan font-bold text-white text-2xl leading-none" style={{ letterSpacing: "0.04em" }}>
          Beauty AI
        </span>
      </Link>

      <div className="hidden md:flex items-center gap-1">
        {links.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3.5 py-1.5 rounded-lg text-sm transition-colors font-sans ${
                active
                  ? "text-white font-semibold"
                  : "text-white/40 hover:text-white/70"
              }`}
              style={{ letterSpacing: "0.01em" }}
            >
              {l.label}
            </Link>
          );
        })}
      </div>

      <Link
        href="/analyze"
        className="shrink-0 bg-white text-black text-sm font-semibold px-5 py-2 rounded-full hover:scale-[1.02] hover:opacity-90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.12)] font-sans"
        style={{ letterSpacing: "0.03em" }}
      >
        Эхлэх
      </Link>
    </nav>
  );
}
