"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { otpStart, otpVerify } from "@/apis";
import { ApiError, tokenStore } from "@/utils/request";
import type { OtpStartResponse, AuthResponse } from "@/types/auth";

const F = "var(--font-montserrat), 'Helvetica Neue', Arial, sans-serif";

export default function LoginPage() {
  const [step, setStep]       = useState<"phone" | "otp">("phone");
  const [phone, setPhone]     = useState("");
  const [error, setError]     = useState("");
  const [busy, setBusy]       = useState(false);
  const [session, setSession] = useState<OtpStartResponse | null>(null);

  const { data: secondsLeft = 0 } = useSWR(
    session ? ["countdown", session.expiresAt] : null,
    ([, expiresAt]: [string, string]) => Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)),
    { refreshInterval: 1000, revalidateOnFocus: false }
  );

  useEffect(() => {
    if (step !== "otp" || !session) return;
    const sessionId = session.sessionId;
    const expiresAt = new Date(session.expiresAt).getTime();
    let cancelled = false;

    async function check() {
      if (cancelled) return;
      try {
        const data = await otpVerify(sessionId);
        if (cancelled) return;
        if ("token" in data) { const res = data as AuthResponse; tokenStore.set(res.token); window.location.href = "/"; return; }
        if (Date.now() < expiresAt + 2_000) { timer = setTimeout(check, 3_000); }
        else { setError("OTP хугацаа дууссан. Дахин оролдоно уу."); setStep("phone"); setSession(null); }
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && (err.status === 404 || err.status === 410)) { setError("OTP хугацаа дууссан. Дахин оролдоно уу."); setStep("phone"); setSession(null); return; }
        if (Date.now() < expiresAt + 2_000) { timer = setTimeout(check, 3_000); }
      }
    }

    let timer: ReturnType<typeof setTimeout> = setTimeout(check, 3_000);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [step, session]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault(); setError("");
    if (!/^\d{8,16}$/.test(phone)) { setError("Утасны дугаар 8–16 оронтой байх ёстой"); return; }
    setBusy(true);
    try { const res = await otpStart(phone); setSession(res); setStep("otp"); }
    catch (err) { setError(err instanceof Error ? err.message : "Алдаа гарлаа"); }
    finally { setBusy(false); }
  }

  function handleRetry() { setStep("phone"); setSession(null); setError(""); }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const inputStyle: React.CSSProperties = {
    width: "100%", fontFamily: F, fontSize: "0.95rem", fontWeight: 500,
    background: "#fff", border: "1px solid rgba(0,0,0,0.12)", borderRadius: 14,
    padding: "14px 18px", color: "#1c1c1e", outline: "none",
    boxSizing: "border-box", boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: F, background: "#f2f2f7" }}>
      <div style={{ width: "100%", maxWidth: 380 }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 40 }}>
          <span style={{ color: "#9333ea", fontSize: "1rem" }}>✦</span>
          <span style={{ fontFamily: F, fontWeight: 800, fontSize: "1.3rem", letterSpacing: "-0.02em", color: "#1c1c1e" }}>Beauty AI</span>
        </div>

        {/* Card */}
        <div style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.95)", borderRadius: 24, boxShadow: "0 4px 32px rgba(0,0,0,0.08)", padding: "36px 32px" }}>

          {step === "phone" && (
            <>
              <div style={{ textAlign: "center", marginBottom: 28 }}>
                <h1 style={{ fontFamily: F, fontSize: "1.8rem", fontWeight: 800, letterSpacing: "-0.02em", color: "#1c1c1e", lineHeight: 1.1 }}>Нэвтрэх</h1>
                <p style={{ marginTop: 8, fontFamily: F, fontSize: "0.9rem", fontWeight: 500, color: "#8e8e93" }}>Утасны дугаараа оруулна уу</p>
              </div>

              <form onSubmit={handleSend} style={{ display: "flex", flexDirection: "column", gap: 12 }} noValidate>
                <div>
                  <label style={{ fontFamily: F, fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#8e8e93", display: "block", marginBottom: 8 }}>
                    Утасны дугаар
                  </label>
                  <input
                    type="tel" inputMode="numeric" placeholder="99001234"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "")); setError(""); }}
                    style={inputStyle}
                    autoComplete="tel" maxLength={16} autoFocus
                  />
                </div>

                {error && <p style={{ fontFamily: F, fontSize: "0.8rem", color: "#ef4444", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 10, padding: "10px 14px" }}>{error}</p>}

                <button type="submit" disabled={busy || !phone}
                  style={{
                    marginTop: 4, width: "100%", padding: "14px 0", borderRadius: 999,
                    fontFamily: F, fontSize: "0.9rem", fontWeight: 700, letterSpacing: "0.04em", border: "none",
                    cursor: busy || !phone ? "not-allowed" : "pointer",
                    background: busy || !phone ? "rgba(0,0,0,0.08)" : "#1c1c1e",
                    color: busy || !phone ? "#aeaeb2" : "#fff",
                    boxShadow: busy || !phone ? "none" : "0 4px 16px rgba(0,0,0,0.18)",
                    transition: "all 0.15s",
                  }}>
                  {busy ? (
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      {[0,1,2].map((i) => <span key={i} className="animate-dot-blink" style={{ width: 6, height: 6, borderRadius: "50%", background: "#aeaeb2", display: "inline-block", animationDelay: `${i*0.15}s` }} />)}
                    </span>
                  ) : "Код авах →"}
                </button>
              </form>
            </>
          )}

          {step === "otp" && session && (
            <>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <h1 style={{ fontFamily: F, fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.02em", color: "#1c1c1e", lineHeight: 1.15 }}>SMS илгээнэ үү</h1>
                <p style={{ marginTop: 8, fontFamily: F, fontSize: "0.9rem", fontWeight: 500, color: "#8e8e93" }}>
                  <span style={{ color: "#1c1c1e", fontWeight: 700 }}>{phone}</span> дугаараас
                </p>
              </div>

              <div style={{ background: "#f5f5f7", border: "1px solid rgba(0,0,0,0.06)", borderRadius: 16, padding: 20, marginBottom: 16, textAlign: "center" }}>
                <p style={{ fontFamily: F, fontSize: "0.9rem", fontWeight: 500, color: "#3a3a3c", lineHeight: 1.7, marginBottom: 16 }}>
                  {session.displayInstruction}
                </p>
                <a href={session.smsUri}
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#1c1c1e", color: "#fff", fontFamily: F, fontSize: "0.9rem", fontWeight: 700, padding: "12px 24px", borderRadius: 999, textDecoration: "none", boxShadow: "0 4px 14px rgba(0,0,0,0.2)" }}>
                  <span>✉</span> SMS нээх
                </a>
                <p style={{ marginTop: 12, fontFamily: F, fontSize: "0.72rem", color: "#aeaeb2" }}>Гар утас дээр дарна уу</p>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 16 }}>
                <span style={{ display: "flex", gap: 6 }}>
                  {[0,1,2].map((i) => <span key={i} className="animate-dot-blink" style={{ width: 6, height: 6, borderRadius: "50%", background: "#9333ea", display: "inline-block", animationDelay: `${i*0.2}s` }} />)}
                </span>
                <span style={{ fontFamily: F, fontSize: "0.82rem", color: "#8e8e93" }}>Хүлээж байна...</span>
                {secondsLeft > 0 && <span style={{ fontFamily: F, fontSize: "0.8rem", color: "#aeaeb2" }}>{fmt(secondsLeft)}</span>}
              </div>

              {error && <p style={{ fontFamily: F, fontSize: "0.8rem", color: "#ef4444", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 10, padding: "10px 14px", textAlign: "center", marginBottom: 12 }}>{error}</p>}

              <button onClick={handleRetry}
                style={{ width: "100%", padding: "12px 0", background: "transparent", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 999, fontFamily: F, fontSize: "0.87rem", fontWeight: 600, color: "#6e6e73", cursor: "pointer" }}>
                ← Дугаар солих
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
