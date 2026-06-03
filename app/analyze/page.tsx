"use client";

import Image from "next/image";
import { useState, useRef, useEffect, useCallback } from "react";
import { analyzeImage, fileToDataUrl, AnalyzeResult } from "@/apis/analyze";
import { analyzeHairstyle, HairstyleResult } from "@/apis/hairstyle";
import { generateOutfit, OutfitItem } from "@/apis/outfit";
import { createInvoice, checkPayment, InvoiceResponse, QPayUrl } from "@/apis/payment";
import { tokenStore } from "@/utils/request";
import { photoStore } from "@/utils/photoStore";

const F = "var(--font-montserrat), 'Helvetica Neue', Arial, sans-serif";
const card: React.CSSProperties = { background: "#fff", border: "1px solid rgba(0,0,0,0.07)", borderRadius: 18, boxShadow: "0 2px 14px rgba(0,0,0,0.05)" };
const labelStyle: React.CSSProperties = { fontFamily: F, fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#8e8e93" };

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
  { id: "hairstyle", icon: "✦", label: "Үс засал & Нүүр будалт", sub: "Hair styles · Makeup looks",           color: "#a855f7" },
  { id: "outfit",    icon: "◉", label: "Хувцаслалт",         sub: "Outfit generator · Style advice",         color: "#7c3aed" },
  { id: "makeup",    icon: "◇", label: "Нүүр будалт",        sub: "Color palette · Look suggestions",        color: "#6d28d9" },
];

export default function AnalyzePage() {
  const [step, setStep]             = useState<Step>("upload");
  const [preview, setPreview]       = useState<string | null>(null);
  const [dataUrl, setDataUrl]       = useState<string | null>(null);
  const [category, setCategory]     = useState<Category | null>(null);
  const [occasion, setOccasion]     = useState<string>("interview");
  const [invoice, setInvoice]       = useState<InvoiceResponse | null>(null);
  const [error, setError]           = useState<string | null>(null);
  const [faceResult, setFaceResult] = useState<AnalyzeResult | null>(null);
  const [hairResult, setHairResult] = useState<HairstyleResult | null>(null);
  const [outfitResult, setOutfitResult] = useState<OutfitItem[] | null>(null);
  const [hairTab, setHairTab]       = useState<"hair"|"makeup">("hair");
  const inputRef = useRef<HTMLInputElement>(null);

  // auto-load from homepage upload
  useEffect(() => {
    const stored = photoStore.get();
    if (stored && !preview) {
      setPreview(stored.preview);
      setDataUrl(stored.dataUrl);
      setStep("category");
    }
  }, []);

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

  /* ── Step indicator ── */
  const steps = ["Зураг", "Сонгох", "Үр дүн"];
  const stepIdx = step === "upload" ? 0 : step === "category" || step === "occasion" ? 1 : 2;

  return (
    <div style={{ minHeight: "100vh", fontFamily: F }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 20px 96px" }} className="md:px-8">

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            <span style={{ ...labelStyle, display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 13px", borderRadius: 999, background: "rgba(147,51,234,0.08)", border: "1px solid rgba(147,51,234,0.2)", color: "#9333ea" }}>
              ✦ &nbsp;AI Шинжилгээ
            </span>
            {/* Step indicators */}
            <div style={{ display: "flex", alignItems: "center", gap: 0, marginLeft: "auto" }}>
              {steps.map((s, i) => (
                <div key={s} style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: i <= stepIdx ? "#9333ea" : "rgba(0,0,0,0.07)", transition: "all 0.3s" }}>
                      <span style={{ fontFamily: F, fontSize: "0.65rem", fontWeight: 700, color: i <= stepIdx ? "#fff" : "#8e8e93" }}>{i + 1}</span>
                    </div>
                    <span style={{ fontFamily: F, fontSize: "0.75rem", fontWeight: i === stepIdx ? 700 : 500, color: i <= stepIdx ? "#1c1c1e" : "#aeaeb2" }}>{s}</span>
                  </div>
                  {i < steps.length - 1 && <div style={{ width: 28, height: 1, background: i < stepIdx ? "#9333ea" : "rgba(0,0,0,0.1)", margin: "0 6px", transition: "all 0.3s" }} />}
                </div>
              ))}
            </div>
          </div>

          <h1 style={{ fontFamily: F, fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 800, letterSpacing: "-0.03em", color: "#1c1c1e", lineHeight: 1.1, margin: 0 }}>
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
            style={{
              borderRadius: 24, minHeight: 380, cursor: "pointer", overflow: "hidden",
              border: "2px dashed rgba(147,51,234,0.25)", background: "rgba(147,51,234,0.02)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24, padding: 48,
              transition: "all 0.2s",
            }}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith("image/")) handleFile(f); }}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
          >
            <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            <div style={{ position: "relative" }}>
              <div style={{ width: 88, height: 88, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(147,51,234,0.1)", border: "2px solid rgba(147,51,234,0.2)" }}>
                <span style={{ fontSize: "2.2rem" }}>📸</span>
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontFamily: F, fontSize: "1.15rem", fontWeight: 700, color: "#1c1c1e", marginBottom: 8 }}>Зургаа чирж тавих эсвэл дарах</p>
              <p style={{ fontFamily: F, fontSize: "0.88rem", color: "#8e8e93" }}>JPG · PNG · WEBP · Selfie хамгийн сайн</p>
              <p style={{ fontFamily: F, fontSize: "0.8rem", color: "#9333ea", marginTop: 8, fontWeight: 600 }}>Эхний удаа үнэгүй ✦</p>
            </div>
          </div>
        )}

        {/* ── STEP 2a: Category select ── */}
        {step === "category" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Preview thumb */}
            {preview && (
              <div style={{ display: "flex", alignItems: "center", gap: 16, ...card, padding: 16 }}>
                <Image src={preview} alt="preview" width={64} height={64} style={{ objectFit: "cover", borderRadius: 12, border: "1px solid rgba(0,0,0,0.08)" }} />
                <div>
                  <p style={{ fontFamily: F, fontSize: "0.9rem", fontWeight: 700, color: "#1c1c1e", marginBottom: 2 }}>Зураг бэлэн</p>
                  <p style={{ fontFamily: F, fontSize: "0.8rem", color: "#8e8e93" }}>Доорх сонголтоо хийгээд үргэлжлүүлнэ үү</p>
                </div>
                <button onClick={reset} style={{ marginLeft: "auto", fontFamily: F, fontSize: "0.78rem", color: "#8e8e93", background: "none", border: "none", cursor: "pointer" }}>Солих</button>
              </div>
            )}

            <p style={{ ...labelStyle }}>Юу хийлгэхийг хүсэж байна вэ?</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {CATEGORIES.map((c) => (
                <button key={c.id} onClick={() => setCategory(c.id)}
                  style={{
                    padding: "22px 20px", borderRadius: 18, textAlign: "left", cursor: "pointer", transition: "all 0.2s",
                    border: "1.5px solid",
                    background: category === c.id ? `${c.color}08` : "#fff",
                    borderColor: category === c.id ? `${c.color}40` : "rgba(0,0,0,0.08)",
                    boxShadow: category === c.id ? `0 4px 20px ${c.color}18` : "0 1px 4px rgba(0,0,0,0.04)",
                  }}>
                  <span style={{ fontSize: "1.5rem", display: "block", marginBottom: 12, color: category === c.id ? c.color : "#aeaeb2" }}>{c.icon}</span>
                  <p style={{ fontFamily: F, fontSize: "0.95rem", fontWeight: 800, color: "#1c1c1e", margin: "0 0 5px" }}>{c.label}</p>
                  <p style={{ fontFamily: F, fontSize: "0.78rem", color: "#8e8e93", margin: 0, lineHeight: 1.4 }}>{c.sub}</p>
                </button>
              ))}
            </div>

            {error && <p style={{ fontFamily: F, fontSize: "0.8rem", color: "#ef4444", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 12, padding: "10px 16px" }}>{error}</p>}

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={reset} style={{ flex: 1, padding: "14px 0", background: "transparent", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 999, fontFamily: F, fontWeight: 600, fontSize: "0.9rem", color: "#6e6e73", cursor: "pointer" }}>← Буцах</button>
              <button onClick={() => category === "outfit" ? setStep("occasion") : handleStart()}
                disabled={!category}
                style={{ flex: 2, padding: "14px 0", background: category ? "#1c1c1e" : "rgba(0,0,0,0.06)", color: category ? "#fff" : "#aeaeb2", border: "none", borderRadius: 999, fontFamily: F, fontWeight: 700, fontSize: "0.9rem", cursor: category ? "pointer" : "not-allowed", boxShadow: category ? "0 4px 16px rgba(0,0,0,0.18)" : "none" }}>
                {category === "outfit" ? "Occasion сонгох →" : "Шинжлэх →"}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2b: Occasion (outfit only) ── */}
        {step === "occasion" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <p style={{ ...labelStyle }}>Ямар нөхцөлд зориулж байна вэ?</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
              {OCCASIONS.map((o) => (
                <button key={o.id} onClick={() => setOccasion(o.id)}
                  style={{
                    padding: "18px 12px", borderRadius: 16, textAlign: "center", cursor: "pointer", transition: "all 0.2s",
                    border: "1.5px solid",
                    background: occasion === o.id ? "rgba(147,51,234,0.07)" : "#fff",
                    borderColor: occasion === o.id ? "rgba(147,51,234,0.35)" : "rgba(0,0,0,0.08)",
                    boxShadow: occasion === o.id ? "0 4px 16px rgba(147,51,234,0.12)" : "0 1px 4px rgba(0,0,0,0.04)",
                  }}>
                  <p style={{ fontSize: "1.5rem", margin: "0 0 8px" }}>{o.icon}</p>
                  <p style={{ fontFamily: F, fontSize: "0.82rem", fontWeight: 700, color: "#1c1c1e", margin: "0 0 3px" }}>{o.label}</p>
                  <p style={{ fontFamily: F, fontSize: "0.7rem", color: "#8e8e93", margin: 0 }}>{o.sub}</p>
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setStep("category")} style={{ flex: 1, padding: "14px 0", background: "transparent", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 999, fontFamily: F, fontWeight: 600, fontSize: "0.9rem", color: "#6e6e73", cursor: "pointer" }}>← Буцах</button>
              <button onClick={handleStart} style={{ flex: 2, padding: "14px 0", background: "#1c1c1e", color: "#fff", border: "none", borderRadius: 999, fontFamily: F, fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", boxShadow: "0 4px 16px rgba(0,0,0,0.18)" }}>
                Шинжлэх →
              </button>
            </div>
          </div>
        )}

        {/* ── Payment ── */}
        {step === "payment" && invoice && (
          <div style={{ maxWidth: 420, margin: "0 auto" }}>
            <div style={{ ...card, padding: 32, textAlign: "center" }}>
              <p style={{ ...labelStyle, marginBottom: 10 }}>QPay төлбөр</p>
              <p style={{ fontFamily: F, fontSize: "2.2rem", fontWeight: 800, color: "#1c1c1e", marginBottom: 4, letterSpacing: "-0.02em" }}>{invoice.amount.toLocaleString()}₮</p>
              <p style={{ fontFamily: F, fontSize: "0.85rem", color: "#8e8e93", marginBottom: 24 }}>Beauty AI · AI Шинжилгээ</p>
              {invoice.qrImage && (
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
                  <div style={{ background: "#fff", padding: 14, borderRadius: 20, border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`data:image/png;base64,${invoice.qrImage}`} alt="QPay QR" width={200} height={200} style={{ borderRadius: 10, display: "block" }} />
                  </div>
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 20 }}>
                {[0,1,2].map((i) => <span key={i} className="animate-dot-blink" style={{ width: 6, height: 6, borderRadius: "50%", background: "#9333ea", display: "inline-block", animationDelay: `${i*0.2}s` }} />)}
                <span style={{ fontFamily: F, fontSize: "0.82rem", color: "#8e8e93" }}>Төлбөр хүлээж байна...</span>
              </div>
              {invoice.urls && invoice.urls.length > 0 && (
                <div>
                  <p style={{ ...labelStyle, marginBottom: 12 }}>Банкны апп-аар төлөх</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {invoice.urls.map((u: QPayUrl) => (
                      <a key={u.name} href={u.link} target="_blank" rel="noopener noreferrer"
                        style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 12, background: "#f5f5f7", border: "1px solid rgba(0,0,0,0.07)", textDecoration: "none" }}>
                        {u.logo && <img src={u.logo} alt={u.name} width={26} height={26} style={{ borderRadius: 7, objectFit: "contain", flexShrink: 0 }} />}
                        <span style={{ fontFamily: F, fontSize: "0.75rem", color: "#3a3a3c", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button onClick={reset} style={{ width: "100%", marginTop: 12, padding: "12px 0", background: "transparent", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 999, fontFamily: F, fontSize: "0.85rem", color: "#8e8e93", cursor: "pointer" }}>← Буцах</button>
          </div>
        )}

        {/* ── Analyzing ── */}
        {step === "analyzing" && (
          <div style={{ ...card, padding: 64, textAlign: "center", maxWidth: 420, margin: "0 auto" }}>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 20 }}>
              {[0,1,2].map((i) => <span key={i} className="animate-dot-blink" style={{ width: 10, height: 10, borderRadius: "50%", background: "#9333ea", display: "inline-block", animationDelay: `${i*0.18}s` }} />)}
            </div>
            <p style={{ fontFamily: F, fontSize: "1.1rem", fontWeight: 700, color: "#1c1c1e", marginBottom: 8 }}>AI шинжилж байна</p>
            <p style={{ ...labelStyle }}>
              {category === "face" && "НҮҮРНИЙ ХЭЛБЭР · АРЬСНЫ ТОН · STYLE TYPE"}
              {category === "hairstyle" && "ҮС ЗАСАЛ · НҮҮР БУДАЛТ"}
              {category === "outfit" && "ХУВЦАС ХОСЛОЛ · STYLE ЗӨВЛӨМЖ"}
              {category === "makeup" && "АРЬСНЫ ТОН · ӨНГӨНИЙ ПАЛЕТ"}
            </p>
          </div>
        )}

        {/* ── Results ── */}
        {step === "result" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }} className="anim-fade-up">

            {/* Face / Makeup result */}
            {faceResult && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                  {[
                    { label: "Нүүрний хэлбэр", value: faceResult.faceShape },
                    { label: "Арьсны тон",      value: faceResult.skinTone  },
                    { label: "Style type",       value: faceResult.styleType },
                  ].map((s) => (
                    <div key={s.label} style={{ ...card, padding: "18px 14px", textAlign: "center" }}>
                      <p style={{ ...labelStyle, marginBottom: 8 }}>{s.label}</p>
                      <p style={{ fontFamily: F, fontSize: "0.88rem", fontWeight: 700, color: "#1c1c1e", lineHeight: 1.35 }}>{s.value}</p>
                    </div>
                  ))}
                </div>
                <div style={{ ...card, padding: 22 }}>
                  <p style={{ ...labelStyle, marginBottom: 14 }}>Өнгөний палет</p>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {faceResult.colorPalette.map((c) => (
                      <div key={c} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 14, border: "1px solid rgba(0,0,0,0.08)", background: c, boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }} />
                        <span style={{ fontFamily: F, fontSize: "0.62rem", color: "#8e8e93" }}>{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ ...card, padding: 22 }}>
                  <p style={{ ...labelStyle, marginBottom: 14 }}>AI зөвлөмж</p>
                  <ul style={{ display: "flex", flexDirection: "column", gap: 12, listStyle: "none", padding: 0, margin: 0 }}>
                    {faceResult.recommendations.map((r, i) => (
                      <li key={i} style={{ display: "flex", gap: 12, fontFamily: F, fontSize: "0.88rem", color: "#3a3a3c", lineHeight: 1.65 }}>
                        <span style={{ color: "#9333ea", flexShrink: 0 }}>—</span>{r}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {/* Hairstyle result */}
            {hairResult && (
              <>
                <div style={{ ...card, display: "flex", alignItems: "center", gap: 16, padding: 18 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.15)", flexShrink: 0 }}>
                    <span style={{ color: "#a855f7" }}>◈</span>
                  </div>
                  <div>
                    <p style={labelStyle}>Нүүрний хэлбэр</p>
                    <p style={{ fontFamily: F, fontSize: "1rem", fontWeight: 700, color: "#1c1c1e", marginTop: 4 }}>{hairResult.faceShape} нүүр</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["hair","makeup"] as const).map((t) => (
                    <button key={t} onClick={() => setHairTab(t)}
                      style={{ fontFamily: F, fontSize: "0.87rem", fontWeight: 600, padding: "9px 20px", borderRadius: 999, border: "1px solid", cursor: "pointer", transition: "all 0.15s",
                        background: hairTab === t ? "#1c1c1e" : "#fff",
                        color: hairTab === t ? "#fff" : "#6e6e73",
                        borderColor: hairTab === t ? "#1c1c1e" : "rgba(0,0,0,0.1)" }}>
                      {t === "hair" ? "Үс засал" : "Нүүр будалт"}
                    </button>
                  ))}
                </div>
                {hairTab === "hair" && hairResult.hair.map((h) => (
                  <div key={h.name} style={{ ...card, padding: 18 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                      <h3 style={{ fontFamily: F, fontSize: "0.98rem", fontWeight: 700, color: "#1c1c1e", margin: 0 }}>{h.name}</h3>
                      <span style={{ fontFamily: F, fontSize: "0.68rem", fontWeight: 600, color: "#8e8e93", padding: "4px 10px", borderRadius: 999, background: "#f5f5f7", border: "1px solid rgba(0,0,0,0.06)", flexShrink: 0, marginLeft: 12 }}>{h.length}</span>
                    </div>
                    <p style={{ fontFamily: F, fontSize: "0.87rem", color: "#6e6e73", lineHeight: 1.65, margin: 0 }}>{h.desc}</p>
                  </div>
                ))}
                {hairTab === "makeup" && hairResult.makeup.map((m) => (
                  <div key={m.name} style={{ ...card, padding: 18 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <h3 style={{ fontFamily: F, fontSize: "0.98rem", fontWeight: 700, color: "#1c1c1e", margin: 0 }}>{m.name}</h3>
                      <div style={{ display: "flex", gap: 6 }}>
                        {m.colors.map((c) => <div key={c} style={{ width: 22, height: 22, borderRadius: "50%", border: "1px solid rgba(0,0,0,0.1)", background: c }} />)}
                      </div>
                    </div>
                    <p style={{ fontFamily: F, fontSize: "0.87rem", color: "#6e6e73", lineHeight: 1.65, margin: 0 }}>{m.desc}</p>
                  </div>
                ))}
              </>
            )}

            {/* Outfit result */}
            {outfitResult && outfitResult.map((outfit, i) => (
              <div key={i} style={{ ...card, padding: 22 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                  <div>
                    <p style={{ ...labelStyle, marginBottom: 6 }}>Хослол {i + 1}</p>
                    <h3 style={{ fontFamily: F, fontSize: "1.05rem", fontWeight: 800, color: "#1c1c1e", letterSpacing: "-0.01em", margin: 0 }}>{outfit.name}</h3>
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                    {outfit.colors.map((c) => <div key={c} style={{ width: 22, height: 22, borderRadius: "50%", border: "1px solid rgba(0,0,0,0.1)", background: c }} />)}
                  </div>
                </div>
                <ul style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14, listStyle: "none", padding: 0, margin: "0 0 14px" }}>
                  {outfit.items.map((item) => (
                    <li key={item} style={{ display: "flex", gap: 12, fontFamily: F, fontSize: "0.87rem", color: "#3a3a3c", lineHeight: 1.55 }}>
                      <span style={{ color: "#9333ea", flexShrink: 0 }}>—</span>{item}
                    </li>
                  ))}
                </ul>
                <div style={{ borderRadius: 12, padding: 14, background: "#f5f5f7", border: "1px solid rgba(0,0,0,0.05)" }}>
                  <p style={{ fontFamily: F, fontSize: "0.82rem", color: "#6e6e73", lineHeight: 1.7, margin: 0 }}>
                    <span style={{ color: "#8e8e93" }}>Зөвлөмж — </span>{outfit.tip}
                  </p>
                </div>
              </div>
            ))}

            <div style={{ display: "flex", gap: 12, marginTop: 4, flexWrap: "wrap" }}>
              <button onClick={() => { setStep("category"); setFaceResult(null); setHairResult(null); setOutfitResult(null); }}
                style={{ flex: 1, minWidth: 140, padding: "13px 0", background: "rgba(147,51,234,0.08)", border: "1px solid rgba(147,51,234,0.2)", borderRadius: 999, fontFamily: F, fontWeight: 700, fontSize: "0.87rem", color: "#9333ea", cursor: "pointer" }}>
                Өөр шинжилгээ
              </button>
              <button onClick={reset}
                style={{ flex: 1, minWidth: 140, padding: "13px 0", background: "transparent", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 999, fontFamily: F, fontWeight: 600, fontSize: "0.87rem", color: "#6e6e73", cursor: "pointer" }}>
                Дахин эхлэх
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
