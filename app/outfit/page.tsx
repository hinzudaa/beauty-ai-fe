"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { generateOutfit, OutfitItem } from "@/apis/outfit";
import { fileToDataUrl } from "@/apis/analyze";
import { createInvoice, checkPayment, InvoiceResponse, QPayUrl } from "@/apis/payment";
import { tokenStore } from "@/utils/request";
import { photoStore } from "@/utils/photoStore";

const F = "var(--font-montserrat), 'Helvetica Neue', Arial, sans-serif";
const card: React.CSSProperties = { background: "#fff", border: "1px solid rgba(0,0,0,0.07)", borderRadius: 18, boxShadow: "0 2px 14px rgba(0,0,0,0.05)" };
const labelStyle: React.CSSProperties = { fontFamily: F, fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#8e8e93" };

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
    <button onClick={onClick} style={{
      fontFamily: F, fontSize: "0.84rem", fontWeight: active ? 700 : 500,
      padding: "8px 18px", borderRadius: 999, border: "1px solid",
      background: active ? "#1c1c1e" : "#fff",
      color: active ? "#fff" : "#6e6e73",
      borderColor: active ? "#1c1c1e" : "rgba(0,0,0,0.1)",
      cursor: "pointer", transition: "all 0.15s",
    }}>
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

  // auto-load from homepage upload
  useEffect(() => {
    const stored = photoStore.get();
    if (stored && !preview) {
      setPreview(stored.preview);
      setDataUrl(stored.dataUrl);
    }
  }, []);

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
    <div style={{ minHeight: "100vh", padding: "64px 24px 96px", fontFamily: F }} className="md:px-12 lg:px-20">

      {/* Hero */}
      <section style={{ marginBottom: 56 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }} className="md:flex-row md:items-end md:justify-between">
          <div style={{ maxWidth: 560 }}>
            <span style={{ ...labelStyle, display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 13px", borderRadius: 999, background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", color: "#7c3aed" }}>
              ✦ &nbsp;02 · MVP гол
            </span>
            <h1 style={{ fontFamily: F, fontSize: "clamp(2.6rem,6vw,4.5rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.06, color: "#1c1c1e", marginTop: 20 }}>
              Хувцас<br /><span style={{ color: "#6e6e73", fontWeight: 700 }}>Генератор</span>
            </h1>
            <p style={{ marginTop: 16, fontSize: "1rem", fontWeight: 500, color: "#6e6e73", lineHeight: 1.75, maxWidth: 360 }}>
              Event сонгоод улирал, style-аа тохируулж AI-аар хувцас хослол авах.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
            <p style={{ fontFamily: F, fontSize: "2.5rem", fontWeight: 800, color: "#1c1c1e", lineHeight: 1 }}>06</p>
            <p style={labelStyle}>Event сонголт</p>
          </div>
        </div>
        <div style={{ marginTop: 36, height: 1, background: "rgba(0,0,0,0.07)" }} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 items-start">
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Selfie upload */}
          <div>
            <p style={{ ...labelStyle, marginBottom: 10 }}>Selfie upload (заавал биш — нэмэлт хувийн зөвлөмж авах)</p>
            <div
              style={{
                borderRadius: 16, minHeight: "9rem", cursor: "pointer", overflow: "hidden",
                ...(preview
                  ? { border: "1px solid rgba(147,51,234,0.2)", background: "rgba(147,51,234,0.03)" }
                  : { border: "2px dashed rgba(0,0,0,0.1)", background: "rgba(0,0,0,0.01)" }),
              }}
              onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith("image/")) handleFile(f); }}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => inputRef.current?.click()}
            >
              <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              {preview ? (
                <div style={{ display: "flex", alignItems: "center", gap: 16, padding: 16 }}>
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <Image src={preview} alt="preview" width={80} height={80} style={{ objectFit: "cover", borderRadius: 12, border: "1px solid rgba(0,0,0,0.08)" }} />
                    <div style={{ position: "absolute", bottom: -6, right: -6, width: 24, height: 24, borderRadius: "50%", background: "#9333ea", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: "#fff", fontSize: "0.6rem" }}>✦</span>
                    </div>
                  </div>
                  <div>
                    <p style={{ fontFamily: F, fontSize: "0.9rem", fontWeight: 600, color: "#1c1c1e" }}>Selfie бэлэн</p>
                    <p style={{ fontFamily: F, fontSize: "0.8rem", color: "#8e8e93", marginTop: 4 }}>AI таны биеийн онцлогт тохируулан зөвлөмж гаргана</p>
                    <button onClick={(e) => { e.stopPropagation(); setPreview(null); setDataUrl(null); }}
                      style={{ marginTop: 8, fontFamily: F, fontSize: "0.78rem", color: "#ef4444", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Устгах ×</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: 24, textAlign: "center" }}>
                  <span style={{ color: "#c7c7cc", fontSize: "1.5rem" }}>✦</span>
                  <div>
                    <p style={{ fontFamily: F, fontSize: "0.9rem", fontWeight: 600, color: "#8e8e93" }}>Selfie нэмэх (заавал биш)</p>
                    <p style={{ fontFamily: F, fontSize: "0.8rem", color: "#aeaeb2", marginTop: 2 }}>Нэмснээр илүү хувийн зөвлөмж авна</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Event select */}
          <div>
            <p style={{ ...labelStyle, marginBottom: 12 }}>Event сонгох</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }} className="sm:grid-cols-3">
              {events.map((e) => (
                <button key={e.id}
                  disabled={step === "payment" || step === "generating"}
                  onClick={() => { setSelectedEvent(e.id); setResult(null); }}
                  style={{
                    padding: "18px 16px", borderRadius: 16, textAlign: "left", cursor: "pointer", transition: "all 0.15s",
                    border: "1px solid",
                    background: selectedEvent === e.id ? "rgba(147,51,234,0.06)" : "#fff",
                    borderColor: selectedEvent === e.id ? "rgba(147,51,234,0.3)" : "rgba(0,0,0,0.08)",
                    boxShadow: selectedEvent === e.id ? "0 2px 12px rgba(147,51,234,0.1)" : "0 1px 4px rgba(0,0,0,0.04)",
                    opacity: (step === "payment" || step === "generating") ? 0.5 : 1,
                  }}>
                  <span style={{ fontSize: "1.1rem", marginBottom: 8, display: "block", color: selectedEvent === e.id ? "#9333ea" : "#aeaeb2" }}>{e.icon}</span>
                  <p style={{ fontFamily: F, fontSize: "0.87rem", fontWeight: 700, color: "#1c1c1e", marginBottom: 2 }}>{e.label}</p>
                  <p style={{ fontFamily: F, fontSize: "0.75rem", color: selectedEvent === e.id ? "#7c3aed" : "#8e8e93" }}>{e.sub}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Season + Style */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div>
              <p style={{ ...labelStyle, marginBottom: 10 }}>Улирал</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {seasons.map((s) => <Chip key={s} label={s} active={selectedSeason === s} onClick={() => setSelectedSeason(s)} />)}
              </div>
            </div>
            <div>
              <p style={{ ...labelStyle, marginBottom: 10 }}>Style</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {styles.map((s) => <Chip key={s} label={s} active={selectedStyle === s} onClick={() => setSelectedStyle(s)} />)}
              </div>
            </div>
          </div>

          {error && <p style={{ fontFamily: F, fontSize: "0.8rem", color: "#ef4444", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 12, padding: "10px 16px" }}>{error}</p>}

          {step === "select" && (
            <button onClick={handleStart} disabled={!selectedEvent}
              style={{
                width: "100%", borderRadius: 999, fontFamily: F, fontWeight: 700, fontSize: "0.9rem", padding: "14px 0", border: "none", cursor: selectedEvent ? "pointer" : "not-allowed", letterSpacing: "0.06em",
                background: selectedEvent ? "#1c1c1e" : "rgba(0,0,0,0.06)",
                color: selectedEvent ? "#fff" : "#aeaeb2",
                boxShadow: selectedEvent ? "0 4px 16px rgba(0,0,0,0.18)" : "none",
              }}>
              Эхлэх →
            </button>
          )}
        </div>

        {/* Right col */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {step === "select" && !result && (
            <>
              <p style={{ ...labelStyle, marginBottom: 12 }}>Хэрхэн ажилдаг вэ</p>
              {["Event-ээ сонго", "Улирал ба style тохируул", "QPay-ээр төлбөр хийнэ", "AI хослол гаргана"].map((t, i) => (
                <div key={i} style={{ ...card, padding: 18, display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <span style={{ fontFamily: F, fontSize: "1.4rem", fontWeight: 800, color: "#e5e5ea", lineHeight: 1, flexShrink: 0 }}>{String(i + 1).padStart(2, "0")}</span>
                  <p style={{ fontFamily: F, fontSize: "0.87rem", color: "#3a3a3c", paddingTop: 4, lineHeight: 1.55 }}>{t}</p>
                </div>
              ))}
            </>
          )}

          {step === "payment" && invoice && (
            <div style={{ ...card, padding: 24, textAlign: "center" }}>
              <p style={{ ...labelStyle, marginBottom: 8 }}>QPay төлбөр</p>
              <p style={{ fontFamily: F, fontSize: "1.8rem", fontWeight: 800, color: "#1c1c1e", marginBottom: 4 }}>{invoice.amount.toLocaleString()}₮</p>
              <p style={{ fontFamily: F, fontSize: "0.8rem", color: "#8e8e93", marginBottom: 20 }}>Хувцасны зөвлөмж</p>
              {invoice.qrImage && (
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                  <div style={{ background: "#fff", padding: 12, borderRadius: 16, border: "1px solid rgba(0,0,0,0.07)" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`data:image/png;base64,${invoice.qrImage}`} alt="QPay QR" width={180} height={180} style={{ borderRadius: 8, display: "block" }} />
                  </div>
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 16 }}>
                {[0,1,2].map((i) => <span key={i} className="animate-dot-blink" style={{ width: 6, height: 6, borderRadius: "50%", background: "#9333ea", display: "inline-block", animationDelay: `${i*0.2}s` }} />)}
                <span style={{ fontFamily: F, fontSize: "0.8rem", color: "#8e8e93" }}>Хүлээж байна...</span>
              </div>
              {invoice.urls?.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {invoice.urls.slice(0, 6).map((u: QPayUrl) => (
                    <a key={u.name} href={u.link} target="_blank" rel="noopener noreferrer"
                      style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 12, background: "#f5f5f7", border: "1px solid rgba(0,0,0,0.07)", textDecoration: "none" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {u.logo && <img src={u.logo} alt={u.name} width={22} height={22} style={{ borderRadius: 6, flexShrink: 0 }} />}
                      <span style={{ fontFamily: F, fontSize: "0.75rem", color: "#3a3a3c", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name}</span>
                    </a>
                  ))}
                </div>
              )}
              <button onClick={reset} style={{ marginTop: 16, width: "100%", padding: "11px 0", background: "transparent", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 999, fontFamily: F, fontSize: "0.84rem", color: "#8e8e93", cursor: "pointer" }}>← Буцах</button>
            </div>
          )}

          {step === "generating" && (
            <div style={{ ...card, padding: 48, textAlign: "center" }}>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 16 }}>
                {[0,1,2].map((i) => <span key={i} className="animate-dot-blink" style={{ width: 8, height: 8, borderRadius: "50%", background: "#9333ea", display: "inline-block", animationDelay: `${i*0.18}s` }} />)}
              </div>
              <p style={{ fontFamily: F, fontSize: "1rem", fontWeight: 600, color: "#1c1c1e", marginBottom: 6 }}>Хослол үүсгэж байна</p>
              <p style={{ ...labelStyle }}>{selectedSeason} · {selectedStyle}</p>
            </div>
          )}

          {step === "result" && result && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }} className="anim-fade-up">
              {result.map((outfit, i) => (
                <div key={i} style={{ ...card, padding: 22 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                    <div>
                      <p style={{ ...labelStyle, marginBottom: 6 }}>Хослол {i + 1}</p>
                      <h3 style={{ fontFamily: F, fontSize: "1.05rem", fontWeight: 800, color: "#1c1c1e", letterSpacing: "-0.01em" }}>{outfit.name}</h3>
                    </div>
                    <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                      {outfit.colors.map((c) => <div key={c} style={{ width: 20, height: 20, borderRadius: "50%", border: "1px solid rgba(0,0,0,0.1)", background: c }} />)}
                    </div>
                  </div>
                  <ul style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                    {outfit.items.map((item) => (
                      <li key={item} style={{ display: "flex", gap: 12, fontFamily: F, fontSize: "0.87rem", color: "#3a3a3c", lineHeight: 1.55 }}>
                        <span style={{ color: "#9333ea", flexShrink: 0 }}>—</span>{item}
                      </li>
                    ))}
                  </ul>
                  <div style={{ borderRadius: 12, padding: 14, background: "#f5f5f7", border: "1px solid rgba(0,0,0,0.05)" }}>
                    <p style={{ fontFamily: F, fontSize: "0.82rem", color: "#6e6e73", lineHeight: 1.7 }}>
                      <span style={{ color: "#8e8e93" }}>Стилистийн зөвлөмж — </span>{outfit.tip}
                    </p>
                  </div>
                </div>
              ))}
              <button onClick={reset} style={{ width: "100%", padding: "13px 0", background: "transparent", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 999, fontFamily: F, fontSize: "0.87rem", fontWeight: 600, color: "#6e6e73", cursor: "pointer" }}>Дахин үүсгэх</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
