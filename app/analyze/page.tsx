"use client";

import Image from "next/image";
import { useState, useRef, useEffect, useCallback } from "react";
import { runFullAnalysis, fileToDataUrl, FullAnalysisResult } from "@/apis/analyze";
import { createSubscriptionInvoice, checkPayment, InvoiceResponse, QPayUrl } from "@/apis/payment";
import { getProfile, ProfileData } from "@/apis/profile";
import { getPrices } from "@/apis/prices";
import { tokenStore } from "@/utils/request";
import { photoStore } from "@/utils/photoStore";

/**
 * Step order:
 *   checking → (no sub) subscribe → payment → upload → occasion → analyzing → result
 *   checking → (has sub)                       upload → occasion → analyzing → result
 */
type Step      = "checking" | "subscribe" | "payment" | "upload" | "occasion" | "analyzing" | "result";
type ResultTab = "face" | "hair" | "outfit";

const OCCASIONS = [
  { id: "interview", label: "Ажлын ярилцлага", icon: "💼", sub: "Professional" },
  { id: "date",      label: "Date night",       icon: "🌙", sub: "Evening"      },
  { id: "casual",    label: "Өдөр тутам",       icon: "☀️", sub: "Casual"       },
  { id: "party",     label: "Party",            icon: "🎉", sub: "Night out"    },
  { id: "wedding",   label: "Хурим / Ёслол",   icon: "💒", sub: "Formal"       },
  { id: "study",     label: "Сурлага",          icon: "🎓", sub: "School"       },
];

const PLAN_META = [
  {
    id:       "basic" as const,
    name:     "Basic",
    limit:    20,
    features: [
      "Сард 20 шинжилгээ",
      "Нүүр · Үс & Грим · Хувцас — нэг дор",
      "Бүрэн AI дүн шинжилгээ",
      "Өнгөний палет & зөвлөмж",
      "Хувцас хослол санал болгох",
    ],
    color: "#3b82f6",
  },
  {
    id:        "pro" as const,
    name:      "Pro",
    limit:     40,
    features:  [
      "Сард 40 шинжилгээ",
      "AI Personal Stylist Chat",
      "Бүх Basic боломжууд",
      "Хамгийн өндөр нарийвчлал",
    ],
    color:     "#9333ea",
    highlight: true,
  },
];

export default function AnalyzePage() {
  const [step, setStep]               = useState<Step>("checking");
  const [preview, setPreview]         = useState<string | null>(() => photoStore.get()?.preview ?? null);
  const [dataUrl, setDataUrl]         = useState<string | null>(() => photoStore.get()?.dataUrl ?? null);
  const [occasion, setOccasion]       = useState("interview");
  const [selectedPlan, setSelectedPlan] = useState<"basic" | "pro" | null>(null);
  const [invoice, setInvoice]         = useState<InvoiceResponse | null>(null);
  const [error, setError]             = useState<string | null>(null);
  const [profile, setProfile]         = useState<ProfileData | null>(null);
  const [result, setResult]           = useState<FullAnalysisResult | null>(null);
  const [activeTab, setActiveTab]     = useState<ResultTab>("face");
  const [hairTab, setHairTab]         = useState<"hair" | "makeup">("hair");
  const [prices, setPrices]           = useState({ basic: 19999, pro: 29999 });
  const [notLoggedIn, setNotLoggedIn] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ── On mount: check auth → subscription → route to correct first step ── */
  useEffect(() => {
    // Read ?plan= param from URL (from home page pricing CTA)
    const planParam = new URLSearchParams(window.location.search).get("plan");
    if (planParam === "basic" || planParam === "pro") setSelectedPlan(planParam);

    if (!tokenStore.get()) {
      setNotLoggedIn(true);
      setStep("subscribe");   // show plan cards even without auth; lock payment
      return;
    }

    getProfile()
      .then((p) => {
        setProfile(p);
        if (p.subscription?.status === "active") {
          // Already subscribed → skip to upload
          setStep(preview ? "occasion" : "upload");
        } else {
          setStep("subscribe");
        }
      })
      .catch(() => setStep("subscribe"));

    // Fetch live prices
    getPrices()
      .then((p) => setPrices({ basic: p.basicPrice, pro: p.proPrice }))
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── File upload ── */
  async function handleFile(file: File) {
    const obj = URL.createObjectURL(file);
    const du  = await fileToDataUrl(file);
    setPreview(obj); setDataUrl(du);
    setError(null); setResult(null);
    setStep("occasion");
  }

  /* ── Subscribe → QPay ── */
  async function handleSubscribe() {
    if (!selectedPlan) return;
    if (!tokenStore.get()) {
      // Not logged in → redirect to login, come back here with plan pre-selected
      window.location.href = `/login?next=${encodeURIComponent(window.location.pathname + window.location.search || `?plan=${selectedPlan}`)}`;
      return;
    }
    setError(null);
    try {
      const inv = await createSubscriptionInvoice(selectedPlan);
      setInvoice(inv);
      setStep("payment");
      pollPayment(inv.invoiceId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа");
    }
  }

  /* ── Poll QPay until paid → go to upload ── */
  function pollPayment(invoiceId: string) {
    let cancelled = false;
    const timer = setInterval(async () => {
      if (cancelled) return;
      try {
        const s = await checkPayment(invoiceId);
        if (s.paid) {
          clearInterval(timer);
          if (!cancelled) setStep("upload");   // always go to upload after subscribing
        }
      } catch { /* keep polling */ }
    }, 3000);
    setTimeout(() => { cancelled = true; clearInterval(timer); }, 10 * 60 * 1000);
  }

  /* ── Run AI analysis ── */
  const runAll = useCallback(async () => {
    if (!dataUrl) return;
    setStep("analyzing"); setError(null);
    try {
      const r = await runFullAnalysis(dataUrl, occasion);
      setResult(r); setActiveTab("face"); setStep("result");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Алдаа гарлаа";
      if (msg === "needsSubscription") { setStep("subscribe"); }
      else { setError(msg); setStep("occasion"); }
    }
  }, [dataUrl, occasion]);

  function resetToUpload() {
    setPreview(null); setDataUrl(null); setResult(null); setError(null);
    setStep("upload");
  }

  /* ─────────────────── UI ─────────────────── */

  return (
    <div className="min-h-screen">
      <div className="max-w-[860px] mx-auto px-5 md:px-8 pt-12 pb-24">

        {/* Header */}
        <div className="mb-10">
          <span className="label-style inline-flex items-center gap-[6px] px-[13px] py-[5px] rounded-full bg-[rgba(147,51,234,0.08)] border border-[rgba(147,51,234,0.2)] text-[#9333ea] mb-5 block w-fit">
            ✦ &nbsp;AI Шинжилгээ · Нүүр · Үс & Грим · Хувцас
          </span>
          <h1 className="text-[clamp(1.8rem,4vw,2.6rem)] tracking-[-0.03em] leading-[1.1]">
            {step === "checking"  && "Уншиж байна..."}
            {step === "subscribe" && "Захиалга сонгох"}
            {step === "payment"   && "QPay төлбөр"}
            {step === "upload"    && "Selfie оруулна уу"}
            {step === "occasion"  && "Нөхцөл сонгох"}
            {step === "analyzing" && "Шинжилж байна..."}
            {step === "result"    && "Таны бүрэн дүн"}
          </h1>
          {step === "subscribe" && (
            <p className="text-[0.9rem] text-[#6e6e73] mt-2">
              Сард 1 сарын захиалга авч, шинжилгээ хийлгэнэ үү
            </p>
          )}
        </div>

        {/* ── CHECKING ── */}
        {step === "checking" && (
          <div className="flex justify-center gap-3 py-20">
            {[0,1,2].map((i) => (
              <span key={i} className="animate-dot-blink w-3 h-3 rounded-full bg-[#9333ea] inline-block" style={{ animationDelay: `${i*0.2}s` }} />
            ))}
          </div>
        )}

        {/* ── SUBSCRIBE — plan selection ── */}
        {step === "subscribe" && (
          <div className="flex flex-col gap-5">

            {/* Subscription info banner */}
            <div className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <p className="text-[0.95rem] font-bold text-[#1c1c1e] mb-1">Сарын захиалга</p>
                <p className="text-[0.85rem] text-[#6e6e73] leading-[1.6]">
                  1 сарын захиалга аваад тухайн сарын хязгаартай шинжилгээгээ хийлгэнэ.
                  Шинжилгээ бүр нүүр · үс & грим · хувцас гурвыг нэгэн зэрэг хамарна.
                </p>
              </div>
              {profile?.subscription && (
                <div className="shrink-0 text-right">
                  <p className="text-[0.72rem] font-bold text-[#9333ea] uppercase tracking-[0.06em]">{profile.subscription.plan.toUpperCase()} захиалга</p>
                  <p className="text-[0.82rem] text-[#6e6e73] mt-0.5">{profile.subscription.monthlyUsage}/{profile.subscription.usageLimit} ашигласан</p>
                </div>
              )}
            </div>

            {/* Plan cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PLAN_META.map((plan) => (
                <button key={plan.id} onClick={() => setSelectedPlan(plan.id)}
                  className="p-6 rounded-[22px] text-left transition-all relative overflow-hidden cursor-pointer"
                  style={{
                    background:  selectedPlan === plan.id ? (plan.highlight ? "#1c1c1e" : `${plan.color}08`) : "#fff",
                    border:      `2px solid ${selectedPlan === plan.id ? plan.color : "rgba(0,0,0,0.08)"}`,
                    boxShadow:   selectedPlan === plan.id ? `0 8px 32px ${plan.color}25` : "0 2px 12px rgba(0,0,0,0.05)",
                  }}>
                  {plan.highlight && (
                    <div className="absolute top-0 left-0 right-0 h-[3px]"
                      style={{ background: "linear-gradient(90deg,#9333ea,#c084fc,#7c3aed)" }} />
                  )}

                  <div className="flex justify-between items-start mb-4">
                    <p className="text-[0.72rem] font-bold tracking-[0.08em] uppercase"
                      style={{ color: plan.highlight && selectedPlan === plan.id ? "rgba(255,255,255,0.45)" : "#8e8e93" }}>
                      {plan.name}
                    </p>
                    {plan.highlight && (
                      <span className="text-[0.6rem] font-bold text-[#c084fc] bg-[rgba(192,132,252,0.15)] border border-[rgba(192,132,252,0.3)] rounded-full px-2 py-0.5">
                        Алдартай
                      </span>
                    )}
                  </div>

                  <p className="text-[2rem] font-extrabold leading-none mb-1"
                    style={{ color: plan.highlight && selectedPlan === plan.id ? "#fff" : "#1c1c1e" }}>
                    ₮{(plan.id === "basic" ? prices.basic : prices.pro).toLocaleString()}
                  </p>
                  <p className="text-[0.78rem] mb-4"
                    style={{ color: plan.highlight && selectedPlan === plan.id ? "rgba(255,255,255,0.4)" : "#8e8e93" }}>
                    / сар · {plan.limit} шинжилгээ
                  </p>

                  <ul className="space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex gap-2 text-[0.82rem]"
                        style={{ color: plan.highlight && selectedPlan === plan.id ? "rgba(255,255,255,0.75)" : "#3a3a3c" }}>
                        <span style={{ color: plan.color, flexShrink: 0 }}>✓</span>{f}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>

            {error && (
              <p className="text-[0.8rem] text-[#ef4444] bg-[rgba(239,68,68,0.06)] border border-[rgba(239,68,68,0.15)] rounded-xl px-4 py-[10px]">{error}</p>
            )}

            <button onClick={handleSubscribe} disabled={!selectedPlan}
              className="w-full py-[16px] border-none rounded-full font-bold text-[1rem]"
              style={{
                background: selectedPlan ? "linear-gradient(135deg,#9333ea,#7c3aed)" : "rgba(0,0,0,0.06)",
                color:      selectedPlan ? "#fff" : "#aeaeb2",
                cursor:     selectedPlan ? "pointer" : "not-allowed",
                boxShadow:  selectedPlan ? "0 4px 24px rgba(147,51,234,0.4)" : "none",
              }}>
              {notLoggedIn
                ? "Нэвтэрч захиалах →"
                : selectedPlan
                  ? `${selectedPlan === "pro" ? "Pro" : "Basic"} захиалах — ₮${(selectedPlan === "basic" ? prices.basic : prices.pro).toLocaleString()} →`
                  : "Багц сонгоно уу"}
            </button>

            <p className="text-center text-[0.78rem] text-[#aeaeb2]">
              Нэвтэрч орсны дараа · QPay-ээр төлнө · Дурдсан үед цуцлах боломжтой
            </p>
          </div>
        )}

        {/* ── PAYMENT — QPay ── */}
        {step === "payment" && invoice && (
          <div className="max-w-[420px] mx-auto">
            <div className="card p-8 text-center">
              <p className="label-style mb-[10px]">QPay захиалгын төлбөр</p>
              <p className="text-[2.2rem] font-extrabold text-[#1c1c1e] mb-1 tracking-[-0.02em]">
                {invoice.amount.toLocaleString()}₮
              </p>
              <p className="text-[0.85rem] text-[#8e8e93] mb-6">
                {selectedPlan === "pro" ? "Pro · сард 40 шинжилгээ + AI Стилист" : "Basic · сард 20 шинжилгээ"}
              </p>

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
                <div className="grid grid-cols-2 gap-2">
                  {invoice.urls.map((u: QPayUrl) => (
                    <a key={u.name} href={u.link} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-[10px] rounded-xl bg-[#f5f5f7] border border-[rgba(0,0,0,0.07)]">
                      {u.logo && <img src={u.logo} alt={u.name} width={26} height={26} className="rounded-[7px] object-contain shrink-0" />}
                      <span className="text-[0.75rem] text-[#3a3a3c] overflow-hidden text-ellipsis whitespace-nowrap">{u.name}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => setStep("subscribe")}
              className="w-full mt-3 py-3 bg-transparent border border-[rgba(0,0,0,0.1)] rounded-full text-[0.85rem] text-[#8e8e93] cursor-pointer">
              ← Буцах
            </button>
          </div>
        )}

        {/* ── UPLOAD ── */}
        {step === "upload" && (
          <div
            className="rounded-[24px] min-h-[380px] cursor-pointer border-2 border-dashed border-[rgba(147,51,234,0.25)] bg-[rgba(147,51,234,0.02)] flex flex-col items-center justify-center gap-6 p-12 transition-all"
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith("image/")) handleFile(f); }}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
          >
            <input ref={inputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            <div className="w-[88px] h-[88px] rounded-full flex items-center justify-center bg-[rgba(147,51,234,0.1)] border-2 border-[rgba(147,51,234,0.2)]">
              <span className="text-[2.2rem]">📸</span>
            </div>
            <div className="text-center">
              <p className="text-[1.15rem] font-bold text-[#1c1c1e] mb-2">Selfie оруулна уу</p>
              <p className="text-[0.88rem] text-[#8e8e93]">JPG · PNG · WEBP · Урд тал харсан зураг хамгийн сайн</p>
            </div>
          </div>
        )}

        {/* ── OCCASION ── */}
        {step === "occasion" && (
          <div className="flex flex-col gap-5">
            {preview && (
              <div className="card flex items-center gap-4 p-4">
                <Image src={preview} alt="preview" width={56} height={56} className="object-cover rounded-xl border border-[rgba(0,0,0,0.08)]" />
                <div className="flex-1">
                  <p className="text-[0.9rem] font-bold text-[#1c1c1e]">Зураг бэлэн</p>
                  <p className="text-[0.78rem] text-[#8e8e93]">Нөхцлөө сонгоод шинжлэх товчийг дарна уу</p>
                </div>
                <button onClick={() => setStep("upload")} className="text-[0.75rem] text-[#aeaeb2] bg-transparent border-none cursor-pointer">Солих</button>
              </div>
            )}

            <p className="label-style">Ямар нөхцөлд зориулж байна вэ?</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {OCCASIONS.map((o) => (
                <button key={o.id} onClick={() => setOccasion(o.id)}
                  className="p-[18px_14px] rounded-[16px] text-center cursor-pointer transition-all border-[1.5px]"
                  style={{
                    background:  occasion === o.id ? "rgba(147,51,234,0.07)" : "#fff",
                    borderColor: occasion === o.id ? "rgba(147,51,234,0.35)" : "rgba(0,0,0,0.08)",
                    boxShadow:   occasion === o.id ? "0 4px 16px rgba(147,51,234,0.12)" : "0 1px 4px rgba(0,0,0,0.04)",
                  }}>
                  <p className="text-[1.5rem] mb-2">{o.icon}</p>
                  <p className="text-[0.82rem] font-bold text-[#1c1c1e] mb-[2px]">{o.label}</p>
                  <p className="text-[0.7rem] text-[#8e8e93]">{o.sub}</p>
                </button>
              ))}
            </div>

            {error && (
              <p className="text-[0.8rem] text-[#ef4444] bg-[rgba(239,68,68,0.06)] border border-[rgba(239,68,68,0.15)] rounded-xl px-4 py-[10px]">{error}</p>
            )}

            <button onClick={runAll}
              className="w-full py-[14px] border-none rounded-full font-bold text-[0.9rem] text-white cursor-pointer"
              style={{ background: "linear-gradient(135deg,#9333ea,#7c3aed)", boxShadow: "0 4px 20px rgba(147,51,234,0.35)" }}>
              Шинжлэх ✦
            </button>
          </div>
        )}

        {/* ── ANALYZING ── */}
        {step === "analyzing" && (
          <div className="card p-16 text-center max-w-[480px] mx-auto">
            <div className="flex gap-3 justify-center mb-6">
              {[0,1,2].map((i) => (
                <span key={i} className="animate-dot-blink w-3 h-3 rounded-full bg-[#9333ea] inline-block" style={{ animationDelay: `${i*0.2}s` }} />
              ))}
            </div>
            <p className="text-[1.1rem] font-bold text-[#1c1c1e] mb-3">AI гурван чиглэлд нэгэн зэрэг шинжилж байна</p>
            <div className="flex flex-col gap-1.5">
              {[
                { label: "Нүүрний хэлбэр · Арьсны тон · Style type", color: "#9333ea" },
                { label: "Үс засал · Нүүр будалт · Өнгөний палет",  color: "#a855f7" },
                { label: "Хувцас хослол · Стилийн зөвлөмж",         color: "#7c3aed" },
              ].map((l) => (
                <p key={l.label} className="label-style text-center" style={{ color: l.color }}>{l.label}</p>
              ))}
            </div>
          </div>
        )}

        {/* ── RESULT ── */}
        {step === "result" && result && (
          <div className="anim-fade-up flex flex-col gap-5">

            {/* Tab switcher */}
            <div className="flex gap-2 flex-wrap">
              {([
                { id: "face"   as ResultTab, label: "◈ Нүүрний шинжилгээ" },
                { id: "hair"   as ResultTab, label: "✦ Үс & Грим"          },
                { id: "outfit" as ResultTab, label: "◉ Хувцаслалт"         },
              ] as const).map((t) => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className="px-5 py-[9px] rounded-full border text-[0.87rem] font-semibold cursor-pointer transition-all"
                  style={{
                    background:  activeTab === t.id ? "#1c1c1e" : "#fff",
                    color:       activeTab === t.id ? "#fff" : "#6e6e73",
                    borderColor: activeTab === t.id ? "#1c1c1e" : "rgba(0,0,0,0.1)",
                  }}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Face */}
            {activeTab === "face" && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { label: "Нүүрний хэлбэр", value: result.face.faceShape },
                    { label: "Арьсны тон",      value: result.face.skinTone  },
                    { label: "Style type",       value: result.face.styleType },
                  ].map((s) => (
                    <div key={s.label} className="card p-[18px_14px] text-center">
                      <p className="label-style mb-2">{s.label}</p>
                      <p className="text-[0.9rem] font-bold text-[#1c1c1e] leading-[1.35]">{s.value}</p>
                    </div>
                  ))}
                </div>
                <div className="card p-[22px]">
                  <p className="label-style mb-[14px]">Өнгөний палет</p>
                  <div className="flex gap-3 flex-wrap">
                    {result.face.colorPalette.map((c) => (
                      <div key={c} className="flex flex-col items-center gap-[6px]">
                        <div className="w-11 h-11 rounded-[14px] border border-[rgba(0,0,0,0.08)] shadow-[0_2px_8px_rgba(0,0,0,0.1)]" style={{ background: c }} />
                        <span className="text-[0.62rem] text-[#8e8e93]">{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card p-[22px]">
                  <p className="label-style mb-[14px]">AI зөвлөмж</p>
                  <ul className="flex flex-col gap-3 list-none p-0">
                    {result.face.recommendations.map((r, i) => (
                      <li key={i} className="flex gap-3 text-[0.88rem] text-[#3a3a3c] leading-[1.65]">
                        <span className="text-[#9333ea] shrink-0">—</span>{r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Hair */}
            {activeTab === "hair" && (
              <div className="flex flex-col gap-4">
                <div className="card flex items-center gap-4 p-[18px]">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[rgba(168,85,247,0.08)] border border-[rgba(168,85,247,0.15)] shrink-0">
                    <span className="text-[#a855f7]">◈</span>
                  </div>
                  <div>
                    <p className="label-style">Нүүрний хэлбэр</p>
                    <p className="text-base font-bold text-[#1c1c1e] mt-1">{result.hair.faceShape} нүүр</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {(["hair","makeup"] as const).map((t) => (
                    <button key={t} onClick={() => setHairTab(t)}
                      className="text-[0.87rem] font-semibold px-5 py-[9px] rounded-full border cursor-pointer transition-all"
                      style={{
                        background:  hairTab === t ? "#1c1c1e" : "#fff",
                        color:       hairTab === t ? "#fff" : "#6e6e73",
                        borderColor: hairTab === t ? "#1c1c1e" : "rgba(0,0,0,0.1)",
                      }}>
                      {t === "hair" ? "Үс засал" : "Грим"}
                    </button>
                  ))}
                </div>
                {hairTab === "hair" && result.hair.hair.map((h) => (
                  <div key={h.name} className="card p-[18px]">
                    <div className="flex items-start justify-between mb-[10px]">
                      <h3 className="text-[0.98rem] font-bold text-[#1c1c1e]">{h.name}</h3>
                      <span className="text-[0.68rem] font-semibold text-[#8e8e93] px-[10px] py-1 rounded-full bg-[#f5f5f7] border border-[rgba(0,0,0,0.06)] shrink-0 ml-3">{h.length}</span>
                    </div>
                    <p className="text-[0.87rem] text-[#6e6e73] leading-[1.65]">{h.desc}</p>
                  </div>
                ))}
                {hairTab === "makeup" && result.hair.makeup.map((m) => (
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
              </div>
            )}

            {/* Outfit */}
            {activeTab === "outfit" && (
              <div className="flex flex-col gap-4">
                {result.outfits.map((outfit, i) => (
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
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 flex-wrap">
              <button onClick={() => setStep("occasion")}
                className="flex-1 min-w-[140px] py-[13px] bg-[rgba(147,51,234,0.08)] border border-[rgba(147,51,234,0.2)] rounded-full font-bold text-[0.87rem] text-[#9333ea] cursor-pointer">
                Дахин шинжлэх
              </button>
              <button onClick={resetToUpload}
                className="flex-1 min-w-[140px] py-[13px] bg-transparent border border-[rgba(0,0,0,0.1)] rounded-full font-semibold text-[0.87rem] text-[#6e6e73] cursor-pointer">
                Шинэ зураг
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
