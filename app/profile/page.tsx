"use client";

import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useAuth } from "@/lib/AuthContext";
import { getProfile, ProfileData } from "@/apis/profile";

const FEATURE: Record<string, { label: string; icon: string; color: string }> = {
  analyze:   { label: "Нүүрний шинжилгээ", icon: "◈", color: "#9333ea" },
  outfit:    { label: "Хувцас генератор",  icon: "◉", color: "#7c3aed" },
  hairstyle: { label: "Үс засал & Грим",   icon: "✦", color: "#a855f7" },
};

const STATUS_COLOR: Record<string, { text: string; bg: string; border: string }> = {
  paid:    { text: "#16a34a", bg: "rgba(22,163,74,0.08)",  border: "rgba(22,163,74,0.2)"  },
  pending: { text: "#d97706", bg: "rgba(217,119,6,0.08)",  border: "rgba(217,119,6,0.2)"  },
  failed:  { text: "#dc2626", bg: "rgba(220,38,38,0.08)",  border: "rgba(220,38,38,0.2)"  },
};
const STATUS_LABEL: Record<string, string> = { paid: "Төлсөн", pending: "Хүлээгдэж буй", failed: "Амжилтгүй" };

const PLAN_COLOR: Record<string, string> = {
  basic: "text-[#3b82f6] bg-[rgba(59,130,246,0.08)] border-[rgba(59,130,246,0.2)]",
  pro:   "text-[#9333ea] bg-[rgba(147,51,234,0.08)] border-[rgba(147,51,234,0.2)]",
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

  function handleLogout() { logout(); router.push("/"); }

  if (!user && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center flex flex-col gap-4">
          <p className="text-base text-[#6e6e73]">Профайл харахын тулд нэвтрэнэ үү</p>
          <a href="/login"
            className="inline-block bg-[#1c1c1e] text-white text-[0.87rem] font-bold px-6 py-[11px] rounded-full shadow-[0_4px_14px_rgba(0,0,0,0.18)]">
            Нэвтрэх →
          </a>
        </div>
      </div>
    );
  }

  const sub        = data?.subscription;
  const totalSpend = data?.payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0) ?? 0;
  const totalUsage = Object.values(data?.usage ?? {}).reduce((a, b) => a + b, 0);
  const usagePct   = sub ? Math.round((sub.monthlyUsage / sub.usageLimit) * 100) : 0;

  return (
    <div className="min-h-screen px-6 md:px-12 lg:px-20 pt-16 pb-24">

      {/* Hero */}
      <section className="mb-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="label-style mb-3">Профайл</p>
            <h1 className="text-[clamp(2rem,4vw,3rem)] tracking-[-0.02em]">
              {data?.user.phone ?? user?.phone ?? "—"}
            </h1>
            {data?.user.phoneVerified && (
              <span className="inline-flex items-center gap-[6px] mt-[10px] text-[0.72rem] font-bold text-[#16a34a] bg-[rgba(22,163,74,0.08)] border border-[rgba(22,163,74,0.2)] rounded-full px-3 py-[5px]">
                ✓ Баталгаажсан
              </span>
            )}
          </div>
          <button onClick={handleLogout}
            className="text-[0.84rem] font-semibold text-[#6e6e73] bg-transparent border border-[rgba(0,0,0,0.1)] rounded-full px-5 py-[9px] cursor-pointer self-start md:self-auto">
            Гарах
          </button>
        </div>
        <div className="mt-7 h-px bg-[rgba(0,0,0,0.07)]" />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left col */}
        <div className="flex flex-col gap-[14px]">

          {/* Subscription status */}
          {sub ? (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="label-style">Захиалга</p>
                <span className={`text-[0.7rem] font-bold px-[10px] py-1 rounded-full border ${PLAN_COLOR[sub.plan]}`}>
                  {sub.plan === "pro" ? "Pro" : "Basic"}
                </span>
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-[0.82rem] mb-2">
                  <span className="text-[#6e6e73]">Сарын ашиглалт</span>
                  <span className="font-bold text-[#1c1c1e]">{sub.monthlyUsage} / {sub.usageLimit}</span>
                </div>
                <div className="h-2 bg-[rgba(0,0,0,0.06)] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-[width] duration-700"
                    style={{
                      width: `${usagePct}%`,
                      background: usagePct >= 90 ? "#ef4444" : usagePct >= 60 ? "#d97706" : "#9333ea",
                    }} />
                </div>
                <p className="text-[0.72rem] text-[#8e8e93] mt-1">{sub.usageRemaining} шинжилгээ үлдсэн</p>
              </div>
              <div className="border-t border-[rgba(0,0,0,0.06)] pt-3 flex justify-between text-[0.8rem]">
                <span className="text-[#8e8e93]">Дуусах огноо</span>
                <span className="text-[#3a3a3c] font-medium">{fmt(sub.expiresAt)}</span>
              </div>
            </div>
          ) : (
            <div className="card p-5 text-center">
              <p className="text-[0.9rem] font-bold text-[#1c1c1e] mb-2">Захиалга байхгүй</p>
              <p className="text-[0.8rem] text-[#8e8e93] mb-4">Шинжилгээ авахын тулд захиалга сонгоно уу</p>
              <a href="/analyze" className="block py-[10px] rounded-full text-[0.85rem] font-bold text-white text-center"
                style={{ background: "linear-gradient(135deg,#9333ea,#7c3aed)", boxShadow: "0 4px 16px rgba(147,51,234,0.35)" }}>
                Захиалга авах →
              </a>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Нийт зарцуулсан", value: `${totalSpend.toLocaleString()}₮`, icon: "◇" },
              { label: "Нийт хэрэглэсэн", value: String(totalUsage),               icon: "◈" },
            ].map((s) => (
              <div key={s.label} className="card p-[18px]">
                <span className="text-[1.1rem] text-[#9333ea] block mb-[10px]">{s.icon}</span>
                <p className="text-[1.5rem] font-extrabold text-[#1c1c1e] tracking-[-0.02em]">{s.value}</p>
                <p className="label-style mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Feature usage */}
          <div className="card p-5">
            <p className="label-style mb-4">Боломжийн хэрэглээ</p>
            {isLoading ? (
              <div className="flex flex-col gap-[10px]">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-5 bg-[rgba(0,0,0,0.05)] rounded-lg" style={{ animation: "pulse 1.5s infinite" }} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {Object.entries(data?.usage ?? {}).map(([feat, count]) => {
                  const meta = FEATURE[feat];
                  const pct  = totalUsage > 0 ? Math.round((count / totalUsage) * 100) : 0;
                  return (
                    <div key={feat}>
                      <div className="flex justify-between items-center mb-[6px]">
                        <span className="flex items-center gap-[6px] text-[0.82rem] font-medium">
                          <span className="text-[0.75rem]" style={{ color: meta?.color ?? "#6e6e73" }}>{meta?.icon}</span>
                          <span className="text-[#6e6e73]">{meta?.label ?? feat}</span>
                        </span>
                        <span className="text-[0.87rem] font-bold text-[#1c1c1e]">{count}</span>
                      </div>
                      <div className="h-1 bg-[rgba(0,0,0,0.06)] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-[width] duration-[0.6s] ease-out"
                          style={{ background: meta?.color ?? "#9333ea", width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card p-[18px]">
            <p className="label-style mb-[10px]">Бүртгэлийн огноо</p>
            <p className="text-[0.9rem] font-semibold text-[#3a3a3c]">
              {data?.user.createdAt ? fmt(data.user.createdAt) : "—"}
            </p>
          </div>
        </div>

        {/* Right col — payment history */}
        <div className="lg:col-span-2">
          <p className="label-style mb-[14px]">Төлбөрийн түүх</p>

          {isLoading ? (
            <div className="flex flex-col gap-[10px]">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card h-16" style={{ animation: "pulse 1.5s infinite" }} />
              ))}
            </div>
          ) : !data?.payments.length ? (
            <div className="card p-10 text-center">
              <p className="text-[0.9rem] text-[#8e8e93]">Одоогоор төлбөрийн түүх байхгүй байна.</p>
              <p className="text-[0.82rem] text-[#aeaeb2] mt-[6px]">Шинжилгээ хийхэд л энд харагдана.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {data.payments.map((p) => {
                const feat = FEATURE[p.type];
                const sc   = STATUS_COLOR[p.status] ?? { text: "#8e8e93", bg: "rgba(0,0,0,0.04)", border: "rgba(0,0,0,0.08)" };
                const typeLabel =
                  p.type === "basic" ? "Basic захиалга" :
                  p.type === "pro"   ? "Pro захиалга"   :
                  feat?.label ?? p.type;
                return (
                  <div key={p.invoiceId} className="card px-5 py-[14px] flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-base shrink-0" style={{ color: feat?.color ?? "#9333ea" }}>
                        {p.type === "basic" || p.type === "pro" ? "★" : (feat?.icon ?? "◇")}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[0.87rem] font-semibold text-[#1c1c1e] overflow-hidden text-ellipsis whitespace-nowrap">{typeLabel}</p>
                        <p className="text-[0.75rem] text-[#8e8e93] mt-0.5">{fmt(p.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[0.72rem] font-bold tracking-[0.04em] px-[10px] py-1 rounded-full border"
                        style={{ color: sc.text, background: sc.bg, borderColor: sc.border }}>
                        {STATUS_LABEL[p.status] ?? p.status}
                      </span>
                      <span className="text-[0.9rem] font-extrabold text-[#1c1c1e]">{p.amount.toLocaleString()}₮</span>
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
