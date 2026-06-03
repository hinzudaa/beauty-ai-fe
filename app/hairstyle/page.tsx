"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { analyzeHairstyle, HairstyleResult } from "@/apis/hairstyle";
import { fileToDataUrl } from "@/apis/analyze";
import { createInvoice, checkPayment, InvoiceResponse, QPayUrl } from "@/apis/payment";
import { tokenStore } from "@/utils/request";
import { photoStore } from "@/utils/photoStore";

type Step = "upload" | "payment" | "analyzing" | "result";

export default function HairstylePage() {
  const [step, setStep]       = useState<Step>("upload");
  const [preview, setPreview] = useState<string | null>(() => photoStore.get()?.preview ?? null);
  const [dataUrl, setDataUrl] = useState<string | null>(() => photoStore.get()?.dataUrl ?? null);
  const [invoice, setInvoice] = useState<InvoiceResponse | null>(null);
  const [result, setResult]   = useState<HairstyleResult | null>(null);
  const [tab, setTab]         = useState<"hair" | "makeup">("hair");
  const [error, setError]     = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) { setPreview(URL.createObjectURL(file)); setDataUrl(await fileToDataUrl(file)); setResult(null); setStep("upload"); setError(null); setInvoice(null); }

  async function handleStart() {
    if (!dataUrl) return;
    if (!tokenStore.get()) { setError("Эхлээд нэвтэрнэ үү"); return; }
    setError(null);
    try { const inv = await createInvoice("hairstyle"); setInvoice(inv); setStep("payment"); }
    catch (err) { setError(err instanceof Error ? err.message : "Алдаа гарлаа"); }
  }

  const runAnalysis = useCallback(async () => {
    if (!dataUrl) return;
    setStep("analyzing"); setError(null);
    try { const res = await analyzeHairstyle(dataUrl); setResult(res); setStep("result"); }
    catch (err) { setError(err instanceof Error ? err.message : "Алдаа гарлаа"); setStep("upload"); }
  }, [dataUrl]);

  useEffect(() => {
    if (step !== "payment" || !invoice) return;
    let cancelled = false;
    async function poll() {
      if (cancelled || !invoice) return;
      try { const s = await checkPayment(invoice.invoiceId); if (s.paid) { if (!cancelled) runAnalysis(); return; } }
      catch { /* keep polling */ }
      if (!cancelled) timer = setTimeout(poll, 3_000);
    }
    let timer: ReturnType<typeof setTimeout> = setTimeout(poll, 3_000);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [step, invoice, runAnalysis]);

  return (
    <div className="min-h-screen px-6 md:px-12 lg:px-20 pt-16 pb-24">

      {/* Hero */}
      <section className="mb-14">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-[560px]">
            <span className="label-style inline-flex items-center gap-[6px] px-[13px] py-[5px] rounded-full bg-[rgba(168,85,247,0.08)] border border-[rgba(168,85,247,0.2)] text-[#a855f7]">
              ✦ &nbsp;03 · Үс · Грим
            </span>
            <h1 className="text-[clamp(2.6rem,6vw,4.5rem)] tracking-[-0.03em] leading-[1.06] text-[#1c1c1e] mt-5">
              Үс засал &<br /><span className="text-[#6e6e73] font-bold">Грим</span>
            </h1>
            <p className="mt-4 text-base font-medium text-[#6e6e73] leading-[1.75] max-w-[360px]">
              Зургаа upload хийж нүүрний хэлбэрт тохирсон үс засал, грим зөвлөмж авах.
            </p>
          </div>
          <div className="flex flex-col gap-1 md:items-end">
            <p className="text-[2.5rem] font-extrabold text-[#1c1c1e] leading-none">07</p>
            <p className="label-style">Зөвлөмжийн тоо</p>
          </div>
        </div>
        <div className="mt-9 h-px bg-[rgba(0,0,0,0.07)]" />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

        {/* LEFT — upload */}
        <div className="flex flex-col gap-3">
          <div
            className="rounded-[20px] min-h-[22rem] cursor-pointer overflow-hidden"
            style={{
              border: preview ? "1px solid rgba(168,85,247,0.2)" : "2px dashed rgba(0,0,0,0.1)",
              background: preview ? "rgba(168,85,247,0.03)" : "rgba(0,0,0,0.01)",
            }}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith("image/")) handleFile(f); }}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
          >
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            {preview ? (
              <div className="flex flex-col items-center justify-center gap-5 p-10 min-h-[22rem]">
                <div className="relative">
                  <Image src={preview} alt="preview" width={220} height={220} className="object-cover rounded-[16px] border border-[rgba(0,0,0,0.08)]" />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#a855f7] flex items-center justify-center">
                    <span className="text-white text-[0.7rem]">✦</span>
                  </div>
                </div>
                <p className="label-style text-[#aeaeb2]">Дахин дарж солих</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-5 p-14 min-h-[22rem]">
                <div className="w-[72px] h-[72px] rounded-full flex items-center justify-center bg-[rgba(168,85,247,0.08)] border border-[rgba(168,85,247,0.15)]">
                  <span className="text-[#a855f7] text-[1.8rem]">✦</span>
                </div>
                <div className="text-center">
                  <p className="text-base font-semibold text-[#3a3a3c] mb-[6px]">Зураг чирж тавих эсвэл дарах</p>
                  <p className="text-[0.84rem] text-[#aeaeb2]">Урд тал харсан, тодорхой зураг хамгийн сайн</p>
                </div>
              </div>
            )}
          </div>

          {preview && step === "upload" && (
            <button onClick={handleStart} className="w-full bg-[#1c1c1e] text-white rounded-full font-bold text-[0.9rem] py-[14px] border-none cursor-pointer tracking-[0.06em] shadow-[0_4px_16px_rgba(0,0,0,0.18)]">
              Шинжлэх →
            </button>
          )}

          {step === "payment" && invoice && (
            <div className="card p-6 text-center">
              <p className="label-style mb-2">QPay төлбөр</p>
              <p className="text-[1.8rem] font-extrabold text-[#1c1c1e] mb-1">{invoice.amount.toLocaleString()}₮</p>
              <p className="text-[0.8rem] text-[#8e8e93] mb-5">Үс засал & Грим шинжилгээ</p>
              {invoice.qrImage && (
                <div className="flex justify-center mb-5">
                  <div className="bg-white p-3 rounded-[16px] border border-[rgba(0,0,0,0.07)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`data:image/png;base64,${invoice.qrImage}`} alt="QPay QR" width={180} height={180} className="rounded-lg block" />
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 justify-center mb-4">
                {[0,1,2].map((i) => (
                  <span key={i} className="animate-dot-blink w-[6px] h-[6px] rounded-full bg-[#a855f7] inline-block" style={{ animationDelay: `${i*0.2}s` }} />
                ))}
                <span className="text-[0.8rem] text-[#8e8e93]">Хүлээж байна...</span>
              </div>
              {invoice.urls?.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {invoice.urls.slice(0, 6).map((u: QPayUrl) => (
                    <a key={u.name} href={u.link} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-[10px] rounded-xl bg-[#f5f5f7] border border-[rgba(0,0,0,0.07)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {u.logo && <img src={u.logo} alt={u.name} width={22} height={22} className="rounded-[6px] shrink-0" />}
                      <span className="text-[0.75rem] text-[#3a3a3c] overflow-hidden text-ellipsis whitespace-nowrap">{u.name}</span>
                    </a>
                  ))}
                </div>
              )}
              <button onClick={() => { setStep("upload"); setInvoice(null); }} className="mt-4 w-full py-[11px] bg-transparent border border-[rgba(0,0,0,0.1)] rounded-full text-[0.84rem] text-[#8e8e93] cursor-pointer">← Буцах</button>
            </div>
          )}

          {step === "analyzing" && (
            <div className="card p-10 text-center">
              <div className="flex gap-2 justify-center mb-4">
                {[0,1,2].map((i) => (
                  <span key={i} className="animate-dot-blink w-2 h-2 rounded-full bg-[#a855f7] inline-block" style={{ animationDelay: `${i*0.18}s` }} />
                ))}
              </div>
              <p className="text-base font-semibold text-[#1c1c1e]">Шинжилж байна...</p>
            </div>
          )}

          {error && (
            <p className="text-[0.8rem] text-[#ef4444] bg-[rgba(239,68,68,0.06)] border border-[rgba(239,68,68,0.15)] rounded-xl px-4 py-[10px]">{error}</p>
          )}

          {step === "result" && result && (
            <button onClick={() => { setPreview(null); setDataUrl(null); setResult(null); setStep("upload"); }}
              className="w-full py-[13px] bg-transparent border border-[rgba(0,0,0,0.1)] rounded-full text-[0.87rem] font-semibold text-[#6e6e73] cursor-pointer">
              Дахин шинжлэх
            </button>
          )}
        </div>

        {/* RIGHT */}
        {step === "upload" && !result && (
          <div className="flex flex-col gap-[10px]">
            <p className="label-style mb-3">Юу авах вэ</p>
            {[
              { icon: "◈", label: "Үс засал",  desc: "Нүүрний хэлбэрт тохирсон 4 үс заслын зөвлөмж" },
              { icon: "◉", label: "Грим look",  desc: "Арьсны тонд нийцсэн 3 грим стиль + өнгөний палет" },
              { icon: "✦", label: "Хувийн гид", desc: "Таны нүүрний онцлогт тулгуурласан зөвлөмж" },
            ].map((f) => (
              <div key={f.label} className="card flex gap-4 p-[18px]">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[rgba(168,85,247,0.07)] border border-[rgba(168,85,247,0.12)] shrink-0">
                  <span className="text-[#a855f7] text-base">{f.icon}</span>
                </div>
                <div>
                  <p className="text-[0.9rem] font-bold text-[#1c1c1e] mb-1">{f.label}</p>
                  <p className="text-[0.84rem] text-[#6e6e73] leading-[1.6]">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {step === "result" && result && (
          <div className="anim-fade-up flex flex-col gap-3">
            <div className="card flex items-center gap-4 p-[18px]">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[rgba(168,85,247,0.07)] border border-[rgba(168,85,247,0.12)] shrink-0">
                <span className="text-[#a855f7]">◈</span>
              </div>
              <div>
                <p className="label-style">Нүүрний хэлбэр</p>
                <p className="text-base font-bold text-[#1c1c1e] mt-1">{result.faceShape} нүүр</p>
              </div>
            </div>

            <div className="flex gap-2">
              {(["hair", "makeup"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className="text-[0.87rem] font-semibold px-5 py-[9px] rounded-full border cursor-pointer transition-all duration-150"
                  style={{
                    background: tab === t ? "#1c1c1e" : "#fff",
                    color: tab === t ? "#fff" : "#6e6e73",
                    borderColor: tab === t ? "#1c1c1e" : "rgba(0,0,0,0.1)",
                  }}>
                  {t === "hair" ? "Үс засал" : "Грим"}
                </button>
              ))}
            </div>

            {tab === "hair" && (
              <div className="flex flex-col gap-[10px]">
                {result.hair.map((h) => (
                  <div key={h.name} className="card p-[18px]">
                    <div className="flex items-start justify-between mb-[10px]">
                      <h3 className="text-[0.95rem] font-bold text-[#1c1c1e]">{h.name}</h3>
                      <span className="text-[0.68rem] font-semibold text-[#8e8e93] px-[10px] py-1 rounded-full bg-[#f5f5f7] border border-[rgba(0,0,0,0.06)] shrink-0 ml-3">{h.length}</span>
                    </div>
                    <p className="text-[0.87rem] text-[#6e6e73] leading-[1.65]">{h.desc}</p>
                  </div>
                ))}
              </div>
            )}

            {tab === "makeup" && (
              <div className="flex flex-col gap-[10px]">
                {result.makeup.map((m) => (
                  <div key={m.name} className="card p-[18px]">
                    <div className="flex items-center justify-between mb-[10px]">
                      <h3 className="text-[0.95rem] font-bold text-[#1c1c1e]">{m.name}</h3>
                      <div className="flex gap-[6px]">
                        {m.colors.map((c) => <div key={c} className="w-5 h-5 rounded-full border border-[rgba(0,0,0,0.1)]" style={{ background: c }} />)}
                      </div>
                    </div>
                    <p className="text-[0.87rem] text-[#6e6e73] leading-[1.65]">{m.desc}</p>
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
