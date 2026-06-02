"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/analyze",   label: "Нүүрний шинжилгээ" },
  { href: "/outfit",    label: "Хувцас" },
  { href: "/hairstyle", label: "Үс / Грим" },
  { href: "/chat",      label: "AI Стилист" },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 lg:px-20 h-[60px] bg-[#0d0a18]/90 backdrop-blur-xl border-b border-white/[0.06]">
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
                  ? "text-white font-semibold bg-white/[0.07]"
                  : "text-white/50 font-semibold hover:text-white/80"
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
        className="shrink-0 bg-gold text-black text-sm font-semibold px-5 py-2 rounded-full hover:opacity-85 transition-opacity font-sans"
        style={{ letterSpacing: "0.03em" }}
      >
        Эхлэх
      </Link>
    </nav>
  );
}
