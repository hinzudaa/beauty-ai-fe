"use client";

import { useState } from "react";
import useSWR from "swr";
import { useAuth } from "@/lib/AuthContext";
import { otpStart, otpVerify } from "@/apis";
import { ApiError } from "@/utils/request";
import type { OtpStartResponse, AuthResponse } from "@/types/auth";

export default function LoginPage() {
  const { login } = useAuth();

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [session, setSession] = useState<OtpStartResponse | null>(null);

  const { data: secondsLeft = 0 } = useSWR(
    session ? ["countdown", session.expiresAt] : null,
    ([, expiresAt]: [string, string]) =>
      Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)),
    { refreshInterval: 1000, revalidateOnFocus: false }
  );


  useSWR(
    step === "otp" && session ? ["otp-verify", session.sessionId] : null,
    ([, sessionId]: [string, string]) => otpVerify(sessionId),
    {
      refreshInterval: (latest) => (!latest || !("token" in latest) ? 3_000 : 0),
      revalidateOnFocus: false,
      shouldRetryOnError: (err: unknown) =>
        !(err instanceof ApiError && (err.status === 404 || err.status === 410)),
      onSuccess: (data) => {
        if (!("token" in data)) return;
        const res = data as AuthResponse;
        login(res.token, res.user);
        window.location.href = "/";
      },
      onError: (err: unknown) => {
        if (err instanceof ApiError && (err.status === 410 || err.status === 404)) {
          setError("OTP хугацаа дууссан. Дахин оролдоно уу.");
          setStep("phone");
          setSession(null);
        }
      },
    }
  );


  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!/^\d{8,16}$/.test(phone)) {
      setError("Утасны дугаар 8–16 оронтой байх ёстой");
      return;
    }
    setBusy(true);
    try {
      const res = await otpStart(phone);
      setSession(res);
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа");
    } finally {
      setBusy(false);
    }
  }

  function handleRetry() {
    setStep("phone");
    setSession(null);
    setError("");
  }

  function fmt(s: number) {
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">

        <div className="flex items-center justify-center gap-2 mb-10">
          <span className="text-gold text-base">✦</span>
          <span className="font-coffekan font-bold text-white text-2xl" style={{ letterSpacing: "0.04em" }}>
            Beauty AI
          </span>
        </div>

        {step === "phone" && (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl" style={{ letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                Нэвтрэх
              </h1>
              <p className="mt-2 text-sm text-white/40 font-sans">
                Утасны дугаараа оруулна уу
              </p>
            </div>

            <form onSubmit={handleSend} className="space-y-3" noValidate>
              <div>
                <label className="block text-[0.65rem] tracking-[0.16em] uppercase text-white/30 font-sans mb-2">
                  Утасны дугаар
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="99001234"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "")); setError(""); }}
                  className="w-full bg-white/[0.04] border border-white/[0.07] rounded-[14px] px-4 py-3.5 text-sm text-white font-sans outline-none placeholder:text-white/25 focus:border-white/[0.25] focus:bg-white/[0.06] transition-all"
                  autoComplete="tel"
                  maxLength={16}
                  autoFocus
                />
              </div>

              {error && (
                <p className="text-xs text-red-400 font-sans py-2 px-3 rounded-xl bg-red-500/[0.08] border border-red-500/[0.15]">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy || !phone}
                className={`w-full mt-1 py-3.5 rounded-full text-sm font-semibold font-sans transition-all ${busy || !phone
                    ? "bg-white/20 text-white/40 cursor-not-allowed"
                    : "bg-white text-black hover:scale-[1.02] hover:opacity-90 shadow-[0_0_40px_rgba(255,255,255,0.15)]"
                  }`}
                style={{ letterSpacing: "0.06em" }}>
                {busy ? (
                  <span className="flex items-center justify-center gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="w-1.5 h-1.5 rounded-full bg-white/50 animate-dot-blink inline-block"
                        style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </span>
                ) : "Код авах →"}
              </button>
            </form>
          </>
        )}

        {step === "otp" && session && (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl" style={{ letterSpacing: "-0.02em", lineHeight: 1.15 }}>
                SMS илгээнэ үү
              </h1>
              <p className="mt-2 text-sm text-white/50 font-sans">
                <span className="text-white/80">{phone}</span> дугаараас
              </p>
            </div>

            <div className="bg-white/[0.04] border border-white/[0.08] rounded-[20px] p-5 mb-4 text-center">
              <p className="text-sm text-white/70 font-sans mb-4" style={{ lineHeight: 1.7 }}>
                {session.displayInstruction}
              </p>

              <a
                href={session.smsUri}
                className="inline-flex items-center gap-2 bg-white text-black text-sm font-semibold px-6 py-3 rounded-full hover:scale-[1.02] hover:opacity-90 transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)] font-sans"
                style={{ letterSpacing: "0.04em" }}>
                <span>✉</span> SMS нээх
              </a>

              <p className="mt-3 text-[0.68rem] text-white/25 font-sans">
                Гар утас дээр дарна уу
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="w-1.5 h-1.5 rounded-full bg-gold animate-dot-blink inline-block"
                    style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </span>
              <span className="text-xs text-white/35 font-sans">Хүлээж байна...</span>
              {secondsLeft > 0 && (
                <span className="text-xs text-white/25 font-sans">{fmt(secondsLeft)}</span>
              )}
            </div>

            {error && (
              <p className="text-xs text-red-400 font-sans py-2 px-3 rounded-xl bg-red-500/[0.08] border border-red-500/[0.15] text-center mb-3">
                {error}
              </p>
            )}

            <button
              onClick={handleRetry}
              className="w-full py-3 text-sm text-white/35 font-sans border border-white/[0.07] rounded-full hover:text-white/60 hover:border-white/[0.15] transition-all"
              style={{ letterSpacing: "0.05em" }}>
              ← Дугаар солих
            </button>
          </>
        )}
      </div>
    </div>
  );
}
