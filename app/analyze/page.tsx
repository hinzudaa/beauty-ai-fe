"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { analyzeImage, fileToDataUrl, AnalyzeResult } from "@/apis/analyze";
import { createInvoice, checkPayment, InvoiceResponse, QPayUrl } from "@/apis/payment";
import { tokenStore } from "@/utils/request";

const BADGE = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.1] text-white/60 text-[0.68rem] tracking-[0.14em] uppercase font-medium font-sans";
const LABEL = "text-[0.68rem] tracking-[0.18em] uppercase font-medium text-white/30 font-sans";
const CARD  = "bg-white/[0.04] border border-white/[0.07] rounded-[20px] backdrop-blur-xl";

const FEATURES = [
  { icon: "◈", label: "Нүүрний хэлбэр", desc: "Oval, round, square, heart — AI тодорхойлно" },
  { icon: "◉", label: "Арьсны тон",      desc: "Warm, cool, neutral undertone шинжилгээ" },
  { icon: "✦", label: "Style type",       desc: "Таны гоо сайхны хувийн дүр төрхийг олно" },
];

type Step = "upload" | "payment" | "analyzing" | "result";

export default function AnalyzePage() {
  const [step, setStep]         = useState<Step>("upload");
  const [preview, setPreview]   = useState<string | null>(null);
  const [dataUrl, setDataUrl]   = useState<string | null>(null);
  const [invoice, setInvoice]   = useState<InvoiceResponse | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [result, setResult]     = useState<AnalyzeResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setPreview(URL.createObjectURL(file));
    setDataUrl(await fileToDataUrl(file));
    setStep("upload");
    setResult(null);
    setError(null);
    setInvoice(null);
  }

  async function handleStart() {
    if (!dataUrl) return;
    if (!tokenStore.get()) { setError("Эхлээд нэвтэрнэ үү"); return; }
    setError(null);
    try {
      const inv = await createInvoice();
      setInvoice(inv);
      setStep("payment");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа");
    }
  }

  useEffect(() => {
    if (step !== "payment" || !invoice) return;
    let cancelled = false;

    async function poll() {
      if (cancelled || !invoice) return;
      try {
        const status = await checkPayment(invoice.invoiceId);
        if (status.paid) {
          if (!cancelled) runAnalysis();
          return;
        }
      } catch { /* keep polling */ }
      if (!cancelled) timer = setTimeout(poll, 3_000);
    }

    let timer: ReturnType<typeof setTimeout> = setTimeout(poll, 3_000);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [step, invoice]);

  async function runAnalysis() {
    if (!dataUrl) return;
    setStep("analyzing");
    setError(null);
    try {
      const res = await analyzeImage(dataUrl);
      setResult(res);
      setStep("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Шинжилгээ хийхэд алдаа гарлаа");
      setStep("upload");
    }
  }

  function reset() {
    setStep("upload");
    setPreview(null);
    setDataUrl(null);
    setInvoice(null);
    setResult(null);
    setError(null);
  }

  return (
    <div className="min-h-screen px-6 md:px-12 lg:px-20 pt-16 pb-24">

      <section className="mb-16">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div className="max-w-2xl">
            <span className={BADGE}>✦ &nbsp;01 · AI Vision</span>
            <h1 className="mt-5" style={{ fontSize: "clamp(3rem, 6vw, 5rem)", letterSpacing: "-0.03em", lineHeight: 1.04 }}>
              Нүүрний<br />
              <span className="text-white/80">Шинжилгээ</span>
            </h1>
            <p className="mt-5 text-base text-white/55 font-sans max-w-sm" style={{ lineHeight: 1.8 }}>
              Selfie upload хийж нүүрний хэлбэр, арьсны тон, style type-ийг тодорхойлуулаарай.
            </p>
          </div>
          <div className="shrink-0 flex flex-col items-start md:items-end gap-1 pb-1">
            <p className="text-3xl font-kenoky text-white">AI</p>
            <p className={LABEL}>Powered analysis</p>
          </div>
        </div>
        <div className="mt-10 h-px w-full bg-gradient-to-r from-white/20 via-white/5 to-transparent" />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

        {/* ── LEFT: upload zone ── */}
        <div className="space-y-4">
          <div
            className={`rounded-[24px] transition-all overflow-hidden ${
              step === "payment" ? "cursor-default" : "cursor-pointer"
            } ${
              preview
                ? "border border-white/[0.14] bg-white/[0.04]"
                : "border border-dashed border-white/[0.1] bg-white/[0.02] hover:border-white/[0.2] hover:bg-white/[0.04]"
            }`}
            style={{ minHeight: "22rem" }}
            onDrop={(e) => { e.preventDefault(); if (step === "payment") return; const f = e.dataTransfer.files[0]; if (f?.type.startsWith("image/")) handleFile(f); }}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => { if (step !== "payment") inputRef.current?.click(); }}
          >
            <input ref={inputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

            {preview ? (
              <div className="flex flex-col items-center justify-center gap-5 p-10 h-full" style={{ minHeight: "22rem" }}>
                <div className="relative">
                  <Image src={preview} alt="preview" width={220} height={220}
                    className="object-cover rounded-2xl border border-white/[0.12] shadow-[0_0_60px_rgba(168,100,255,0.12)]" />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-lg">
                    <span className="text-black text-xs font-bold">✦</span>
                  </div>
                </div>
                {step === "upload" && (
                  <p className="text-sm text-white/30 font-sans" style={{ letterSpacing: "0.06em" }}>Дахин дарж зураг солих</p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-5 p-14" style={{ minHeight: "22rem" }}>
                <div className="relative">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center bg-white/[0.06] border border-white/[0.12]">
                    <span className="text-white/70 text-3xl">✦</span>
                  </div>
                  <div className="absolute inset-0 rounded-full bg-white/[0.08] animate-ping" style={{ animationDuration: "2.5s" }} />
                </div>
                <div className="text-center">
                  <p className="text-base text-white/70 font-sans mb-1.5">Зураг чирж тавих эсвэл дарах</p>
                  <p className="text-sm text-white/30 font-sans" style={{ letterSpacing: "0.04em" }}>JPG · PNG · WEBP · Selfie хамгийн сайн</p>
                </div>
              </div>
            )}
          </div>

          {step === "upload" && preview && (
            <button onClick={handleStart}
              className="w-full bg-white text-black rounded-full font-semibold py-3.5 hover:scale-[1.02] hover:opacity-90 transition-all shadow-[0_0_40px_rgba(255,255,255,0.15)] font-sans text-sm"
              style={{ letterSpacing: "0.1em" }}>
              Эхлэх →
            </button>
          )}

          {step === "analyzing" && (
            <div className={`${CARD} shadow-[0_0_40px_rgba(168,100,255,0.06)] p-10 text-center`}>
              <div className="flex gap-2.5 justify-center mb-5">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="w-2 h-2 rounded-full inline-block bg-white animate-dot-blink"
                    style={{ animationDelay: `${i * 0.18}s` }} />
                ))}
              </div>
              <p className="text-base text-white/70 font-sans mb-2">AI шинжилж байна</p>
              <p className="text-xs text-white/30 font-sans" style={{ letterSpacing: "0.1em" }}>НҮҮРНИЙ ХЭЛБЭР · АРЬСНЫ ТОН · STYLE TYPE</p>
            </div>
          )}

          {step === "result" && (
            <button onClick={reset}
              className="w-full py-3.5 bg-white/[0.06] text-white/60 border border-white/[0.08] rounded-full hover:text-white hover:border-white/[0.18] transition-all font-sans text-sm"
              style={{ letterSpacing: "0.08em" }}>
              Дахин шинжлэх
            </button>
          )}

          {error && (
            <p className="text-xs text-red-400 font-sans py-2.5 px-4 rounded-xl bg-red-500/[0.08] border border-red-500/[0.15] text-center">
              {error}
            </p>
          )}
        </div>

        {/* ── RIGHT ── */}

        {/* Info panel */}
        {step === "upload" && !result && (
          <div className="space-y-4 lg:pt-2">
            <p className={`${LABEL} mb-5`}>Юу тодорхойлогдох вэ</p>
            {FEATURES.map((f) => (
              <div key={f.label} className={`${CARD} shadow-[0_0_40px_rgba(168,100,255,0.06)] flex gap-5 p-5 hover:bg-white/[0.07] hover:border-white/[0.14] transition-all`}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/[0.06] border border-white/[0.1] shrink-0">
                  <span className="text-white/60 text-sm">{f.icon}</span>
                </div>
                <div>
                  <p className="text-sm text-white font-sans font-medium mb-1">{f.label}</p>
                  <p className="text-sm text-white/55 font-sans" style={{ lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </div>
            ))}
            <div className={`${CARD} mt-6 p-5`}>
              <p className="text-xs text-white/30 font-sans" style={{ lineHeight: 1.7 }}>
                Зургаа upload хийгээд <span className="text-white/60">Эхлэх</span> дарснаар QPay төлбөр хийнэ. Амжилттай төлсний дараа AI шинжилнэ.
              </p>
            </div>
          </div>
        )}

        {/* QPay payment panel */}
        {step === "payment" && invoice && (
          <div className="space-y-4 lg:pt-2 animate-fade-up">
            <div className={`${CARD} shadow-[0_0_40px_rgba(168,100,255,0.06)] p-6 text-center`}>
              <p className={`${LABEL} mb-3`}>QPay төлбөр</p>
              <p className="text-2xl font-kenoky text-white mb-1">{invoice.amount.toLocaleString()}₮</p>
              <p className="text-xs text-white/30 font-sans mb-5">Beauty AI · Нүүрний шинжилгээ</p>

              {invoice.qrImage && (
                <div className="flex justify-center mb-5">
                  <div className="bg-white p-3 rounded-2xl inline-block">
                    <img
                      src={`data:image/png;base64,${invoice.qrImage}`}
                      alt="QPay QR"
                      width={200}
                      height={200}
                      className="rounded-xl block"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 justify-center mb-5">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="w-1.5 h-1.5 rounded-full bg-gold animate-dot-blink inline-block"
                    style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
                <span className="text-xs text-white/35 font-sans">Төлбөр хүлээж байна...</span>
              </div>

              {invoice.urls && invoice.urls.length > 0 && (
                <div>
                  <p className={`${LABEL} mb-3`}>Банкны апп-аар төлөх</p>
                  <div className="grid grid-cols-2 gap-2">
                    {invoice.urls.map((u: QPayUrl) => (
                      <a key={u.name} href={u.link}
                        className="flex items-center gap-2 p-2.5 rounded-[14px] bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.08] transition-all text-left"
                        target="_blank" rel="noopener noreferrer">
                        {u.logo ? (
                          <img src={u.logo} alt={u.name} width={28} height={28} className="rounded-lg shrink-0 object-contain" />
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-white/[0.08] shrink-0" />
                        )}
                        <span className="text-xs text-white/60 font-sans truncate">{u.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button onClick={reset}
              className="w-full py-3 text-sm text-white/30 font-sans border border-white/[0.06] rounded-full hover:text-white/50 transition-all"
              style={{ letterSpacing: "0.05em" }}>
              ← Буцах
            </button>
          </div>
        )}

        {/* Result */}
        {step === "result" && result && (
          <div className="space-y-4 animate-fade-up lg:pt-2">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Нүүрний хэлбэр", value: result.faceShape },
                { label: "Арьсны тон",      value: result.skinTone  },
                { label: "Style type",       value: result.styleType },
              ].map((s) => (
                <div key={s.label} className={`${CARD} shadow-[0_0_40px_rgba(168,100,255,0.06)] p-4 text-center hover:bg-white/[0.07] hover:border-white/[0.14] transition-all`}>
                  <p className={`${LABEL} mb-2`}>{s.label}</p>
                  <p className="text-xs text-white/75 font-sans mt-2" style={{ lineHeight: 1.5 }}>{s.value}</p>
                </div>
              ))}
            </div>

            <div className={`${CARD} shadow-[0_0_40px_rgba(168,100,255,0.06)] p-5`}>
              <p className={`${LABEL} mb-4`}>Өнгөний палет</p>
              <div className="flex gap-3 flex-wrap">
                {result.colorPalette.map((c) => (
                  <div key={c} className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-[16px] border border-white/10 shadow-md" style={{ background: c }} />
                    <span className="text-[9px] text-white/30 font-sans">{c}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={`${CARD} shadow-[0_0_40px_rgba(168,100,255,0.06)] p-5`}>
              <p className={`${LABEL} mb-4`}>AI зөвлөмж</p>
              <ul className="space-y-3.5">
                {result.recommendations.map((r, i) => (
                  <li key={i} className="flex gap-3.5 text-sm text-white/55 font-sans" style={{ lineHeight: 1.7 }}>
                    <span className="text-white/30 shrink-0 mt-0.5">—</span>{r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
