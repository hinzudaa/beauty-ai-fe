"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { analyzeHairstyle, HairstyleResult } from "@/apis/hairstyle";
import { fileToDataUrl } from "@/apis/analyze";
import { createInvoice, checkPayment, InvoiceResponse, QPayUrl } from "@/apis/payment";
import { tokenStore } from "@/utils/request";
import { photoStore } from "@/utils/photoStore";

const F = "var(--font-montserrat), 'Helvetica Neue', Arial, sans-serif";
const card: React.CSSProperties = { background: "#fff", border: "1px solid rgba(0,0,0,0.07)", borderRadius: 18, boxShadow: "0 2px 14px rgba(0,0,0,0.05)" };
const labelStyle: React.CSSProperties = { fontFamily: F, fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#8e8e93" };

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

  // auto-load from homepage upload
  useEffect(() => {
    const stored = photoStore.get();
    if (stored && !preview) {
      setPreview(stored.preview);
      setDataUrl(stored.dataUrl);
    }
  }, []);

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
    <div style={{ minHeight: "100vh", padding: "64px 24px 96px", fontFamily: F }} className="md:px-12 lg:px-20">

      {/* Hero */}
      <section style={{ marginBottom: 56 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }} className="md:flex-row md:items-end md:justify-between">
          <div style={{ maxWidth: 560 }}>
            <span style={{ ...labelStyle, display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 13px", borderRadius: 999, background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)", color: "#a855f7" }}>
              ✦ &nbsp;03 · Үс · Грим
            </span>
            <h1 style={{ fontFamily: F, fontSize: "clamp(2.6rem,6vw,4.5rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.06, color: "#1c1c1e", marginTop: 20 }}>
              Үс засал &<br /><span style={{ color: "#6e6e73", fontWeight: 700 }}>Грим</span>
            </h1>
            <p style={{ marginTop: 16, fontSize: "1rem", fontWeight: 500, color: "#6e6e73", lineHeight: 1.75, maxWidth: 360 }}>
              Зургаа upload хийж нүүрний хэлбэрт тохирсон үс засал, грим зөвлөмж авах.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
            <p style={{ fontFamily: F, fontSize: "2.5rem", fontWeight: 800, color: "#1c1c1e", lineHeight: 1 }}>07</p>
            <p style={labelStyle}>Зөвлөмжийн тоо</p>
          </div>
        </div>
        <div style={{ marginTop: 36, height: 1, background: "rgba(0,0,0,0.07)" }} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

        {/* LEFT — upload */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            style={{
              borderRadius: 20, minHeight: "22rem", cursor: "pointer", overflow: "hidden",
              ...(preview
                ? { border: "1px solid rgba(168,85,247,0.2)", background: "rgba(168,85,247,0.03)" }
                : { border: "2px dashed rgba(0,0,0,0.1)", background: "rgba(0,0,0,0.01)" }),
            }}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith("image/")) handleFile(f); }}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
          >
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            {preview ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: 40, minHeight: "22rem" }}>
                <div style={{ position: "relative" }}>
                  <Image src={preview} alt="preview" width={220} height={220} style={{ objectFit: "cover", borderRadius: 16, border: "1px solid rgba(0,0,0,0.08)" }} />
                  <div style={{ position: "absolute", bottom: -8, right: -8, width: 32, height: 32, borderRadius: "50%", background: "#a855f7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ color: "#fff", fontSize: "0.7rem" }}>✦</span>
                  </div>
                </div>
                <p style={{ ...labelStyle, color: "#aeaeb2" }}>Дахин дарж солих</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: 56, minHeight: "22rem" }}>
                <div style={{ position: "relative" }}>
                  <div style={{ width: 72, height: 72, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.15)" }}>
                    <span style={{ color: "#a855f7", fontSize: "1.8rem" }}>✦</span>
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontFamily: F, fontSize: "1rem", fontWeight: 600, color: "#3a3a3c", marginBottom: 6 }}>Зураг чирж тавих эсвэл дарах</p>
                  <p style={{ fontFamily: F, fontSize: "0.84rem", color: "#aeaeb2" }}>Урд тал харсан, тодорхой зураг хамгийн сайн</p>
                </div>
              </div>
            )}
          </div>

          {preview && step === "upload" && (
            <button onClick={handleStart} style={{ width: "100%", background: "#1c1c1e", color: "#fff", borderRadius: 999, fontFamily: F, fontWeight: 700, fontSize: "0.9rem", padding: "14px 0", border: "none", cursor: "pointer", letterSpacing: "0.06em", boxShadow: "0 4px 16px rgba(0,0,0,0.18)" }}>
              Шинжлэх →
            </button>
          )}

          {step === "payment" && invoice && (
            <div style={{ ...card, padding: 24, textAlign: "center" }}>
              <p style={{ ...labelStyle, marginBottom: 8 }}>QPay төлбөр</p>
              <p style={{ fontFamily: F, fontSize: "1.8rem", fontWeight: 800, color: "#1c1c1e", marginBottom: 4 }}>{invoice.amount.toLocaleString()}₮</p>
              <p style={{ fontFamily: F, fontSize: "0.8rem", color: "#8e8e93", marginBottom: 20 }}>Үс засал & Грим шинжилгээ</p>
              {invoice.qrImage && (
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                  <div style={{ background: "#fff", padding: 12, borderRadius: 16, border: "1px solid rgba(0,0,0,0.07)" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`data:image/png;base64,${invoice.qrImage}`} alt="QPay QR" width={180} height={180} style={{ borderRadius: 8, display: "block" }} />
                  </div>
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 16 }}>
                {[0,1,2].map((i) => <span key={i} className="animate-dot-blink" style={{ width: 6, height: 6, borderRadius: "50%", background: "#a855f7", display: "inline-block", animationDelay: `${i*0.2}s` }} />)}
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
              <button onClick={() => { setStep("upload"); setInvoice(null); }} style={{ marginTop: 16, width: "100%", padding: "11px 0", background: "transparent", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 999, fontFamily: F, fontSize: "0.84rem", color: "#8e8e93", cursor: "pointer" }}>← Буцах</button>
            </div>
          )}

          {step === "analyzing" && (
            <div style={{ ...card, padding: 40, textAlign: "center" }}>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 16 }}>
                {[0,1,2].map((i) => <span key={i} className="animate-dot-blink" style={{ width: 8, height: 8, borderRadius: "50%", background: "#a855f7", display: "inline-block", animationDelay: `${i*0.18}s` }} />)}
              </div>
              <p style={{ fontFamily: F, fontSize: "1rem", fontWeight: 600, color: "#1c1c1e" }}>Шинжилж байна...</p>
            </div>
          )}

          {error && <p style={{ fontFamily: F, fontSize: "0.8rem", color: "#ef4444", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 12, padding: "10px 16px" }}>{error}</p>}

          {step === "result" && result && (
            <button onClick={() => { setPreview(null); setDataUrl(null); setResult(null); setStep("upload"); }}
              style={{ width: "100%", padding: "13px 0", background: "transparent", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 999, fontFamily: F, fontSize: "0.87rem", fontWeight: 600, color: "#6e6e73", cursor: "pointer" }}>
              Дахин шинжлэх
            </button>
          )}
        </div>

        {/* RIGHT */}
        {step === "upload" && !result && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <p style={{ ...labelStyle, marginBottom: 12 }}>Юу авах вэ</p>
            {[
              { icon: "◈", label: "Үс засал",  desc: "Нүүрний хэлбэрт тохирсон 4 үс заслын зөвлөмж" },
              { icon: "◉", label: "Грим look",  desc: "Арьсны тонд нийцсэн 3 грим стиль + өнгөний палет" },
              { icon: "✦", label: "Хувийн гид", desc: "Таны нүүрний онцлогт тулгуурласан зөвлөмж" },
            ].map((f) => (
              <div key={f.label} style={{ ...card, display: "flex", gap: 16, padding: 18 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(168,85,247,0.07)", border: "1px solid rgba(168,85,247,0.12)", flexShrink: 0 }}>
                  <span style={{ color: "#a855f7", fontSize: "1rem" }}>{f.icon}</span>
                </div>
                <div>
                  <p style={{ fontFamily: F, fontSize: "0.9rem", fontWeight: 700, color: "#1c1c1e", marginBottom: 4 }}>{f.label}</p>
                  <p style={{ fontFamily: F, fontSize: "0.84rem", color: "#6e6e73", lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {step === "result" && result && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }} className="anim-fade-up">
            <div style={{ ...card, display: "flex", alignItems: "center", gap: 16, padding: 18 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(168,85,247,0.07)", border: "1px solid rgba(168,85,247,0.12)", flexShrink: 0 }}>
                <span style={{ color: "#a855f7" }}>◈</span>
              </div>
              <div>
                <p style={labelStyle}>Нүүрний хэлбэр</p>
                <p style={{ fontFamily: F, fontSize: "1rem", fontWeight: 700, color: "#1c1c1e", marginTop: 4 }}>{result.faceShape} нүүр</p>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              {(["hair", "makeup"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  style={{ fontFamily: F, fontSize: "0.87rem", fontWeight: 600, padding: "9px 20px", borderRadius: 999, border: "1px solid", cursor: "pointer", transition: "all 0.15s",
                    background: tab === t ? "#1c1c1e" : "#fff",
                    color: tab === t ? "#fff" : "#6e6e73",
                    borderColor: tab === t ? "#1c1c1e" : "rgba(0,0,0,0.1)" }}>
                  {t === "hair" ? "Үс засал" : "Грим"}
                </button>
              ))}
            </div>

            {tab === "hair" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {result.hair.map((h) => (
                  <div key={h.name} style={{ ...card, padding: 18 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                      <h3 style={{ fontFamily: F, fontSize: "0.95rem", fontWeight: 700, color: "#1c1c1e" }}>{h.name}</h3>
                      <span style={{ fontFamily: F, fontSize: "0.68rem", fontWeight: 600, color: "#8e8e93", padding: "4px 10px", borderRadius: 999, background: "#f5f5f7", border: "1px solid rgba(0,0,0,0.06)", flexShrink: 0, marginLeft: 12 }}>{h.length}</span>
                    </div>
                    <p style={{ fontFamily: F, fontSize: "0.87rem", color: "#6e6e73", lineHeight: 1.65 }}>{h.desc}</p>
                  </div>
                ))}
              </div>
            )}

            {tab === "makeup" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {result.makeup.map((m) => (
                  <div key={m.name} style={{ ...card, padding: 18 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <h3 style={{ fontFamily: F, fontSize: "0.95rem", fontWeight: 700, color: "#1c1c1e" }}>{m.name}</h3>
                      <div style={{ display: "flex", gap: 6 }}>
                        {m.colors.map((c) => <div key={c} style={{ width: 20, height: 20, borderRadius: "50%", border: "1px solid rgba(0,0,0,0.1)", background: c }} />)}
                      </div>
                    </div>
                    <p style={{ fontFamily: F, fontSize: "0.87rem", color: "#6e6e73", lineHeight: 1.65 }}>{m.desc}</p>
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
