"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { generateOutfit, OutfitItem } from "@/apis/outfit";
import { fileToDataUrl } from "@/apis/analyze";
import { createInvoice, checkPayment, InvoiceResponse, QPayUrl } from "@/apis/payment";
import { tokenStore } from "@/utils/request";
import { photoStore } from "@/utils/photoStore";

const events = [
  { id: "interview", label: "Ажлын ярилцлага", sub: "Professional", icon: "◈" },
  { id: "date",      label: "Date night",       sub: "Evening",      icon: "◉" },
  { id: "casual",    label: "Өдөр тутмын",      sub: "Casual",       icon: "○" },
  { id: "party",     label: "Party / Найр",      sub: "Night out",    icon: "✦" },
  { id: "wedding",   label: "Хурим / Ёслол",    sub: "Formal",       icon: "◇" },
  { id: "sport",     label: "Спорт",             sub: "Active",       icon: "◎" },
];
const seasons = ["Зун", "Намар", "Өвөл", "Хавар"];
const styles  = ["Minimal", "Feminine", "Streetwear", "Classic", "Boho"];

type Step = "select" | "payment" | "generating" | "result";

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-[0.84rem] px-[18px] py-2 rounded-full border cursor-pointer transition-all duration-150"
      style={{
        fontWeight: active ? 700 : 500,
        background: active ? "#1c1c1e" : "#fff",
        color: active ? "#fff" : "#6e6e73",
        borderColor: active ? "#1c1c1e" : "rgba(0,0,0,0.1)",
      }}
    >
      {label}
    </button>
  );
}

export default function OutfitPage() {
  const [step, setStep]                     = useState<Step>("select");
  const [selectedEvent, setSelectedEvent]   = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState("Зун");
  const [selectedStyle, setSelectedStyle]   = useState("Minimal");
  const [preview, setPreview]               = useState<string | null>(() => photoStore.get()?.preview ?? null);
  const [dataUrl, setDataUrl]               = useState<string | null>(() => photoStore.get()?.dataUrl ?? null);
  const [invoice, setInvoice]               = useState<InvoiceResponse | null>(null);
  const [result, setResult]                 = useState<OutfitItem[] | null>(null);
  const [error, setError]                   = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) { setPreview(URL.createObjectURL(file)); setDataUrl(await fileToDataUrl(file)); }

  async function handleStart() {
    if (!selectedEvent) return;
    if (!tokenStore.get()) { setError("Эхлээд нэвтэрнэ үү"); return; }
    setError(null);
    try { const inv = await createInvoice("outfit"); setInvoice(inv); setStep("payment"); }
    catch (err) { setError(err instanceof Error ? err.message : "Алдаа гарлаа"); }
  }

  const runGenerate = useCallback(async () => {
    if (!selectedEvent) return;
    setStep("generating"); setError(null);
    try { const res = await generateOutfit(selectedEvent, selectedSeason, selectedStyle, dataUrl ?? undefined); setResult(res.outfits); setStep("result"); }
    catch (err) { setError(err instanceof Error ? err.message : "Алдаа гарлаа"); setStep("select"); }
  }, [selectedEvent, selectedSeason, selectedStyle, dataUrl]);

  useEffect(() => {
    if (step !== "payment" || !invoice) return;
    let cancelled = false;
    async function poll() {
      if (cancelled || !invoice) return;
      try { const s = await checkPayment(invoice.invoiceId); if (s.paid) { if (!cancelled) runGenerate(); return; } }
      catch { /* keep polling */ }
      if (!cancelled) timer = setTimeout(poll, 3_000);
    }
    let timer: ReturnType<typeof setTimeout> = setTimeout(poll, 3_000);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [step, invoice, runGenerate]);

  function reset() { setStep("select"); setSelectedEvent(null); setInvoice(null); setResult(null); setError(null); setPreview(null); setDataUrl(null); }

  return (
    <div className="min-h-screen px-6 md:px-12 lg:px-20 pt-16 pb-24">

      {/* Hero */}
      <section className="mb-14">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-[560px]">
            <span className="label-style inline-flex items-center gap-[6px] px-[13px] py-[5px] rounded-full bg-[rgba(124,58,237,0.08)] border border-[rgba(124,58,237,0.2)] text-[#7c3aed]">
              ✦ &nbsp;02 · MVP гол
            </span>
            <h1 className="text-[clamp(2.6rem,6vw,4.5rem)] tracking-[-0.03em] leading-[1.06] text-[#1c1c1e] mt-5">
              Хувцас<br /><span className="text-[#6e6e73] font-bold">Генератор</span>
            </h1>
            <p className="mt-4 text-base font-medium text-[#6e6e73] leading-[1.75] max-w-[360px]">
              Event сонгоод улирал, style-аа тохируулж AI-аар хувцас хослол авах.
            </p>
          </div>
          <div className="flex flex-col gap-1 md:items-end">
            <p className="text-[2.5rem] font-extrabold text-[#1c1c1e] leading-none">06</p>
            <p className="label-style">Event сонголт</p>
          </div>
        </div>
        <div className="mt-9 h-px bg-[rgba(0,0,0,0.07)]" />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 items-start">
        <div className="flex flex-col gap-6">

          {/* Selfie upload */}
          <div>
            <p className="label-style mb-[10px]">Selfie upload (заавал биш — нэмэлт хувийн зөвлөмж авах)</p>
            <div
              className="rounded-[16px] min-h-[9rem] cursor-pointer overflow-hidden"
              style={{
                border: preview ? "1px solid rgba(147,51,234,0.2)" : "2px dashed rgba(0,0,0,0.1)",
                background: preview ? "rgba(147,51,234,0.03)" : "rgba(0,0,0,0.01)",
              }}
              onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith("image/")) handleFile(f); }}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => inputRef.current?.click()}
            >
              <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              {preview ? (
                <div className="flex items-center gap-4 p-4">
                  <div className="relative shrink-0">
                    <Image src={preview} alt="preview" width={80} height={80} className="object-cover rounded-xl border border-[rgba(0,0,0,0.08)]" />
                    <div className="absolute -bottom-[6px] -right-[6px] w-6 h-6 rounded-full bg-[#9333ea] flex items-center justify-center">
                      <span className="text-white text-[0.6rem]">✦</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[0.9rem] font-semibold text-[#1c1c1e]">Selfie бэлэн</p>
                    <p className="text-[0.8rem] text-[#8e8e93] mt-1">AI таны биеийн онцлогт тохируулан зөвлөмж гаргана</p>
                    <button onClick={(e) => { e.stopPropagation(); setPreview(null); setDataUrl(null); }}
                      className="mt-2 text-[0.78rem] text-[#ef4444] bg-transparent border-none cursor-pointer p-0">Устгах ×</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3 p-6 text-center">
                  <span className="text-[#c7c7cc] text-[1.5rem]">✦</span>
                  <div>
                    <p className="text-[0.9rem] font-semibold text-[#8e8e93]">Selfie нэмэх (заавал биш)</p>
                    <p className="text-[0.8rem] text-[#aeaeb2] mt-0.5">Нэмснээр илүү хувийн зөвлөмж авна</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Event select */}
          <div>
            <p className="label-style mb-3">Event сонгох</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-[10px]">
              {events.map((e) => (
                <button
                  key={e.id}
                  disabled={step === "payment" || step === "generating"}
                  onClick={() => { setSelectedEvent(e.id); setResult(null); }}
                  className="p-[18px_16px] rounded-[16px] text-left cursor-pointer transition-all duration-150 border"
                  style={{
                    background: selectedEvent === e.id ? "rgba(147,51,234,0.06)" : "#fff",
                    borderColor: selectedEvent === e.id ? "rgba(147,51,234,0.3)" : "rgba(0,0,0,0.08)",
                    boxShadow: selectedEvent === e.id ? "0 2px 12px rgba(147,51,234,0.1)" : "0 1px 4px rgba(0,0,0,0.04)",
                    opacity: (step === "payment" || step === "generating") ? 0.5 : 1,
                  }}
                >
                  <span className="text-[1.1rem] mb-2 block" style={{ color: selectedEvent === e.id ? "#9333ea" : "#aeaeb2" }}>{e.icon}</span>
                  <p className="text-[0.87rem] font-bold text-[#1c1c1e] mb-[2px]">{e.label}</p>
                  <p className="text-[0.75rem]" style={{ color: selectedEvent === e.id ? "#7c3aed" : "#8e8e93" }}>{e.sub}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Season + Style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="label-style mb-[10px]">Улирал</p>
              <div className="flex flex-wrap gap-2">
                {seasons.map((s) => <Chip key={s} label={s} active={selectedSeason === s} onClick={() => setSelectedSeason(s)} />)}
              </div>
            </div>
            <div>
              <p className="label-style mb-[10px]">Style</p>
              <div className="flex flex-wrap gap-2">
                {styles.map((s) => <Chip key={s} label={s} active={selectedStyle === s} onClick={() => setSelectedStyle(s)} />)}
              </div>
            </div>
          </div>

          {error && (
            <p className="text-[0.8rem] text-[#ef4444] bg-[rgba(239,68,68,0.06)] border border-[rgba(239,68,68,0.15)] rounded-xl px-4 py-[10px]">{error}</p>
          )}

          {step === "select" && (
            <button
              onClick={handleStart}
              disabled={!selectedEvent}
              className="w-full rounded-full font-bold text-[0.9rem] py-[14px] border-none tracking-[0.06em]"
              style={{
                background: selectedEvent ? "#1c1c1e" : "rgba(0,0,0,0.06)",
                color: selectedEvent ? "#fff" : "#aeaeb2",
                cursor: selectedEvent ? "pointer" : "not-allowed",
                boxShadow: selectedEvent ? "0 4px 16px rgba(0,0,0,0.18)" : "none",
              }}
            >
              Эхлэх →
            </button>
          )}
        </div>

        {/* Right col */}
        <div className="flex flex-col gap-[10px]">
          {step === "select" && !result && (
            <>
              <p className="label-style mb-3">Хэрхэн ажилдаг вэ</p>
              {["Event-ээ сонго", "Улирал ба style тохируул", "QPay-ээр төлбөр хийнэ", "AI хослол гаргана"].map((t, i) => (
                <div key={i} className="card p-[18px] flex gap-4 items-start">
                  <span className="text-[1.4rem] font-extrabold text-[#e5e5ea] leading-none shrink-0">{String(i + 1).padStart(2, "0")}</span>
                  <p className="text-[0.87rem] text-[#3a3a3c] pt-1 leading-[1.55]">{t}</p>
                </div>
              ))}
            </>
          )}

          {step === "payment" && invoice && (
            <div className="card p-6 text-center">
              <p className="label-style mb-2">QPay төлбөр</p>
              <p className="text-[1.8rem] font-extrabold text-[#1c1c1e] mb-1">{invoice.amount.toLocaleString()}₮</p>
              <p className="text-[0.8rem] text-[#8e8e93] mb-5">Хувцасны зөвлөмж</p>
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
                  <span key={i} className="animate-dot-blink w-[6px] h-[6px] rounded-full bg-[#9333ea] inline-block" style={{ animationDelay: `${i*0.2}s` }} />
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
              <button onClick={reset} className="mt-4 w-full py-[11px] bg-transparent border border-[rgba(0,0,0,0.1)] rounded-full text-[0.84rem] text-[#8e8e93] cursor-pointer">← Буцах</button>
            </div>
          )}

          {step === "generating" && (
            <div className="card p-12 text-center">
              <div className="flex gap-2 justify-center mb-4">
                {[0,1,2].map((i) => (
                  <span key={i} className="animate-dot-blink w-2 h-2 rounded-full bg-[#9333ea] inline-block" style={{ animationDelay: `${i*0.18}s` }} />
                ))}
              </div>
              <p className="text-base font-semibold text-[#1c1c1e] mb-[6px]">Хослол үүсгэж байна</p>
              <p className="label-style">{selectedSeason} · {selectedStyle}</p>
            </div>
          )}

          {step === "result" && result && (
            <div className="anim-fade-up flex flex-col gap-3">
              {result.map((outfit, i) => (
                <div key={i} className="card p-[22px]">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="label-style mb-[6px]">Хослол {i + 1}</p>
                      <h3 className="text-[1.05rem] font-extrabold text-[#1c1c1e] tracking-[-0.01em]">{outfit.name}</h3>
                    </div>
                    <div className="flex gap-[6px] mt-1">
                      {outfit.colors.map((c) => <div key={c} className="w-5 h-5 rounded-full border border-[rgba(0,0,0,0.1)]" style={{ background: c }} />)}
                    </div>
                  </div>
                  <ul className="flex flex-col gap-2 mb-4 list-none p-0">
                    {outfit.items.map((item) => (
                      <li key={item} className="flex gap-3 text-[0.87rem] text-[#3a3a3c] leading-[1.55]">
                        <span className="text-[#9333ea] shrink-0">—</span>{item}
                      </li>
                    ))}
                  </ul>
                  <div className="rounded-xl p-[14px] bg-[#f5f5f7] border border-[rgba(0,0,0,0.05)]">
                    <p className="text-[0.82rem] text-[#6e6e73] leading-[1.7]">
                      <span className="text-[#8e8e93]">Стилистийн зөвлөмж — </span>{outfit.tip}
                    </p>
                  </div>
                </div>
              ))}
              <button onClick={reset} className="w-full py-[13px] bg-transparent border border-[rgba(0,0,0,0.1)] rounded-full text-[0.87rem] font-semibold text-[#6e6e73] cursor-pointer">Дахин үүсгэх</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
