"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

export default function AuthButton() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  if (loading) return <div className="w-[88px]" />;

  if (user) {
    return (
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
          onClick={() => { logout(); router.push("/"); }}
          className="text-xs text-white/40 hover:text-white/70 font-sans border border-white/[0.08] hover:border-white/[0.18] rounded-full px-4 py-1.5 transition-all"
        >
          Гарах
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="shrink-0 bg-white text-black text-sm font-semibold px-5 py-2 rounded-full hover:scale-[1.02] hover:opacity-90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.12)] font-sans"
      style={{ letterSpacing: "0.03em" }}
    >
      Нэвтрэх
    </Link>
  );
}
