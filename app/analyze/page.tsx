"use client";

import Image from "next/image";
import { useState, useRef, useEffect, useCallback } from "react";
import { analyzeImage, fileToDataUrl, AnalyzeResult } from "@/apis/analyze";
import { analyzeHairstyle, HairstyleResult } from "@/apis/hairstyle";
import { generateOutfit, OutfitItem } from "@/apis/outfit";
import { createInvoice, checkPayment, InvoiceResponse, QPayUrl } from "@/apis/payment";
import { tokenStore } from "@/utils/request";
import { photoStore } from "@/utils/photoStore";

type Category = "face" | "hairstyle" | "outfit" | "makeup";
type Step = "upload" | "category" | "occasion" | "payment" | "analyzing" | "result";

const OCCASIONS = [
  { id: "interview", label: "Job Interview", icon: "💼", sub: "Professional" },
  { id: "date",      label: "Date Night",    icon: "🌙", sub: "Evening"      },
  { id: "casual",    label: "Өдөр тутам",    icon: "☀️", sub: "Casual"       },
  { id: "party",     label: "Party",         icon: "🎉", sub: "Night out"    },
  { id: "wedding",   label: "Хурим/Ёслол",  icon: "💒", sub: "Formal"       },
  { id: "study",     label: "Сурлага",       icon: "🎓", sub: "School"       },
];

const CATEGORIES: { id: Category; icon: string; label: string; sub: string; color: string }[] = [
  { id: "face",      icon: "◈", label: "Нүүрний шинжилгээ", sub: "Face shape · Skin tone · Style type", color: "#9333ea" },
  { id: "hairstyle", icon: "✦", label: "Үс засал & Нүүр будалт", sub: "Hair styles · Makeup looks",   color: "#a855f7" },
  { id: "outfit",    icon: "◉", label: "Хувцаслалт",         sub: "Outfit generator · Style advice",   color: "#7c3aed" },
  { id: "makeup",    icon: "◇", label: "Нүүр будалт",        sub: "Color palette · Look suggestions",  color: "#6d28d9" },
];

export default function AnalyzePage() {
  const [step, setStep]             = useState<Step>(() => photoStore.get() ? "category" : "upload");
  const [preview, setPreview]       = useState<string | null>(() => photoStore.get()?.preview ?? null);
  const [dataUrl, setDataUrl]       = useState<string | null>(() => photoStore.get()?.dataUrl ?? null);
  const [category, setCategory]     = useState<Category | null>(null);
  const [occasion, setOccasion]     = useState<string>("interview");
  const [invoice, setInvoice]       = useState<InvoiceResponse | null>(null);
  const [error, setError]           = useState<string | null>(null);
  const [faceResult, setFaceResult] = useState<AnalyzeResult | null>(null);
  const [hairResult, setHairResult] = useState<HairstyleResult | null>(null);
  const [outfitResult, setOutfitResult] = useState<OutfitItem[] | null>(null);
  const [hairTab, setHairTab]       = useState<"hair"|"makeup">("hair");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setPreview(URL.createObjectURL(file));
    setDataUrl(await fileToDataUrl(file));
    setError(null);
    setFaceResult(null); setHairResult(null); setOutfitResult(null);
    setStep("category");
  }

  async function handleStart() {
    if (!category) return;
    if (!tokenStore.get()) { setError("Эхлээд нэвтэрнэ үү"); return; }
    setError(null);
    try {
      const type = category === "face" ? "analyze" : category === "outfit" ? "outfit" : "hairstyle";
      const inv = await createInvoice(type);
      setInvoice(inv); setStep("payment");
    } catch (err) { setError(err instanceof Error ? err.message : "Алдаа гарлаа"); }
  }

  const runAnalysis = useCallback(async () => {
    if (!dataUrl || !category) return;
    setStep("analyzing"); setError(null);
    try {
      if (category === "face" || category === "makeup") {
        const res = await analyzeImage(dataUrl);
        setFaceResult(res);
      } else if (category === "hairstyle") {
        const res = await analyzeHairstyle(dataUrl);
        setHairResult(res);
      } else if (category === "outfit") {
        const res = await generateOutfit(occasion, "Зун", "Minimal", dataUrl);
        setOutfitResult(res.outfits);
      }
      setStep("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Шинжилгээ хийхэд алдаа гарлаа");
      setStep("category");
    }
  }, [dataUrl, category, occasion]);

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

  function reset() {
    setStep("upload"); setPreview(null); setDataUrl(null); setCategory(null);
    setInvoice(null); setError(null); setFaceResult(null); setHairResult(null); setOutfitResult(null);
  }

  const steps = ["Зураг", "Сонгох", "Үр дүн"];
  const stepIdx = step === "upload" ? 0 : step === "category" || step === "occasion" ? 1 : 2;

  return (
    <div className="min-h-screen">
      <div className="max-w-[900px] mx-auto px-5 md:px-8 pt-12 pb-24">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <span className="label-style inline-flex items-center gap-[6px] px-[13px] py-[5px] rounded-full bg-[rgba(147,51,234,0.08)] border border-[rgba(147,51,234,0.2)] text-[#9333ea]">
              ✦ &nbsp;AI Шинжилгээ
            </span>
            {/* Step indicators */}
            <div className="flex items-center gap-0 ml-auto">
              {steps.map((s, i) => (
                <div key={s} className="flex items-center">
                  <div className="flex items-center gap-[6px]">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300"
                      style={{ background: i <= stepIdx ? "#9333ea" : "rgba(0,0,0,0.07)" }}
                    >
                      <span className="text-[0.65rem] font-bold" style={{ color: i <= stepIdx ? "#fff" : "#8e8e93" }}>{i + 1}</span>
                    </div>
                    <span className={`text-[0.75rem] ${i === stepIdx ? "font-bold text-[#1c1c1e]" : "font-medium text-[#aeaeb2]"}`}>{s}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className="w-7 h-px mx-[6px] transition-all duration-300"
                      style={{ background: i < stepIdx ? "#9333ea" : "rgba(0,0,0,0.1)" }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <h1 className="text-[clamp(1.8rem,4vw,2.8rem)] tracking-[-0.03em] leading-[1.1]">
            {step === "upload" && "Зургаа оруулна уу"}
            {(step === "category" || step === "occasion") && "Юу шинжлэх вэ?"}
            {step === "payment" && "QPay төлбөр"}
            {step === "analyzing" && "Шинжилж байна..."}
            {step === "result" && "Таны үр дүн"}
          </h1>
        </div>

        {/* ── STEP 1: Upload ── */}
        {step === "upload" && (
          <div
            className="rounded-[24px] min-h-[380px] cursor-pointer overflow-hidden border-2 border-dashed border-[rgba(147,51,234,0.25)] bg-[rgba(147,51,234,0.02)] flex flex-col items-center justify-center gap-6 p-12 transition-all duration-200"
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith("image/")) handleFile(f); }}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
          >
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            <div className="w-[88px] h-[88px] rounded-full flex items-center justify-center bg-[rgba(147,51,234,0.1)] border-2 border-[rgba(147,51,234,0.2)]">
              <span className="text-[2.2rem]">📸</span>
            </div>
            <div className="text-center">
              <p className="text-[1.15rem] font-bold text-[#1c1c1e] mb-2">Зургаа чирж тавих эсвэл дарах</p>
              <p className="text-[0.88rem] text-[#8e8e93]">JPG · PNG · WEBP · Selfie хамгийн сайн</p>
              <p className="text-[0.8rem] text-[#9333ea] mt-2 font-semibold">Эхний удаа үнэгүй ✦</p>
            </div>
          </div>
        )}

        {/* ── STEP 2a: Category select ── */}
        {step === "category" && (
          <div className="flex flex-col gap-5">
            {preview && (
              <div className="card flex items-center gap-4 p-4">
                <Image src={preview} alt="preview" width={64} height={64} className="object-cover rounded-xl border border-[rgba(0,0,0,0.08)]" />
                <div>
                  <p className="text-[0.9rem] font-bold text-[#1c1c1e] mb-[2px]">Зураг бэлэн</p>
                  <p className="text-[0.8rem] text-[#8e8e93]">Доорх сонголтоо хийгээд үргэлжлүүлнэ үү</p>
                </div>
                <button onClick={reset} className="ml-auto text-[0.78rem] text-[#8e8e93] bg-transparent border-none cursor-pointer">Солих</button>
              </div>
            )}

            <p className="label-style">Юу хийлгэхийг хүсэж байна вэ?</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className="p-[22px_20px] rounded-[18px] text-left cursor-pointer transition-all duration-200 border-[1.5px]"
                  style={{
                    background: category === c.id ? `${c.color}08` : "#fff",
                    borderColor: category === c.id ? `${c.color}40` : "rgba(0,0,0,0.08)",
                    boxShadow: category === c.id ? `0 4px 20px ${c.color}18` : "0 1px 4px rgba(0,0,0,0.04)",
                  }}
                >
                  <span className="text-[1.5rem] block mb-3" style={{ color: category === c.id ? c.color : "#aeaeb2" }}>{c.icon}</span>
                  <p className="text-[0.95rem] font-extrabold text-[#1c1c1e] mb-[5px]">{c.label}</p>
                  <p className="text-[0.78rem] text-[#8e8e93] leading-[1.4]">{c.sub}</p>
                </button>
              ))}
            </div>

            {error && (
              <p className="text-[0.8rem] text-[#ef4444] bg-[rgba(239,68,68,0.06)] border border-[rgba(239,68,68,0.15)] rounded-xl px-4 py-[10px]">{error}</p>
            )}

            <div className="flex gap-3">
              <button onClick={reset} className="flex-1 py-[14px] bg-transparent border border-[rgba(0,0,0,0.1)] rounded-full font-semibold text-[0.9rem] text-[#6e6e73] cursor-pointer">← Буцах</button>
              <button
                onClick={() => category === "outfit" ? setStep("occasion") : handleStart()}
                disabled={!category}
                className="flex-[2] py-[14px] border-none rounded-full font-bold text-[0.9rem]"
                style={{
                  background: category ? "#1c1c1e" : "rgba(0,0,0,0.06)",
                  color: category ? "#fff" : "#aeaeb2",
                  cursor: category ? "pointer" : "not-allowed",
                  boxShadow: category ? "0 4px 16px rgba(0,0,0,0.18)" : "none",
                }}
              >
                {category === "outfit" ? "Occasion сонгох →" : "Шинжлэх →"}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2b: Occasion ── */}
        {step === "occasion" && (
          <div className="flex flex-col gap-5">
            <p className="label-style">Ямар нөхцөлд зориулж байна вэ?</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {OCCASIONS.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setOccasion(o.id)}
                  className="p-[18px_12px] rounded-[16px] text-center cursor-pointer transition-all duration-200 border-[1.5px]"
                  style={{
                    background: occasion === o.id ? "rgba(147,51,234,0.07)" : "#fff",
                    borderColor: occasion === o.id ? "rgba(147,51,234,0.35)" : "rgba(0,0,0,0.08)",
                    boxShadow: occasion === o.id ? "0 4px 16px rgba(147,51,234,0.12)" : "0 1px 4px rgba(0,0,0,0.04)",
                  }}
                >
                  <p className="text-[1.5rem] mb-2">{o.icon}</p>
                  <p className="text-[0.82rem] font-bold text-[#1c1c1e] mb-[3px]">{o.label}</p>
                  <p className="text-[0.7rem] text-[#8e8e93]">{o.sub}</p>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep("category")} className="flex-1 py-[14px] bg-transparent border border-[rgba(0,0,0,0.1)] rounded-full font-semibold text-[0.9rem] text-[#6e6e73] cursor-pointer">← Буцах</button>
              <button onClick={handleStart} className="flex-[2] py-[14px] bg-[#1c1c1e] text-white border-none rounded-full font-bold text-[0.9rem] cursor-pointer shadow-[0_4px_16px_rgba(0,0,0,0.18)]">
                Шинжлэх →
              </button>
            </div>
          </div>
        )}

        {/* ── Payment ── */}
        {step === "payment" && invoice && (
          <div className="max-w-[420px] mx-auto">
            <div className="card p-8 text-center">
              <p className="label-style mb-[10px]">QPay төлбөр</p>
              <p className="text-[2.2rem] font-extrabold text-[#1c1c1e] mb-1 tracking-[-0.02em]">{invoice.amount.toLocaleString()}₮</p>
              <p className="text-[0.85rem] text-[#8e8e93] mb-6">Beauty AI · AI Шинжилгээ</p>
              {invoice.qrImage && (
                <div className="flex justify-center mb-6">
                  <div className="bg-white p-[14px] rounded-[20px] border border-[rgba(0,0,0,0.07)] shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`data:image/png;base64,${invoice.qrImage}`} alt="QPay QR" width={200} height={200} className="rounded-[10px] block" />
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 justify-center mb-5">
                {[0,1,2].map((i) => (
                  <span key={i} className="animate-dot-blink w-[6px] h-[6px] rounded-full bg-[#9333ea] inline-block" style={{ animationDelay: `${i*0.2}s` }} />
                ))}
                <span className="text-[0.82rem] text-[#8e8e93]">Төлбөр хүлээж байна...</span>
              </div>
              {invoice.urls && invoice.urls.length > 0 && (
                <div>
                  <p className="label-style mb-3">Банкны апп-аар төлөх</p>
                  <div className="grid grid-cols-2 gap-2">
                    {invoice.urls.map((u: QPayUrl) => (
                      <a key={u.name} href={u.link} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-[10px] rounded-xl bg-[#f5f5f7] border border-[rgba(0,0,0,0.07)]">
                        {u.logo && <img src={u.logo} alt={u.name} width={26} height={26} className="rounded-[7px] object-contain shrink-0" />}
                        <span className="text-[0.75rem] text-[#3a3a3c] overflow-hidden text-ellipsis whitespace-nowrap">{u.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button onClick={reset} className="w-full mt-3 py-3 bg-transparent border border-[rgba(0,0,0,0.1)] rounded-full text-[0.85rem] text-[#8e8e93] cursor-pointer">← Буцах</button>
          </div>
        )}

        {/* ── Analyzing ── */}
        {step === "analyzing" && (
          <div className="card p-16 text-center max-w-[420px] mx-auto">
            <div className="flex gap-[10px] justify-center mb-5">
              {[0,1,2].map((i) => (
                <span key={i} className="animate-dot-blink w-[10px] h-[10px] rounded-full bg-[#9333ea] inline-block" style={{ animationDelay: `${i*0.18}s` }} />
              ))}
            </div>
            <p className="text-[1.1rem] font-bold text-[#1c1c1e] mb-2">AI шинжилж байна</p>
            <p className="label-style">
              {category === "face" && "НҮҮРНИЙ ХЭЛБЭР · АРЬСНЫ ТОН · STYLE TYPE"}
              {category === "hairstyle" && "ҮС ЗАСАЛ · НҮҮР БУДАЛТ"}
              {category === "outfit" && "ХУВЦАС ХОСЛОЛ · STYLE ЗӨВЛӨМЖ"}
              {category === "makeup" && "АРЬСНЫ ТОН · ӨНГӨНИЙ ПАЛЕТ"}
            </p>
          </div>
        )}

        {/* ── Results ── */}
        {step === "result" && (
          <div className="anim-fade-up flex flex-col gap-4">

            {faceResult && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { label: "Нүүрний хэлбэр", value: faceResult.faceShape },
                    { label: "Арьсны тон",      value: faceResult.skinTone  },
                    { label: "Style type",       value: faceResult.styleType },
                  ].map((s) => (
                    <div key={s.label} className="card p-[18px_14px] text-center">
                      <p className="label-style mb-2">{s.label}</p>
                      <p className="text-[0.88rem] font-bold text-[#1c1c1e] leading-[1.35]">{s.value}</p>
                    </div>
                  ))}
                </div>
                <div className="card p-[22px]">
                  <p className="label-style mb-[14px]">Өнгөний палет</p>
                  <div className="flex gap-3 flex-wrap">
                    {faceResult.colorPalette.map((c) => (
                      <div key={c} className="flex flex-col items-center gap-[6px]">
                        <div className="w-11 h-11 rounded-[14px] border border-[rgba(0,0,0,0.08)] shadow-[0_2px_8px_rgba(0,0,0,0.12)]" style={{ background: c }} />
                        <span className="text-[0.62rem] text-[#8e8e93]">{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card p-[22px]">
                  <p className="label-style mb-[14px]">AI зөвлөмж</p>
                  <ul className="flex flex-col gap-3 list-none p-0">
                    {faceResult.recommendations.map((r, i) => (
                      <li key={i} className="flex gap-3 text-[0.88rem] text-[#3a3a3c] leading-[1.65]">
                        <span className="text-[#9333ea] shrink-0">—</span>{r}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {hairResult && (
              <>
                <div className="card flex items-center gap-4 p-[18px]">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[rgba(168,85,247,0.08)] border border-[rgba(168,85,247,0.15)] shrink-0">
                    <span className="text-[#a855f7]">◈</span>
                  </div>
                  <div>
                    <p className="label-style">Нүүрний хэлбэр</p>
                    <p className="text-base font-bold text-[#1c1c1e] mt-1">{hairResult.faceShape} нүүр</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {(["hair","makeup"] as const).map((t) => (
                    <button key={t} onClick={() => setHairTab(t)}
                      className="text-[0.87rem] font-semibold px-5 py-[9px] rounded-full border cursor-pointer transition-all duration-150"
                      style={{
                        background: hairTab === t ? "#1c1c1e" : "#fff",
                        color: hairTab === t ? "#fff" : "#6e6e73",
                        borderColor: hairTab === t ? "#1c1c1e" : "rgba(0,0,0,0.1)",
                      }}>
                      {t === "hair" ? "Үс засал" : "Нүүр будалт"}
                    </button>
                  ))}
                </div>
                {hairTab === "hair" && hairResult.hair.map((h) => (
                  <div key={h.name} className="card p-[18px]">
                    <div className="flex items-start justify-between mb-[10px]">
                      <h3 className="text-[0.98rem] font-bold text-[#1c1c1e]">{h.name}</h3>
                      <span className="text-[0.68rem] font-semibold text-[#8e8e93] px-[10px] py-1 rounded-full bg-[#f5f5f7] border border-[rgba(0,0,0,0.06)] shrink-0 ml-3">{h.length}</span>
                    </div>
                    <p className="text-[0.87rem] text-[#6e6e73] leading-[1.65]">{h.desc}</p>
                  </div>
                ))}
                {hairTab === "makeup" && hairResult.makeup.map((m) => (
                  <div key={m.name} className="card p-[18px]">
                    <div className="flex items-center justify-between mb-[10px]">
                      <h3 className="text-[0.98rem] font-bold text-[#1c1c1e]">{m.name}</h3>
                      <div className="flex gap-[6px]">
                        {m.colors.map((c) => <div key={c} className="w-[22px] h-[22px] rounded-full border border-[rgba(0,0,0,0.1)]" style={{ background: c }} />)}
                      </div>
                    </div>
                    <p className="text-[0.87rem] text-[#6e6e73] leading-[1.65]">{m.desc}</p>
                  </div>
                ))}
              </>
            )}

            {outfitResult && outfitResult.map((outfit, i) => (
              <div key={i} className="card p-[22px]">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="label-style mb-[6px]">Хослол {i + 1}</p>
                    <h3 className="text-[1.05rem] font-extrabold text-[#1c1c1e] tracking-[-0.01em]">{outfit.name}</h3>
                  </div>
                  <div className="flex gap-[6px] mt-1">
                    {outfit.colors.map((c) => <div key={c} className="w-[22px] h-[22px] rounded-full border border-[rgba(0,0,0,0.1)]" style={{ background: c }} />)}
                  </div>
                </div>
                <ul className="flex flex-col gap-2 mb-[14px] list-none p-0">
                  {outfit.items.map((item) => (
                    <li key={item} className="flex gap-3 text-[0.87rem] text-[#3a3a3c] leading-[1.55]">
                      <span className="text-[#9333ea] shrink-0">—</span>{item}
                    </li>
                  ))}
                </ul>
                <div className="rounded-xl p-[14px] bg-[#f5f5f7] border border-[rgba(0,0,0,0.05)]">
                  <p className="text-[0.82rem] text-[#6e6e73] leading-[1.7]">
                    <span className="text-[#8e8e93]">Зөвлөмж — </span>{outfit.tip}
                  </p>
                </div>
              </div>
            ))}

            <div className="flex gap-3 mt-1 flex-wrap">
              <button
                onClick={() => { setStep("category"); setFaceResult(null); setHairResult(null); setOutfitResult(null); }}
                className="flex-1 min-w-[140px] py-[13px] bg-[rgba(147,51,234,0.08)] border border-[rgba(147,51,234,0.2)] rounded-full font-bold text-[0.87rem] text-[#9333ea] cursor-pointer"
              >
                Өөр шинжилгээ
              </button>
              <button
                onClick={reset}
                className="flex-1 min-w-[140px] py-[13px] bg-transparent border border-[rgba(0,0,0,0.1)] rounded-full font-semibold text-[0.87rem] text-[#6e6e73] cursor-pointer"
              >
                Дахин эхлэх
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
