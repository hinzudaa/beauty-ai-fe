"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { generateOutfit, OutfitItem } from "@/apis/outfit";
import { fileToDataUrl } from "@/apis/analyze";
import { createInvoice, checkPayment, InvoiceResponse, QPayUrl } from "@/apis/payment";
import { tokenStore } from "@/utils/request";

const BADGE = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.1] text-white/60 text-[0.68rem] tracking-[0.14em] uppercase font-medium font-sans";
const LABEL = "text-[0.68rem] tracking-[0.18em] uppercase font-medium text-white/30 font-sans";
const CARD  = "bg-white/[0.04] border border-white/[0.07] rounded-[20px] backdrop-blur-xl";

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
    <button onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-sans transition-all ${
        active ? "bg-white text-black font-semibold" : "bg-white/[0.04] text-white/50 border border-white/[0.08] hover:text-white/80"
      }`}>
      {label}
    </button>
  );
}

export default function OutfitPage() {
  const [step, setStep]                     = useState<Step>("select");
  const [selectedEvent, setSelectedEvent]   = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState("Зун");
  const [selectedStyle, setSelectedStyle]   = useState("Minimal");
  const [preview, setPreview]               = useState<string | null>(null);
  const [dataUrl, setDataUrl]               = useState<string | null>(null);
  const [invoice, setInvoice]               = useState<InvoiceResponse | null>(null);
  const [result, setResult]                 = useState<OutfitItem[] | null>(null);
  const [error, setError]                   = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setPreview(URL.createObjectURL(file));
    setDataUrl(await fileToDataUrl(file));
  }

  async function handleStart() {
    if (!selectedEvent) return;
    if (!tokenStore.get()) { setError("Эхлээд нэвтэрнэ үү"); return; }
    setError(null);
    try {
      const inv = await createInvoice("outfit");
      setInvoice(inv);
      setStep("payment");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа");
    }
  }

  const runGenerate = useCallback(async () => {
    if (!selectedEvent) return;
    setStep("generating");
    setError(null);
    try {
      const res = await generateOutfit(selectedEvent, selectedSeason, selectedStyle, dataUrl ?? undefined);
      setResult(res.outfits);
      setStep("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа");
      setStep("select");
    }
  }, [selectedEvent, selectedSeason, selectedStyle, dataUrl]);

  useEffect(() => {
    if (step !== "payment" || !invoice) return;
    let cancelled = false;
    async function poll() {
      if (cancelled || !invoice) return;
      try {
        const status = await checkPayment(invoice.invoiceId);
        if (status.paid) { if (!cancelled) runGenerate(); return; }
      } catch { /* keep polling */ }
      if (!cancelled) timer = setTimeout(poll, 3_000);
    }
    let timer: ReturnType<typeof setTimeout> = setTimeout(poll, 3_000);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [step, invoice, runGenerate]);

  function reset() {
    setStep("select"); setSelectedEvent(null); setInvoice(null); setResult(null);
    setError(null); setPreview(null); setDataUrl(null);
  }

  return (
    <div className="min-h-screen px-6 md:px-12 lg:px-20 pt-16 pb-24">
      <section className="mb-16">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div className="max-w-2xl">
            <span className={BADGE}>✦ &nbsp;02 · MVP гол</span>
            <h1 className="mt-5" style={{ fontSize: "clamp(3rem, 6vw, 5rem)", letterSpacing: "-0.03em", lineHeight: 1.04 }}>
              Хувцас<br /><span className="text-white/80">Генератор</span>
            </h1>
            <p className="mt-5 text-base text-white/55 font-sans max-w-sm" style={{ lineHeight: 1.8 }}>
              Event сонгоод улирал, style-аа тохируулж AI-аар хувцас хослол авах.
            </p>
          </div>
          <div className="shrink-0 flex flex-col items-start md:items-end gap-1 pb-1">
            <p className="text-3xl font-kenoky text-white">06</p>
            <p className={LABEL}>Event сонголт</p>
          </div>
        </div>
        <div className="mt-10 h-px w-full bg-gradient-to-r from-white/20 via-white/5 to-transparent" />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 items-start">
        <div className="space-y-8">

          <div>
            <p className={`${LABEL} mb-3`}>Selfie upload (заавал биш — нэмэлт хувийн зөвлөмж авах)</p>
            <div
              className={`rounded-[20px] cursor-pointer transition-all overflow-hidden ${
                preview
                  ? "border border-white/[0.14] bg-white/[0.04]"
                  : "border border-dashed border-white/[0.07] bg-white/[0.02] hover:border-white/[0.15] hover:bg-white/[0.04]"
              }`}
              style={{ minHeight: "9rem" }}
              onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith("image/")) handleFile(f); }}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => inputRef.current?.click()}
            >
              <input ref={inputRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

              {preview ? (
                <div className="flex items-center gap-4 p-4">
                  <div className="relative shrink-0">
                    <Image src={preview} alt="preview" width={80} height={80}
                      className="object-cover rounded-xl border border-white/[0.12]" />
                    <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow">
                      <span className="text-black text-[0.5rem] font-bold">✦</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-white/70 font-sans">Selfie бэлэн</p>
                    <p className="text-xs text-white/30 font-sans mt-1">AI таны биеийн онцлогт тохируулан зөвлөмж гаргана</p>
                    <button onClick={(e) => { e.stopPropagation(); setPreview(null); setDataUrl(null); }}
                      className="mt-2 text-xs text-white/25 hover:text-red-400 transition-colors">Устгах ×</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3 p-6 text-center">
                  <span className="text-white/20 text-2xl">✦</span>
                  <div>
                    <p className="text-sm text-white/40 font-sans">Selfie нэмэх (заавал биш)</p>
                    <p className="text-xs text-white/20 font-sans mt-0.5">Нэмснээр илүү хувийн зөвлөмж авна</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <p className={`${LABEL} mb-4`}>Event сонгох</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {events.map((e) => (
                <button key={e.id}
                  disabled={step === "payment" || step === "generating"}
                  onClick={() => { setSelectedEvent(e.id); setResult(null); }}
                  className={`p-5 rounded-[20px] text-left transition-all disabled:opacity-50 ${
                    selectedEvent === e.id
                      ? "bg-white/[0.08] border border-white/[0.14] shadow-[0_0_40px_rgba(168,100,255,0.06)]"
                      : "bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.07] hover:border-white/[0.14]"
                  }`}>
                  <span className={`text-base mb-2 block ${selectedEvent === e.id ? "text-white" : "text-white/30"}`}>{e.icon}</span>
                  <p className="text-sm text-white font-sans font-medium mb-1">{e.label}</p>
                  <p className={`text-xs font-sans ${selectedEvent === e.id ? "text-white/60" : "text-white/30"}`}>{e.sub}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className={`${LABEL} mb-3`}>Улирал</p>
              <div className="flex flex-wrap gap-2">
                {seasons.map((s) => <Chip key={s} label={s} active={selectedSeason === s} onClick={() => setSelectedSeason(s)} />)}
              </div>
            </div>
            <div>
              <p className={`${LABEL} mb-3`}>Style</p>
              <div className="flex flex-wrap gap-2">
                {styles.map((s) => <Chip key={s} label={s} active={selectedStyle === s} onClick={() => setSelectedStyle(s)} />)}
              </div>
            </div>
          </div>

          {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">{error}</p>}

          {step === "select" && (
            <button onClick={handleStart} disabled={!selectedEvent}
              className={`w-full rounded-full text-sm font-semibold font-sans transition-all py-3.5 ${
                selectedEvent
                  ? "bg-white text-black hover:scale-[1.02] hover:opacity-90 shadow-[0_0_40px_rgba(255,255,255,0.15)]"
                  : "bg-white/[0.06] text-white/40 border border-white/[0.08] cursor-not-allowed opacity-50"
              }`} style={{ letterSpacing: "0.1em" }}>
              Эхлэх →
            </button>
          )}
        </div>

        <div className="space-y-4">
          {step === "select" && !result && (
            <>
              <p className={`${LABEL} mb-4`}>Хэрхэн ажилдаг вэ</p>
              {["Event-ээ сонго", "Улирал ба style тохируул", "QPay-ээр төлбөр хийнэ", "AI хослол гаргана"].map((t, i) => (
                <div key={i} className={`${CARD} p-5 flex gap-4 items-start hover:bg-white/[0.07] hover:border-white/[0.14] transition-all`}>
                  <span className="text-white/30 font-kenoky text-2xl leading-none shrink-0">{String(i + 1).padStart(2, "0")}</span>
                  <p className="text-sm text-white/55 font-sans pt-1">{t}</p>
                </div>
              ))}
            </>
          )}

          {step === "payment" && invoice && (
            <div className={`${CARD} p-6 text-center`}>
              <p className={`${LABEL} mb-2`}>QPay төлбөр</p>
              <p className="text-2xl font-kenoky text-white mb-1">{invoice.amount.toLocaleString()}₮</p>
              <p className="text-xs text-white/30 font-sans mb-5">Хувцасны зөвлөмж</p>
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
              <button onClick={reset} className="mt-4 w-full py-2.5 text-xs text-white/30 border border-white/[0.06] rounded-full hover:text-white/50 transition-all">← Буцах</button>
            </div>
          )}

          {step === "generating" && (
            <div className={`${CARD} p-12 text-center`}>
              <div className="flex gap-2.5 justify-center mb-5">
                {[0,1,2].map((i) => <span key={i} className="w-2 h-2 rounded-full inline-block bg-white animate-dot-blink" style={{ animationDelay: `${i * 0.18}s` }} />)}
              </div>
              <p className="text-base text-white/70 font-sans mb-1">Хослол үүсгэж байна</p>
              <p className="text-xs text-white/30 font-sans">{selectedSeason} · {selectedStyle}</p>
            </div>
          )}

          {step === "result" && result && (
            <div className="space-y-4 animate-fade-up">
              {result.map((outfit, i) => (
                <div key={i} className={`${CARD} p-6 hover:bg-white/[0.07] hover:border-white/[0.14] transition-all`}>
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <p className={`${LABEL} mb-1.5`}>Хослол {i + 1}</p>
                      <h3 style={{ fontSize: "1.15rem", letterSpacing: "-0.02em", fontFamily: "var(--font-kenoky)", fontWeight: 300, color: "rgba(255,255,255,0.9)" }}>{outfit.name}</h3>
                    </div>
                    <div className="flex gap-1.5 mt-1">
                      {outfit.colors.map((c) => <div key={c} className="w-5 h-5 rounded-full border border-white/10" style={{ background: c }} />)}
                    </div>
                  </div>
                  <ul className="space-y-2.5 mb-5">
                    {outfit.items.map((item) => (
                      <li key={item} className="flex gap-3.5 text-sm text-white/55 font-sans" style={{ lineHeight: 1.55 }}>
                        <span className="text-white/30 shrink-0">—</span>{item}
                      </li>
                    ))}
                  </ul>
                  <div className="rounded-[16px] p-4 bg-white/[0.04] border border-white/[0.08]">
                    <p className="text-xs text-white/55 font-sans" style={{ lineHeight: 1.75 }}>
                      <span className="text-white/30">Стилистийн зөвлөмж — </span>{outfit.tip}
                    </p>
                  </div>
                </div>
              ))}
              <button onClick={reset} className="w-full py-3.5 bg-white/[0.06] text-white/60 border border-white/[0.08] rounded-full hover:text-white hover:border-white/[0.18] transition-all font-sans text-sm">Дахин үүсгэх</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
