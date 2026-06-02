"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../lib/AuthContext";

const links = [
  { href: "/analyze",        label: "Шинжилгээ" },
  { href: "/outfit",         label: "Хувцас" },
  { href: "/hairstyle",      label: "Үс / Грим" },
  { href: "/makeup",         label: "Makeup" },
  { href: "/chat",           label: "AI Стилист" },
];

export default function Nav() {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, logout, loading } = useAuth();

  function handleLogout() {
    logout();
    router.push("/");
  }

  // Hide entirely on login page
  if (pathname === "/login") return null;

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

      {/* Auth CTA */}
      {!loading && (
        user ? (
          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden sm:block text-xs text-white/35 font-sans truncate max-w-[90px]">
              {user.phone}
            </span>
            {user.phoneVerified && (
              <span className="hidden sm:flex items-center gap-1 text-[0.6rem] text-gold font-sans border border-gold/30 rounded-full px-2 py-0.5">
                ✦ Verified
              </span>
            )}
            <button
              onClick={handleLogout}
              className="text-xs text-white/40 hover:text-white/70 font-sans border border-white/[0.08] hover:border-white/[0.18] rounded-full px-4 py-1.5 transition-all"
            >
              Гарах
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="shrink-0 bg-white text-black text-sm font-semibold px-5 py-2 rounded-full hover:scale-[1.02] hover:opacity-90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.12)] font-sans"
            style={{ letterSpacing: "0.03em" }}
          >
            Нэвтрэх
          </Link>
        )
      )}
    </nav>
  );
}
