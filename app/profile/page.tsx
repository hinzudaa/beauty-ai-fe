"use client";

import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useAuth } from "@/lib/AuthContext";
import { getProfile, ProfileData } from "@/apis/profile";
import { tokenStore } from "@/utils/request";

const F = "var(--font-montserrat), 'Helvetica Neue', Arial, sans-serif";
const card: React.CSSProperties = { background: "#fff", border: "1px solid rgba(0,0,0,0.07)", borderRadius: 18, boxShadow: "0 2px 14px rgba(0,0,0,0.05)" };
const labelStyle: React.CSSProperties = { fontFamily: F, fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#8e8e93" };

const FEATURE: Record<string, { label: string; icon: string; color: string }> = {
  analyze:   { label: "Нүүрний шинжилгээ", icon: "◈", color: "#9333ea" },
  outfit:    { label: "Хувцас генератор",  icon: "◉", color: "#7c3aed" },
  hairstyle: { label: "Үс засал & Грим",   icon: "✦", color: "#a855f7" },
};

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  paid:    { color: "#16a34a", background: "rgba(22,163,74,0.08)",  border: "1px solid rgba(22,163,74,0.2)"  },
  pending: { color: "#d97706", background: "rgba(217,119,6,0.08)",  border: "1px solid rgba(217,119,6,0.2)"  },
  failed:  { color: "#dc2626", background: "rgba(220,38,38,0.08)",  border: "1px solid rgba(220,38,38,0.2)"  },
};
const STATUS_LABEL: Record<string, string> = { paid: "Төлсөн", pending: "Хүлээгдэж буй", failed: "Амжилтгүй" };

function fmt(d: string) { return new Date(d).toLocaleDateString("mn-MN", { year: "numeric", month: "2-digit", day: "2-digit" }); }

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
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ fontFamily: F, fontSize: "1rem", color: "#6e6e73" }}>Профайл харахын тулд нэвтрэнэ үү</p>
          <a href="/login" style={{ display: "inline-block", background: "#1c1c1e", color: "#fff", fontFamily: F, fontSize: "0.87rem", fontWeight: 700, padding: "11px 24px", borderRadius: 999, textDecoration: "none", boxShadow: "0 4px 14px rgba(0,0,0,0.18)" }}>
            Нэвтрэх →
          </a>
        </div>
      </div>
    );
  }

  const totalSpend = data?.payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0) ?? 0;
  const totalUsage = Object.values(data?.usage ?? {}).reduce((a, b) => a + b, 0);

  return (
    <div style={{ minHeight: "100vh", padding: "64px 24px 96px", fontFamily: F }} className="md:px-12 lg:px-20">

      {/* Hero */}
      <section style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }} className="md:flex-row md:items-end md:justify-between">
          <div>
            <p style={{ ...labelStyle, marginBottom: 12 }}>Профайл</p>
            <h1 style={{ fontFamily: F, fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 800, letterSpacing: "-0.02em", color: "#1c1c1e" }}>
              {data?.user.phone ?? user?.phone ?? "—"}
            </h1>
            {data?.user.phoneVerified && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 10, fontFamily: F, fontSize: "0.72rem", fontWeight: 700, color: "#16a34a", background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.2)", borderRadius: 999, padding: "5px 12px" }}>
                ✓ Баталгаажсан
              </span>
            )}
          </div>
          <button onClick={handleLogout}
            style={{ fontFamily: F, fontSize: "0.84rem", fontWeight: 600, color: "#6e6e73", background: "transparent", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 999, padding: "9px 20px", cursor: "pointer" }}>
            Гарах
          </button>
        </div>
        <div style={{ marginTop: 28, height: 1, background: "rgba(0,0,0,0.07)" }} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left col */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { label: "Нийт зарцуулсан", value: `${totalSpend.toLocaleString()}₮`, icon: "◇" },
              { label: "Нийт хэрэглэсэн", value: String(totalUsage), icon: "◈" },
            ].map((s) => (
              <div key={s.label} style={{ ...card, padding: 18 }}>
                <span style={{ fontSize: "1.1rem", color: "#9333ea", display: "block", marginBottom: 10 }}>{s.icon}</span>
                <p style={{ fontFamily: F, fontSize: "1.5rem", fontWeight: 800, color: "#1c1c1e", letterSpacing: "-0.02em" }}>{s.value}</p>
                <p style={{ ...labelStyle, marginTop: 4 }}>{s.label}</p>
              </div>
            ))}
          </div>

          <div style={{ ...card, padding: 20 }}>
            <p style={{ ...labelStyle, marginBottom: 16 }}>Боломжийн хэрэглээ</p>
            {isLoading
              ? <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{[...Array(3)].map((_, i) => <div key={i} style={{ height: 20, background: "rgba(0,0,0,0.05)", borderRadius: 8, animation: "pulse 1.5s infinite" }} />)}</div>
              : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {Object.entries(data?.usage ?? {}).map(([feat, count]) => {
                    const meta = FEATURE[feat];
                    const pct = totalUsage > 0 ? Math.round((count / totalUsage) * 100) : 0;
                    return (
                      <div key={feat}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: F, fontSize: "0.82rem", fontWeight: 500, color: meta?.color ?? "#6e6e73" }}>
                            <span style={{ fontSize: "0.75rem" }}>{meta?.icon}</span>
                            <span style={{ color: "#6e6e73" }}>{meta?.label ?? feat}</span>
                          </span>
                          <span style={{ fontFamily: F, fontSize: "0.87rem", fontWeight: 700, color: "#1c1c1e" }}>{count}</span>
                        </div>
                        <div style={{ height: 4, background: "rgba(0,0,0,0.06)", borderRadius: 999, overflow: "hidden" }}>
                          <div style={{ height: "100%", borderRadius: 999, background: meta?.color ?? "#9333ea", width: `${pct}%`, transition: "width 0.6s ease" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            }
          </div>

          <div style={{ ...card, padding: 18 }}>
            <p style={{ ...labelStyle, marginBottom: 10 }}>Бүртгэлийн огноо</p>
            <p style={{ fontFamily: F, fontSize: "0.9rem", fontWeight: 600, color: "#3a3a3c" }}>
              {data?.user.createdAt ? fmt(data.user.createdAt) : "—"}
            </p>
          </div>
        </div>

        {/* Right col */}
        <div style={{ gridColumn: "span 2" }} className="lg:col-span-2">
          <p style={{ ...labelStyle, marginBottom: 14 }}>Төлбөрийн түүх</p>

          {isLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[...Array(4)].map((_, i) => <div key={i} style={{ ...card, height: 64, animation: "pulse 1.5s infinite" }} />)}
            </div>
          ) : !data?.payments.length ? (
            <div style={{ ...card, padding: 40, textAlign: "center" }}>
              <p style={{ fontFamily: F, fontSize: "0.9rem", color: "#8e8e93" }}>Одоогоор төлбөрийн түүх байхгүй байна.</p>
              <p style={{ fontFamily: F, fontSize: "0.82rem", color: "#aeaeb2", marginTop: 6 }}>Шинжилгээ хийхэд л энд харагдана.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {data.payments.map((p) => {
                const feat = FEATURE[p.type];
                const statusStyle = STATUS_STYLE[p.status] ?? { color: "#8e8e93", background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.08)" };
                return (
                  <div key={p.invoiceId} style={{ ...card, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                      <span style={{ fontSize: "1rem", flexShrink: 0, color: feat?.color ?? "#8e8e93" }}>{feat?.icon ?? "◇"}</span>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontFamily: F, fontSize: "0.87rem", fontWeight: 600, color: "#1c1c1e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{feat?.label ?? p.type}</p>
                        <p style={{ fontFamily: F, fontSize: "0.75rem", color: "#8e8e93", marginTop: 2 }}>{fmt(p.createdAt)}</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                      <span style={{ fontFamily: F, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.04em", padding: "4px 10px", borderRadius: 999, ...statusStyle }}>
                        {STATUS_LABEL[p.status] ?? p.status}
                      </span>
                      <span style={{ fontFamily: F, fontSize: "0.9rem", fontWeight: 800, color: "#1c1c1e" }}>{p.amount.toLocaleString()}₮</span>
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
