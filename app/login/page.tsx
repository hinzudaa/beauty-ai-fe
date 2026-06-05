"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { otpStart, otpVerify } from "@/apis";
import { ApiError } from "@/utils/request";
import { useAuth } from "@/lib/AuthContext";
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
    if (new Date(s.expiresAt).getTime() < Date.now()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return s;
  } catch { return null; }
}

function extractSms(smsUri: string) {
  const destination = smsUri.startsWith("sms:") ? smsUri.slice(4).split("?")[0] : "";
  const code = smsUri.includes("?body=") ? decodeURIComponent(smsUri.split("?body=")[1]) : "";
  return { destination, code };
}

export default function LoginPage() {
  const { login } = useAuth();
  const router    = useRouter();

  const [session, setSession] = useState<OtpStartResponse | null>(() => loadSession());
  const [step,    setStep]    = useState<"phone" | "otp">(() => loadSession() ? "otp" : "phone");
  const [phone,   setPhone]   = useState("");
  const [error,   setError]   = useState("");
  const [busy,    setBusy]    = useState(false);

  useEffect(() => {
    if (step !== "otp" || !session) return;
    const sessionId = session.sessionId;
    let cancelled = false;

    async function check() {
      if (cancelled) return;
      try {
        const data = await otpVerify(sessionId);
        if (cancelled) return;
        if ("token" in data) {
          const res = data as AuthResponse;
          saveSession(null);
          login(res.token, res.user);
          const next = new URLSearchParams(window.location.search).get("next");
          router.push(next ? decodeURIComponent(next) : "/");
          return;
        }
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && (err.status === 404 || err.status === 410)) {
          saveSession(null);
          setError("OTP хугацаа дууссан. Дахин оролдоно уу.");
          setStep("phone"); setSession(null); return;
        }
      }
      if (!cancelled) timer = setTimeout(check, 2_000);
    }

    check();
    let timer: ReturnType<typeof setTimeout>;

    function onVisible() { if (!cancelled) { clearTimeout(timer); check(); } }
    function onVisChange() { if (document.visibilityState === "visible") onVisible(); }
    function onPageShow(e: PageTransitionEvent) { if (e.persisted) onVisible(); }

    document.addEventListener("visibilitychange", onVisChange);
    window.addEventListener("focus", onVisible);
    window.addEventListener("pageshow", onPageShow);

    return () => {
      cancelled = true;
      clearTimeout(timer!);
      document.removeEventListener("visibilitychange", onVisChange);
      window.removeEventListener("focus", onVisible);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [step, session, login, router]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault(); setError("");
    if (!/^\d{8,16}$/.test(phone)) { setError("Утасны дугаар 8–16 оронтой байх ёстой"); return; }
    setBusy(true);
    try {
      const res = await otpStart(phone);
      saveSession(res); setSession(res); setStep("otp");
    }
    catch (err) { setError(err instanceof Error ? err.message : "Алдаа гарлаа"); }
    finally { setBusy(false); }
  }

  function handleRetry() { saveSession(null); setStep("phone"); setSession(null); setError(""); }

  const disabled = busy || !phone;

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden">

      {/* Background orbs — kept as-is, radial gradients can't be pure Tailwind */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[200px] -left-[200px] w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #9333ea, transparent 70%)" }} />
        <div className="absolute -bottom-[200px] -right-[200px] w-[500px] h-[500px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #7c3aed, transparent 70%)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full opacity-10"
          style={{ background: "radial-gradient(ellipse, #c084fc, transparent 65%)" }} />
      </div>

      <div className="relative w-full max-w-[400px] px-5 py-10">

        {/* Logo */}
        <div className="flex justify-center">
          <Image src="/logoo.svg" alt="Looka" width={140} height={53} priority
            className="drop-shadow-[0_4px_12px_rgba(147,51,234,0.3)]" />
        </div>

        {/* Card */}
        <div className="rounded-[28px] p-8 relative overflow-hidden bg-white/80 backdrop-blur-2xl
          border border-white/60 shadow-[0_20px_60px_rgba(147,51,234,0.12),0_4px_24px_rgba(0,0,0,0.08)]">

          {/* Card top shimmer */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-200/60 to-transparent" />

          {/* ── PHONE STEP ── */}
          {step === "phone" && (
            <>
              <div className="py-4">
                <p className="text-[0.68rem] font-bold tracking-[0.15em] uppercase text-purple-600 mb-2">
                  ✦ LOOKA AI
                </p>
                <h1 className="text-[2rem] font-extrabold tracking-[-0.03em] leading-[1.1] text-[#1c1c1e]">
                  Тавтай морилно уу
                </h1>
              </div>
               <p className="pb-4 text-[0.88rem] text-[#6e6e73] leading-[1.5]">
                  Утасны дугаараа оруулж SMS-ээр нэвтэрнэ үү
                </p>

              <form onSubmit={handleSend} className="flex flex-col gap-4 mb-4" noValidate>
                <div>
                  <label className="block text-[0.72rem] font-bold text-[#8e8e93] uppercase tracking-[0.1em] mb-2">
                    Утасны дугаар
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8e8e93] text-[0.9rem] select-none">📱</span>
                    <input
                      type="tel" inputMode="numeric" placeholder="9900 1234"
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "")); setError(""); }}
                      className="w-full pl-11 pr-5 py-4 rounded-[14px] text-[0.95rem] font-semibold text-[#1c1c1e]
                        bg-[#f5f5f7] border border-gray-500 outline-none transition-all
                        focus:border-purple-400 focus:bg-purple-50/50"
                      autoComplete="tel" maxLength={16} autoFocus
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-[10px] px-4 py-[10px]">
                    <span className="text-[0.8rem]">⚠️</span>
                    <p className="text-[0.8rem] text-red-500">{error}</p>
                  </div>
                )}

                <button
                  type="submit" disabled={disabled}
                  className={`w-full py-4 rounded-[14px] text-[0.92rem] font-bold tracking-[0.02em] border-none transition-all duration-200
                    ${disabled
                      ? "bg-[rgba(0,0,0,0.06)] text-[#aeaeb2] cursor-not-allowed"
                      : "bg-gradient-to-br from-purple-600 to-violet-600 text-white cursor-pointer shadow-[0_8px_24px_rgba(147,51,234,0.35)] hover:shadow-[0_8px_32px_rgba(147,51,234,0.5)] hover:scale-[1.01] active:scale-[0.99]"
                    }`}
                >
                  {busy ? (
                    <span className="flex items-center justify-center gap-[6px]">
                      {[0,1,2].map((i) => (
                        <span key={i} className="animate-dot-blink w-[6px] h-[6px] rounded-full bg-white/60 inline-block"
                          style={{ animationDelay: `${i*0.15}s` }} />
                      ))}
                    </span>
                  ) : "Код авах →"}
                </button>
              </form>

               <p className="mt-12 text-center text-[0.72rem] text-gray-600 leading-[1.6]">
                Нэвтэрснээр{" "}
                <Link href="/terms" className="underline underline-offset-2 hover:text-[#9333ea] transition-colors">үйлчилгээний нөхцөл</Link>
                {" "}болон{" "}
                <Link href="/privacy" className="underline underline-offset-2 hover:text-[#9333ea] transition-colors">нууцлалын бодлого</Link>
                -г зөвшөөрч байна
              </p>
            </>
          )}

          {/* ── OTP STEP ── */}
          {step === "otp" && session && (() => {
            const { destination, code } = extractSms(session.smsUri);
            return (
              <>
                <div className="mb-6">
                  <p className="text-[0.68rem] font-bold tracking-[0.15em] uppercase text-purple-600 mb-2">
                    ✦ БАТАЛГААЖУУЛАЛТ
                  </p>
                  <h1 className="text-[1.8rem] font-extrabold tracking-[-0.03em] leading-[1.1] text-[#1c1c1e]">
                    SMS илгээнэ үү
                  </h1>
                  <p className="mt-2 text-[0.88rem] text-[#6e6e73]">
                    Доорх кодыг заасан дугаарт илгээнэ үү
                  </p>
                </div>

                {/* Destination + code card */}
                <div className="rounded-[18px] p-5 mb-5 bg-[#f5f5f7] border border-[rgba(0,0,0,0.06)]">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-[0.6rem] font-bold text-[#aeaeb2] uppercase tracking-[0.12em] mb-1">
                        Илгээх дугаар
                      </p>
                      <p className="text-[1.5rem] font-extrabold text-[#1c1c1e] tracking-wider">
                        {destination || "144773"}
                      </p>
                    </div>
                    <div className="w-px self-stretch bg-[rgba(0,0,0,0.06)]" />
                    <div className="flex-1 text-right">
                      <p className="text-[0.6rem] font-bold text-[#aeaeb2] uppercase tracking-[0.12em] mb-1">
                        Мессеж
                      </p>
                      <p className="text-[1.5rem] font-extrabold text-purple-500 tracking-[0.2em]">
                        {code}
                      </p>
                    </div>
                  </div>
                </div>

                {/* SMS button */}
                <button
                  type="button"
                  onClick={() => { window.location.href = session.smsUri; }}
                  className="w-full py-4 rounded-[14px] font-bold text-[0.92rem] text-white border-none cursor-pointer mb-4
                    bg-gradient-to-br from-purple-600 to-violet-600
                    shadow-[0_8px_24px_rgba(147,51,234,0.35)] hover:shadow-[0_8px_32px_rgba(147,51,234,0.5)]
                    hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
                >
                  ✉ SMS апп нээх
                </button>

                {/* Waiting indicator */}
                <div className="flex items-center justify-center gap-3 py-1 mb-4">
                  <div className="flex gap-[5px]">
                    {[0,1,2].map((i) => (
                      <span key={i} className="animate-dot-blink w-[5px] h-[5px] rounded-full bg-purple-500 inline-block"
                        style={{ animationDelay: `${i*0.2}s` }} />
                    ))}
                  </div>
                  <span className="text-[0.8rem] text-[#8e8e93]">Баталгаажуулалт хүлээж байна...</span>
                </div>

                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-[10px] px-4 py-[10px] mb-4">
                    <span className="text-[0.8rem]">⚠️</span>
                    <p className="text-[0.8rem] text-red-500">{error}</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleRetry}
                  className="w-full py-3 rounded-[14px] text-[0.85rem] font-semibold text-[#8e8e93]
                    cursor-pointer border-none bg-[rgba(0,0,0,0.04)] border border-[rgba(0,0,0,0.06)]
                    hover:text-[#3a3a3c] transition-colors"
                >
                  ← Дугаар солих
                </button>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
