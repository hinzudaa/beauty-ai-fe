"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import { useAuth } from "@/lib/AuthContext";

const links = [
  { href: "/analyze",   label: "Шинжилгээ" },
  { href: "/outfit",    label: "Хувцас" },
  { href: "/hairstyle", label: "Үс / Грим" },
  { href: "/chat",      label: "AI Стилист" },
];

const noop = () => () => {};
const useIsClient = () => useSyncExternalStore(noop, () => true, () => false);

export default function Nav() {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, logout, loading } = useAuth();
  const isClient = useIsClient();

  if (pathname === "/login") return null;

  return (
    <nav
      className="anim-slide-down delay-0 sticky top-0 z-50 flex items-center justify-between px-5 md:px-12 lg:px-20 h-14 border-b border-[rgba(0,0,0,0.07)]"
      style={{
        background: "rgba(242,242,247,0.88)",
        backdropFilter: "blur(20px) saturate(1.8)",
        WebkitBackdropFilter: "blur(20px) saturate(1.8)",
      }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-[9px] shrink-0">
        <div
          className="w-8 h-8 rounded-[10px] flex items-center justify-center relative overflow-hidden shrink-0"
          style={{
            background: "linear-gradient(145deg,#9333ea 0%,#7c3aed 60%,#6d28d9 100%)",
            boxShadow: "0 3px 12px rgba(147,51,234,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-[45%] rounded-t-[10px]"
            style={{ background: "linear-gradient(to bottom,rgba(255,255,255,0.18),transparent)" }}
          />
          <span className="text-white text-[0.8rem] font-black tracking-[-0.03em] relative">L</span>
        </div>
        <span
          className="font-extrabold text-[1.2rem] tracking-[-0.035em] bg-clip-text text-transparent"
          style={{
            background: "linear-gradient(135deg,#1c1c1e 0%,#3a3a3c 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Looka
        </span>
      </Link>

      {/* Centre links — hidden on mobile */}
      <div className="hidden md:flex items-center gap-0.5">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`text-[0.84rem] px-[14px] py-[6px] rounded-[10px] transition-all duration-150
              ${pathname === l.href
                ? "font-bold text-[#1c1c1e] bg-[rgba(0,0,0,0.05)]"
                : "font-medium text-[#6e6e73]"}`}
          >
            {l.label}
          </Link>
        ))}
      </div>

      {/* Right */}
      <div className="min-w-[88px] flex justify-end shrink-0">
        {!isClient || loading ? (
          <div className="w-[88px] h-[34px] rounded-full bg-[rgba(0,0,0,0.06)]" />
        ) : user ? (
          <div className="flex items-center gap-2">
            <Link
              href="/profile"
              className={`flex items-center gap-[6px] text-[0.75rem] font-semibold px-3 py-[6px] rounded-full border transition-all
                ${pathname === "/profile"
                  ? "text-[#9333ea] border-[rgba(147,51,234,0.25)] bg-[rgba(147,51,234,0.07)]"
                  : "text-[#6e6e73] border-[rgba(0,0,0,0.1)]"}`}
            >
              <span className="text-[0.55rem]">◉</span>{user.phone}
            </Link>
            <button
              onClick={() => { logout(); router.push("/"); }}
              className="text-[0.78rem] font-semibold text-[#6e6e73] px-[14px] py-[6px] rounded-full border border-[rgba(0,0,0,0.1)] bg-transparent cursor-pointer"
            >
              Гарах
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="text-[0.84rem] font-bold tracking-[-0.01em] bg-[#1c1c1e] text-white px-5 py-2 rounded-full shadow-[0_2px_12px_rgba(0,0,0,0.16)]"
          >
            Нэвтрэх
          </Link>
        )}
      </div>
    </nav>
  );
}
