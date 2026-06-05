"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { otpStart, otpVerify } from "@/apis";
import { ApiError, tokenStore } from "@/utils/request";
import type { OtpStartResponse, AuthResponse } from "@/types/auth";

const SESSION_KEY = "looka_otp_session";

function saveSession(s: OtpStartResponse | null) {
  if (typeof window === "undefined") return;
  if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
  else    localStorage.removeItem(SESSION_KEY);
}

function loadSession(): OtpStartResponse | null {
  try {
    const raw = typeof window !== "undefined" && localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as OtpStartResponse;
    // Discard expired sessions
    if (new Date(s.expiresAt).getTime() < Date.now()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return s;
  } catch { return null; }
}

export default function LoginPage() {
  const [step, setStep]       = useState<"phone" | "otp">("phone");
  const [phone, setPhone]     = useState("");
  const [error, setError]     = useState("");
  const [busy, setBusy]       = useState(false);
  const [session, setSession] = useState<OtpStartResponse | null>(null);

  // Restore session on mount (handles page reload after SMS app switch)
  useEffect(() => {
    const saved = loadSession();
    if (saved) { setSession(saved); setStep("otp"); }
  }, []);

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
        if ("token" in data) {
          const res = data as AuthResponse;
          saveSession(null);
          tokenStore.set(res.token);
          const next = new URLSearchParams(window.location.search).get("next");
          window.location.href = next ? decodeURIComponent(next) : "/";
          return;
        }
        if (Date.now() < expiresAt + 2_000) { timer = setTimeout(check, 3_000); }
        else {
          saveSession(null);
          setError("OTP хугацаа дууссан. Дахин оролдоно уу."); setStep("phone"); setSession(null);
        }
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && (err.status === 404 || err.status === 410)) {
          saveSession(null);
          setError("OTP хугацаа дууссан. Дахин оролдоно уу."); setStep("phone"); setSession(null); return;
        }
        if (Date.now() < expiresAt + 2_000) { timer = setTimeout(check, 3_000); }
      }
    }

    let timer: ReturnType<typeof setTimeout> = setTimeout(check, 3_000);

    // Mobile: fire immediately when user returns from SMS app
    function onVisible() {
      if (!cancelled) { clearTimeout(timer); timer = setTimeout(check, 400); }
    }
    function onVisChange() { if (document.visibilityState === "visible") onVisible(); }
    // pageshow fires on iOS when coming back from bfcache (cached page restore)
    function onPageShow(e: PageTransitionEvent) { if (e.persisted) onVisible(); }

    document.addEventListener("visibilitychange", onVisChange);
    window.addEventListener("focus", onVisible);
    window.addEventListener("pageshow", onPageShow);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisChange);
      window.removeEventListener("focus", onVisible);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [step, session]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault(); setError("");
    if (!/^\d{8,16}$/.test(phone)) { setError("Утасны дугаар 8–16 оронтой байх ёстой"); return; }
    setBusy(true);
    try { const res = await otpStart(phone); saveSession(res); setSession(res); setStep("otp"); }
    catch (err) { setError(err instanceof Error ? err.message : "Алдаа гарлаа"); }
    finally { setBusy(false); }
  }

  function handleRetry() { saveSession(null); setStep("phone"); setSession(null); setError(""); }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const disabled = busy || !phone;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#f2f2f7]">
      <div className="w-full max-w-[380px]">

        {/* Logo */}
        <div className="flex items-center justify-center gap-[10px] mb-10">
          <span className="text-[#9333ea] text-base">✦</span>
          <span className="font-extrabold text-[1.3rem] tracking-[-0.02em] text-[#1c1c1e]">Beauty AI</span>
        </div>

        {/* Card */}
        <div
          className="rounded-[24px] px-8 py-9 border border-[rgba(255,255,255,0.95)] shadow-[0_4px_32px_rgba(0,0,0,0.08)]"
          style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
        >

          {step === "phone" && (
            <>
              <div className="text-center mb-7">
                <h1 className="text-[1.8rem] tracking-[-0.02em] leading-[1.1]">Нэвтрэх</h1>
                <p className="mt-2 text-[0.9rem] font-medium text-[#8e8e93]">Утасны дугаараа оруулна уу</p>
              </div>

              <form onSubmit={handleSend} className="flex flex-col gap-3" noValidate>
                <div>
                  <label className="label-style block mb-2">Утасны дугаар</label>
                  <input
                    type="tel" inputMode="numeric" placeholder="99001234"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "")); setError(""); }}
                    className="w-full text-[0.95rem] font-medium bg-white border border-[rgba(0,0,0,0.12)] rounded-[14px] px-[18px] py-[14px] text-[#1c1c1e] outline-none shadow-[0_1px_4px_rgba(0,0,0,0.05)]"
                    autoComplete="tel" maxLength={16} autoFocus
                  />
                </div>

                {error && (
                  <p className="text-[0.8rem] text-[#ef4444] bg-[rgba(239,68,68,0.06)] border border-[rgba(239,68,68,0.15)] rounded-[10px] px-[14px] py-[10px]">
                    {error}
                  </p>
                )}

                <button
                  type="submit" disabled={disabled}
                  className="mt-1 w-full py-[14px] rounded-full text-[0.9rem] font-bold tracking-[0.04em] border-none transition-all duration-150"
                  style={{
                    cursor: disabled ? "not-allowed" : "pointer",
                    background: disabled ? "rgba(0,0,0,0.08)" : "#1c1c1e",
                    color: disabled ? "#aeaeb2" : "#fff",
                    boxShadow: disabled ? "none" : "0 4px 16px rgba(0,0,0,0.18)",
                  }}
                >
                  {busy ? (
                    <span className="flex items-center justify-center gap-[6px]">
                      {[0,1,2].map((i) => (
                        <span key={i} className="animate-dot-blink w-[6px] h-[6px] rounded-full bg-[#aeaeb2] inline-block" style={{ animationDelay: `${i*0.15}s` }} />
                      ))}
                    </span>
                  ) : "Код авах →"}
                </button>
              </form>
            </>
          )}

          {step === "otp" && session && (
            <>
              <div className="text-center mb-6">
                <h1 className="text-[1.6rem] tracking-[-0.02em] leading-[1.15]">SMS илгээнэ үү</h1>
                <p className="mt-2 text-[0.9rem] font-medium text-[#8e8e93]">
                  <span className="text-[#1c1c1e] font-bold">{phone}</span> дугаараас
                </p>
              </div>

              <div className="bg-[#f5f5f7] border border-[rgba(0,0,0,0.06)] rounded-[16px] p-5 mb-4 text-center">
                <p className="text-[0.9rem] font-medium text-[#3a3a3c] leading-[1.7] mb-4">
                  {session.displayInstruction}
                </p>
                <a
                  href={session.smsUri}
                  className="inline-flex items-center gap-2 bg-[#1c1c1e] text-white text-[0.9rem] font-bold px-6 py-3 rounded-full shadow-[0_4px_14px_rgba(0,0,0,0.2)]"
                >
                  <span>✉</span> SMS нээх
                </a>
                <p className="mt-3 text-[0.72rem] text-[#aeaeb2]">Гар утас дээр дарна уу</p>
              </div>

              <div className="flex items-center justify-center gap-[10px] mb-4">
                <span className="flex gap-[6px]">
                  {[0,1,2].map((i) => (
                    <span key={i} className="animate-dot-blink w-[6px] h-[6px] rounded-full bg-[#9333ea] inline-block" style={{ animationDelay: `${i*0.2}s` }} />
                  ))}
                </span>
                <span className="text-[0.82rem] text-[#8e8e93]">Хүлээж байна...</span>
                {secondsLeft > 0 && <span className="text-[0.8rem] text-[#aeaeb2]">{fmt(secondsLeft)}</span>}
              </div>

              {error && (
                <p className="text-[0.8rem] text-[#ef4444] bg-[rgba(239,68,68,0.06)] border border-[rgba(239,68,68,0.15)] rounded-[10px] px-[14px] py-[10px] text-center mb-3">
                  {error}
                </p>
              )}

              <button
                onClick={handleRetry}
                className="w-full py-3 bg-transparent border border-[rgba(0,0,0,0.1)] rounded-full text-[0.87rem] font-semibold text-[#6e6e73] cursor-pointer"
              >
                ← Дугаар солих
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
