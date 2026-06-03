"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import { useAuth } from "@/lib/AuthContext";

const links = [
  { href: "/analyze", label: "Шинжилгээ" },
  { href: "/chat",    label: "AI Стилист" },
];

const noop = () => () => {};
const useIsClient = () => useSyncExternalStore(noop, () => true, () => false);

export default function Nav() {
  const pathname  = usePathname();
  const router    = useRouter();
  const { user, logout, loading } = useAuth();
  const isClient  = useIsClient();
  const [open, setOpen] = useState(false);

  if (pathname === "/login") return null;

  function close() { setOpen(false); }

  return (
    <>
      <nav
        className="anim-slide-down delay-0 sticky top-0 z-50 flex items-center justify-between px-5 md:px-12 lg:px-20 h-14 border-b border-[rgba(0,0,0,0.07)]"
        style={{
          background: "rgba(242,242,247,0.88)",
          backdropFilter: "blur(20px) saturate(1.8)",
          WebkitBackdropFilter: "blur(20px) saturate(1.8)",
        }}
      >
        {/* Logo */}
        <Link href="/" onClick={close} className="flex items-center gap-[9px] shrink-0">
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

        {/* Centre links — desktop only */}
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

        {/* Right — desktop auth + mobile hamburger */}
        <div className="flex items-center gap-3 shrink-0">

          {/* Auth — desktop */}
          <div className="hidden md:flex items-center gap-2">
            {!isClient || loading ? (
              <div className="w-[88px] h-[34px] rounded-full bg-[rgba(0,0,0,0.06)]" />
            ) : user ? (
              <>
                <Link href="/profile"
                  className={`flex items-center gap-[6px] text-[0.75rem] font-semibold px-3 py-[6px] rounded-full border transition-all
                    ${pathname === "/profile"
                      ? "text-[#9333ea] border-[rgba(147,51,234,0.25)] bg-[rgba(147,51,234,0.07)]"
                      : "text-[#6e6e73] border-[rgba(0,0,0,0.1)]"}`}>
                  <span className="text-[0.55rem]">◉</span>{user.phone}
                </Link>
                <button onClick={() => { logout(); router.push("/"); }}
                  className="text-[0.78rem] font-semibold text-[#6e6e73] px-[14px] py-[6px] rounded-full border border-[rgba(0,0,0,0.1)] bg-transparent cursor-pointer">
                  Гарах
                </button>
              </>
            ) : (
              <Link href="/login"
                className="text-[0.84rem] font-bold tracking-[-0.01em] bg-[#1c1c1e] text-white px-5 py-2 rounded-full shadow-[0_2px_12px_rgba(0,0,0,0.16)]">
                Нэвтрэх
              </Link>
            )}
          </div>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden flex flex-col justify-center items-center w-9 h-9 rounded-[10px] bg-transparent border-none cursor-pointer gap-[5px]"
            aria-label="Цэс"
          >
            <span className={`block h-[2px] bg-[#1c1c1e] rounded-full transition-all duration-300 ${open ? "w-5 rotate-45 translate-y-[7px]" : "w-5"}`} />
            <span className={`block h-[2px] bg-[#1c1c1e] rounded-full transition-all duration-300 ${open ? "opacity-0 w-3" : "w-3 self-start"}`} />
            <span className={`block h-[2px] bg-[#1c1c1e] rounded-full transition-all duration-300 ${open ? "w-5 -rotate-45 -translate-y-[7px]" : "w-5"}`} />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40"
          onClick={close}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />

          {/* Panel */}
          <div
            className="absolute top-14 left-0 right-0 anim-slide-down"
            style={{
              background: "rgba(242,242,247,0.97)",
              backdropFilter: "blur(20px) saturate(1.8)",
              WebkitBackdropFilter: "blur(20px) saturate(1.8)",
              borderBottom: "1px solid rgba(0,0,0,0.07)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Nav links */}
            <div className="px-5 pt-4 pb-2 flex flex-col gap-1">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={close}
                  className={`text-[0.95rem] px-4 py-3 rounded-[12px] transition-all
                    ${pathname === l.href
                      ? "font-bold text-[#1c1c1e] bg-[rgba(0,0,0,0.05)]"
                      : "font-medium text-[#6e6e73]"}`}
                >
                  {l.label}
                </Link>
              ))}
            </div>

            {/* Divider */}
            <div className="mx-5 h-px bg-[rgba(0,0,0,0.06)]" />

            {/* Auth section */}
            <div className="px-5 py-4">
              {!isClient || loading ? (
                <div className="h-11 rounded-full bg-[rgba(0,0,0,0.06)] animate-pulse" />
              ) : user ? (
                <div className="flex flex-col gap-2">
                  <Link href="/profile" onClick={close}
                    className="flex items-center gap-2 px-4 py-3 rounded-[12px] bg-[rgba(147,51,234,0.06)] border border-[rgba(147,51,234,0.15)] text-[#9333ea] text-[0.88rem] font-semibold">
                    <span className="text-[0.6rem]">◉</span>{user.phone}
                  </Link>
                  <button
                    onClick={() => { logout(); router.push("/"); close(); }}
                    className="w-full py-3 bg-transparent border border-[rgba(0,0,0,0.1)] rounded-full text-[0.88rem] font-semibold text-[#6e6e73] cursor-pointer"
                  >
                    Гарах
                  </button>
                </div>
              ) : (
                <Link href="/login" onClick={close}
                  className="block text-center py-3 bg-[#1c1c1e] text-white text-[0.92rem] font-bold rounded-full shadow-[0_4px_14px_rgba(0,0,0,0.18)]">
                  Нэвтрэх
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
