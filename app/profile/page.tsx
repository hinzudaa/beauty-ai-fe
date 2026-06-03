"use client";

import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useAuth } from "@/lib/AuthContext";
import { getProfile, ProfileData } from "@/apis/profile";
import { tokenStore } from "@/utils/request";

const LABEL = "text-[0.68rem] tracking-[0.18em] uppercase font-medium text-white/30 font-sans";
const CARD  = "bg-white/[0.04] border border-white/[0.07] rounded-[20px] backdrop-blur-xl";

const FEATURE: Record<string, { label: string; icon: string; color: string }> = {
  analyze:   { label: "Нүүрний шинжилгээ", icon: "◈", color: "text-purple-400" },
  outfit:    { label: "Хувцас генератор",  icon: "◉", color: "text-blue-400"   },
  hairstyle: { label: "Үс засал & Грим",   icon: "✦", color: "text-pink-400"   },
};

const STATUS_STYLE: Record<string, string> = {
  paid:    "text-green-400 bg-green-400/10 border-green-400/20",
  pending: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  failed:  "text-red-400 bg-red-400/10 border-red-400/20",
};
const STATUS_LABEL: Record<string, string> = {
  paid: "Төлсөн", pending: "Хүлээгдэж буй", failed: "Амжилтгүй",
};

function fmt(d: string) {
  return new Date(d).toLocaleDateString("mn-MN", { year: "numeric", month: "2-digit", day: "2-digit" });
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const { data, isLoading } = useSWR<ProfileData>(
    user ? "profile" : null,
    () => getProfile(),
    { revalidateOnFocus: false }
  );

  function handleLogout() {
    logout();
    router.push("/");
  }

  if (!user && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center space-y-4">
          <p className="text-white/50 font-sans">Профайл харахын тулд нэвтрэнэ үү</p>
          <a href="/login" className="inline-block bg-white text-black text-sm font-semibold px-6 py-2.5 rounded-full hover:opacity-90 transition-all">
            Нэвтрэх →
          </a>
        </div>
      </div>
    );
  }

  const totalSpend  = data?.payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0) ?? 0;
  const totalUsage  = Object.values(data?.usage ?? {}).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen px-6 md:px-12 lg:px-20 pt-16 pb-24">

      <section className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="text-xs text-white/30 uppercase tracking-widest font-sans mb-3">Профайл</p>
            <h1 className="text-4xl font-kenoky text-white" style={{ letterSpacing: "-0.02em" }}>
              {data?.user.phone ?? user?.phone ?? "—"}
            </h1>
            {data?.user.phoneVerified && (
              <span className="inline-flex items-center gap-1.5 mt-2 text-[0.65rem] text-green-400 bg-green-400/10 border border-green-400/20 rounded-full px-3 py-1 font-sans">
                ✓ Баталгаажсан
              </span>
            )}
          </div>
        </div>
        <div className="mt-8 h-px w-full bg-gradient-to-r from-white/20 via-white/5 to-transparent" />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left col: stats + usage ── */}
        <div className="space-y-4">

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Нийт зарцуулсан", value: `${totalSpend.toLocaleString()}₮`, icon: "◇" },
              { label: "Нийт хэрэглэсэн", value: totalUsage,                         icon: "◈" },
            ].map((s) => (
              <div key={s.label} className={`${CARD} p-5`}>
                <span className="text-white/30 text-xs mb-2 block">{s.icon}</span>
                <p className="text-2xl font-semibold text-white">{s.value}</p>
                <p className={`${LABEL} mt-1`}>{s.label}</p>
              </div>
            ))}
          </div>

          <div className={CARD + " p-5"}>
            <p className={`${LABEL} mb-4`}>Боломжийн хэрэглээ</p>
            {isLoading
              ? <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-6 bg-white/[0.06] rounded animate-pulse" />)}</div>
              : (
                <div className="space-y-4">
                  {Object.entries(data?.usage ?? {}).map(([feat, count]) => {
                    const meta = FEATURE[feat];
                    const pct  = totalUsage > 0 ? Math.round((count / totalUsage) * 100) : 0;
                    return (
                      <div key={feat}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className={`flex items-center gap-1.5 ${meta?.color ?? "text-white/50"}`}>
                            <span className="text-xs">{meta?.icon}</span>
                            <span className="font-sans text-xs text-white/50">{meta?.label ?? feat}</span>
                          </span>
                          <span className="text-white font-medium text-sm">{count}</span>
                        </div>
                        <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              feat === "analyze" ? "bg-purple-500" :
                              feat === "outfit"  ? "bg-blue-500"   : "bg-pink-500"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            }
          </div>

          <div className={CARD + " p-5"}>
            <p className={`${LABEL} mb-3`}>Бүртгэлийн огноо</p>
            <p className="text-sm text-white/60 font-sans">
              {data?.user.createdAt ? fmt(data.user.createdAt) : "—"}
            </p>
          </div>
        </div>

        {/* ── Right col: payment history ── */}
        <div className="lg:col-span-2">
          <p className={`${LABEL} mb-4`}>Төлбөрийн түүх</p>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`${CARD} h-16 animate-pulse`} />
              ))}
            </div>
          ) : !data?.payments.length ? (
            <div className={`${CARD} p-8 text-center`}>
              <p className="text-white/30 font-sans text-sm">Одоогоор төлбөрийн түүх байхгүй байна.</p>
              <p className="text-white/20 font-sans text-xs mt-2">Шинжилгээ хийхэд л энд харагдана.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.payments.map((p) => {
                const feat = FEATURE[p.type];
                return (
                  <div key={p.invoiceId} className={`${CARD} px-5 py-4 flex items-center justify-between gap-4 hover:bg-white/[0.06] transition-all`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`text-sm shrink-0 ${feat?.color ?? "text-white/40"}`}>{feat?.icon ?? "◇"}</span>
                      <div className="min-w-0">
                        <p className="text-sm text-white font-sans truncate">{feat?.label ?? p.type}</p>
                        <p className="text-xs text-white/30 font-sans">{fmt(p.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-xs border px-2.5 py-1 rounded-full ${STATUS_STYLE[p.status] ?? "text-white/30 border-white/10"}`}>
                        {STATUS_LABEL[p.status] ?? p.status}
                      </span>
                      <span className="text-sm font-semibold text-white">{p.amount.toLocaleString()}₮</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
