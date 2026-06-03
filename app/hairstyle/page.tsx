"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { analyzeHairstyle, HairstyleResult } from "@/apis/hairstyle";
import { fileToDataUrl } from "@/apis/analyze";
import { createInvoice, checkPayment, InvoiceResponse, QPayUrl } from "@/apis/payment";
import { tokenStore } from "@/utils/request";

const BADGE = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.1] text-white/60 text-[0.68rem] tracking-[0.14em] uppercase font-medium font-sans";
const LABEL = "text-[0.68rem] tracking-[0.18em] uppercase font-medium text-white/30 font-sans";
const CARD  = "bg-white/[0.04] border border-white/[0.07] rounded-[20px] backdrop-blur-xl";

type Step = "upload" | "payment" | "analyzing" | "result";

export default function HairstylePage() {
  const [step, setStep]       = useState<Step>("upload");
  const [preview, setPreview] = useState<string | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<InvoiceResponse | null>(null);
  const [result, setResult]   = useState<HairstyleResult | null>(null);
  const [tab, setTab]         = useState<"hair" | "makeup">("hair");
  const [error, setError]     = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setPreview(URL.createObjectURL(file));
    setDataUrl(await fileToDataUrl(file));
    setResult(null); setStep("upload"); setError(null); setInvoice(null);
  }

  async function handleStart() {
    if (!dataUrl) return;
    if (!tokenStore.get()) { setError("Эхлээд нэвтэрнэ үү"); return; }
    setError(null);
    try {
      const inv = await createInvoice("hairstyle");
      setInvoice(inv); setStep("payment");
    } catch (err) { setError(err instanceof Error ? err.message : "Алдаа гарлаа"); }
  }

  const runAnalysis = useCallback(async () => {
    if (!dataUrl) return;
    setStep("analyzing"); setError(null);
    try {
      const res = await analyzeHairstyle(dataUrl);
      setResult(res); setStep("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа");
      setStep("upload");
    }
  }, [dataUrl]);

  useEffect(() => {
    if (step !== "payment" || !invoice) return;
    let cancelled = false;
    async function poll() {
      if (cancelled || !invoice) return;
      try {
        const status = await checkPayment(invoice.invoiceId);
        if (status.paid) { if (!cancelled) runAnalysis(); return; }
      } catch { /* keep polling */ }
      if (!cancelled) timer = setTimeout(poll, 3_000);
    }
    let timer: ReturnType<typeof setTimeout> = setTimeout(poll, 3_000);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [step, invoice, runAnalysis]);

  return (
    <div className="min-h-screen px-6 md:px-12 lg:px-20 pt-16 pb-24">

      {/* ── HERO ── */}
      <section className="mb-16">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div className="max-w-2xl">
            <span className={BADGE}>✦ &nbsp;03 · Үс · Грим</span>
            <h1 className="mt-5" style={{ fontSize: "clamp(3rem, 6vw, 5rem)", letterSpacing: "-0.03em", lineHeight: 1.04 }}>
              Үс засал &<br />
              <span className="text-white/80">Грим</span>
            </h1>
            <p className="mt-5 text-base text-white/55 font-sans max-w-sm" style={{ lineHeight: 1.8 }}>
              Зургаа upload хийж нүүрний хэлбэрт тохирсон үс засал, грим зөвлөмж авах.
            </p>
          </div>
          <div className="shrink-0 flex flex-col items-start md:items-end gap-1 pb-1">
            <p className="text-3xl font-kenoky text-white">07</p>
            <p className={LABEL}>Зөвлөмжийн тоо</p>
          </div>
        </div>
        <div className="mt-10 h-px w-full bg-gradient-to-r from-white/20 via-white/5 to-transparent" />
      </section>

      {/* ── SPLIT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

        {/* LEFT — upload */}
        <div className="space-y-4">
          <div
            className={`rounded-[24px] cursor-pointer transition-all overflow-hidden ${
              preview
                ? "border border-white/[0.14] bg-white/[0.04]"
                : "border border-dashed border-white/[0.1] bg-white/[0.02] hover:border-white/[0.2] hover:bg-white/[0.04]"
            }`}
            style={{ minHeight: "22rem" }}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith("image/")) handleFile(f); }}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
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
                <p className="text-sm text-white/30 font-sans" style={{ letterSpacing: "0.06em" }}>Дахин дарж солих</p>
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
                  <p className="text-sm text-white/30 font-sans">Урд тал харсан, тодорхой зураг хамгийн сайн</p>
                </div>
              </div>
            )}
          </div>

          {preview && step === "upload" && (
            <button onClick={handleStart}
              className="w-full bg-white text-black rounded-full font-semibold py-3.5 hover:scale-[1.02] hover:opacity-90 transition-all shadow-[0_0_40px_rgba(255,255,255,0.15)] font-sans text-sm"
              style={{ letterSpacing: "0.1em" }}>
              Шинжлэх →
            </button>
          )}

          {step === "payment" && invoice && (
            <div className={`${CARD} p-6 text-center`}>
              <p className={`${LABEL} mb-2`}>QPay төлбөр</p>
              <p className="text-2xl font-kenoky text-white mb-1">{invoice.amount.toLocaleString()}₮</p>
              <p className="text-xs text-white/30 font-sans mb-5">Үс засал & Грим шинжилгээ</p>
              {invoice.qrImage && (
                <div className="flex justify-center mb-5">
                  <div className="bg-white p-3 rounded-2xl inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`data:image/png;base64,${invoice.qrImage}`} alt="QPay QR" width={180} height={180} className="rounded-xl block" />
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 justify-center mb-4">
                {[0,1,2].map((i) => <span key={i} className="w-1.5 h-1.5 rounded-full bg-gold animate-dot-blink inline-block" style={{ animationDelay: `${i * 0.2}s` }} />)}
                <span className="text-xs text-white/35 font-sans">Хүлээж байна...</span>
              </div>
              {invoice.urls?.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {invoice.urls.slice(0, 6).map((u: QPayUrl) => (
                    <a key={u.name} href={u.link} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 rounded-[12px] bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.08] transition-all">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {u.logo && <img src={u.logo} alt={u.name} width={22} height={22} className="rounded-md shrink-0" />}
                      <span className="text-xs text-white/50 truncate">{u.name}</span>
                    </a>
                  ))}
                </div>
              )}
              <button onClick={() => { setStep("upload"); setInvoice(null); }} className="mt-4 w-full py-2.5 text-xs text-white/30 border border-white/[0.06] rounded-full hover:text-white/50 transition-all">← Буцах</button>
            </div>
          )}

          {step === "analyzing" && (
            <div className={`${CARD} shadow-[0_0_40px_rgba(168,100,255,0.06)] p-10 text-center`}>
              <div className="flex gap-2.5 justify-center mb-5">
                {[0,1,2].map((i) => <span key={i} className="w-2 h-2 rounded-full inline-block bg-white animate-dot-blink" style={{ animationDelay: `${i * 0.18}s` }} />)}
              </div>
              <p className="text-base text-white/70 font-sans">Шинжилж байна...</p>
            </div>
          )}

          {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">{error}</p>}

          {step === "result" && result && (
            <button onClick={() => { setPreview(null); setDataUrl(null); setResult(null); setStep("upload"); }}
              className="w-full py-3.5 bg-white/[0.06] text-white/60 border border-white/[0.08] rounded-full hover:text-white hover:border-white/[0.18] transition-all font-sans text-sm"
              style={{ letterSpacing: "0.08em" }}>
              Дахин шинжлэх
            </button>
          )}
        </div>

        {/* RIGHT — info or results */}
        {step === "upload" && !result && (
          <div className="space-y-4 lg:pt-2">
            <p className={`${LABEL} mb-4`}>Юу авах вэ</p>
            {[
              { icon: "◈", label: "Үс засал",  desc: "Нүүрний хэлбэрт тохирсон 4 үс заслын зөвлөмж" },
              { icon: "◉", label: "Грим look",  desc: "Арьсны тонд нийцсэн 3 грим стиль + өнгөний палет" },
              { icon: "✦", label: "Хувийн гид", desc: "Таны нүүрний онцлогт тулгуурласан зөвлөмж" },
            ].map((f) => (
              <div key={f.label} className={`${CARD} shadow-[0_0_40px_rgba(168,100,255,0.06)] p-5 flex gap-4 items-start hover:bg-white/[0.07] hover:border-white/[0.14] transition-all group`}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/[0.06] border border-white/[0.1] shrink-0 transition-colors">
                  <span className="text-white/60 text-sm">{f.icon}</span>
                </div>
                <div>
                  <p className="text-sm text-white font-sans font-medium mb-1">{f.label}</p>
                  <p className="text-sm text-white/55 font-sans" style={{ lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {step === "result" && result && (
          <div className="animate-fade-up lg:pt-2 space-y-4">
            {/* Face shape badge */}
            <div className={`${CARD} shadow-[0_0_40px_rgba(168,100,255,0.06)] flex items-center gap-4 p-5`}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/[0.06] border border-white/[0.1] shrink-0">
                <span className="text-white/60 text-sm">◈</span>
              </div>
              <div>
                <p className={LABEL}>Нүүрний хэлбэр</p>
                <p className="text-base text-white font-sans mt-1">{result.faceShape} нүүр</p>
              </div>
            </div>

            {/* Tab buttons */}
            <div className="flex gap-2">
              {(["hair", "makeup"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-6 py-2.5 rounded-full text-sm font-sans font-medium transition-all ${
                    tab === t
                      ? "bg-white text-black"
                      : "bg-white/[0.04] text-white/50 border border-white/[0.08] hover:text-white/80"
                  }`}>
                  {t === "hair" ? "Үс засал" : "Грим"}
                </button>
              ))}
            </div>

            {tab === "hair" && (
              <div className="space-y-3">
                {result.hair.map((h) => (
                  <div key={h.name} className={`${CARD} shadow-[0_0_40px_rgba(168,100,255,0.06)] p-5 hover:bg-white/[0.07] hover:border-white/[0.14] transition-all`}>
                    <div className="flex items-start justify-between mb-2.5">
                      <h3 style={{ fontSize: "0.95rem", letterSpacing: "-0.01em", fontFamily: "var(--font-kenoky)", fontWeight: 300, color: "rgba(255,255,255,0.9)" }}>{h.name}</h3>
                      <span className="text-[0.62rem] text-white/30 font-sans px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.07] shrink-0 ml-3">{h.length}</span>
                    </div>
                    <p className="text-sm text-white/55 font-sans" style={{ lineHeight: 1.7 }}>{h.desc}</p>
                  </div>
                ))}
              </div>
            )}

            {tab === "makeup" && (
              <div className="space-y-3">
                {result.makeup.map((m) => (
                  <div key={m.name} className={`${CARD} shadow-[0_0_40px_rgba(168,100,255,0.06)] p-5 hover:bg-white/[0.07] hover:border-white/[0.14] transition-all`}>
                    <div className="flex items-center justify-between mb-2.5">
                      <h3 style={{ fontSize: "0.95rem", letterSpacing: "-0.01em", fontFamily: "var(--font-kenoky)", fontWeight: 300, color: "rgba(255,255,255,0.9)" }}>{m.name}</h3>
                      <div className="flex gap-1.5">
                        {m.colors.map((c) => (
                          <div key={c} className="w-5 h-5 rounded-full border border-white/10" style={{ background: c }} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-white/55 font-sans" style={{ lineHeight: 1.7 }}>{m.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
