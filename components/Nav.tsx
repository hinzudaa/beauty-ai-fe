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

const F = "var(--font-montserrat), 'Helvetica Neue', Arial, sans-serif";

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
      className="anim-slide-down delay-0 sticky top-0 z-50"
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 20px", height: "56px",
        background: "rgba(242,242,247,0.88)",
        backdropFilter: "blur(20px) saturate(1.8)",
        WebkitBackdropFilter: "blur(20px) saturate(1.8)",
        borderBottom: "1px solid rgba(0,0,0,0.07)",
      }}
      className="anim-slide-down delay-0 sticky top-0 z-50 md:px-12 lg:px-20"
    >
      {/* Logo */}
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none", flexShrink: 0 }}>
        {/* Wordmark logo — stylized "L" mark */}
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: "linear-gradient(145deg,#9333ea 0%,#7c3aed 60%,#6d28d9 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 3px 12px rgba(147,51,234,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
          position: "relative", overflow: "hidden",
          flexShrink: 0,
        }}>
          {/* inner shine */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "45%", background: "linear-gradient(to bottom,rgba(255,255,255,0.18),transparent)", borderRadius: "10px 10px 0 0" }} />
          <span style={{ color: "#fff", fontSize: "0.8rem", fontWeight: 900, fontFamily: F, letterSpacing: "-0.03em", position: "relative" }}>L</span>
        </div>
        <span style={{
          fontFamily: F, fontWeight: 800, fontSize: "1.2rem",
          letterSpacing: "-0.035em", color: "#1c1c1e",
          background: "linear-gradient(135deg,#1c1c1e 0%,#3a3a3c 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        }}>
          Looka
        </span>
      </Link>

      {/* Centre links */}
      <div style={{ display: "flex", alignItems: "center", gap: 2 }} className="hidden md:flex">
        {links.map((l) => (
          <Link key={l.href} href={l.href}
            style={{
              fontFamily: F, fontSize: "0.84rem",
              fontWeight: pathname === l.href ? 700 : 500,
              color: pathname === l.href ? "#1c1c1e" : "#6e6e73",
              padding: "6px 14px", borderRadius: 10,
              textDecoration: "none",
              background: pathname === l.href ? "rgba(0,0,0,0.05)" : "transparent",
              transition: "all 0.15s ease",
            }}>
            {l.label}
          </Link>
        ))}
      </div>

      {/* Right */}
      <div style={{ minWidth: 88, display: "flex", justifyContent: "flex-end", flexShrink: 0 }}>
        {!isClient || loading ? (
          <div style={{ width: 88, height: 34, borderRadius: 999, background: "rgba(0,0,0,0.06)" }} />
        ) : user ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link href="/profile"
              style={{
                display: "flex", alignItems: "center", gap: 6,
                fontFamily: F, fontSize: "0.75rem", fontWeight: 600,
                color: pathname === "/profile" ? "#9333ea" : "#6e6e73",
                padding: "6px 12px", borderRadius: 999,
                border: `1px solid ${pathname === "/profile" ? "rgba(147,51,234,0.25)" : "rgba(0,0,0,0.1)"}`,
                background: pathname === "/profile" ? "rgba(147,51,234,0.07)" : "transparent",
                textDecoration: "none",
              }}>
              <span style={{ fontSize: "0.55rem" }}>◉</span>{user.phone}
            </Link>
            <button onClick={() => { logout(); router.push("/"); }}
              style={{ fontFamily: F, fontSize: "0.78rem", fontWeight: 600, color: "#6e6e73", padding: "6px 14px", borderRadius: 999, border: "1px solid rgba(0,0,0,0.1)", background: "transparent", cursor: "pointer" }}>
              Гарах
            </button>
          </div>
        ) : (
          <Link href="/login"
            style={{ fontFamily: F, fontSize: "0.84rem", fontWeight: 700, letterSpacing: "-0.01em", background: "#1c1c1e", color: "#fff", padding: "8px 20px", borderRadius: 999, textDecoration: "none", boxShadow: "0 2px 12px rgba(0,0,0,0.16)" }}>
            Нэвтрэх
          </Link>
        )}
      </div>
    </nav>
  );
}
