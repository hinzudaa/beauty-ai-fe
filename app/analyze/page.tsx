"use client";

import Image from "next/image";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { runFullAnalysis, generateLooks, FullAnalysisResult, GeneratedLook } from "@/apis/analyze";
import { uploadSelfie } from "@/apis/upload";
import { createSubscriptionInvoice, checkPayment, getUpgradePrice, InvoiceResponse, QPayUrl, UpgradePrice } from "@/apis/payment";
import { getProfile, ProfileData } from "@/apis/profile";
import { getPrices } from "@/apis/prices";
import { tokenStore } from "@/utils/request";
import { photoStore } from "@/utils/photoStore";
import { resultStore } from "@/utils/resultStore";
import { appUrl } from "@/config/site";
import ShareButton from "@/components/ShareButton";
import LoadingScreen from "@/components/LoadingScreen";
import LeaderboardConsent from "@/components/LeaderboardConsent";
import { useAuth } from "@/lib/AuthContext";

/**
 * Step order:
 *   checking → (no sub) subscribe → payment → upload → occasion → analyzing → result
 *   checking → (has sub)                       upload → occasion → analyzing → result
 */
type Step = "checking" | "subscribe" | "payment" | "upload" | "occasion" | "analyzing" | "result" | "limitReached";

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
    limit:    5,
    features: [
      "Сард 5 шинжилгээ",
      "Бүрэн AI looksmax шинжилгээ",
      "2 AI Look зураг (1 үс + 1 хувцас)",
      "Өнгөний палет & зөвлөмж",
      "Facebook-т хуваалцах",
    ],
    color: "#3b82f6",
  },
  {
    id:       "standard" as const,
    name:     "Standard",
    limit:    10,
    features: [
      "Сард 10 шинжилгээ",
      "Бүрэн AI looksmax шинжилгээ",
      "2 AI Look зураг (1 үс + 1 хувцас)",
      "Өнгөний палет & зөвлөмж",
      "Facebook-т хуваалцах",
    ],
    color: "#6e6e73",
    decoy: true,
  },
  {
    id:        "pro" as const,
    name:      "Pro",
    limit:     10,
    features:  [
      "Сард 10 шинжилгээ",
      "4 AI Look зураг (2 үс + 2 хувцас)",
      "AI Personal Stylist Chat",
      "Бүх Basic боломжууд",
    ],
    color:     "#9333ea",
    highlight: true,
  },
];

export default function AnalyzePage() {
  // SSR-safe: both server and client start with "checking" so tree always matches
  const [step, setStep]               = useState<Step>("checking");
  const [notLoggedIn, setNotLoggedIn] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"basic" | "standard" | "pro" | null>(null);

  const [preview, setPreview]   = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [occasion, setOccasion]   = useState("interview");
  const [invoice, setInvoice]     = useState<InvoiceResponse | null>(null);
  const [error, setError]         = useState<string | null>(null);
  const [profile, setProfile]     = useState<ProfileData | null>(null);
  const [result, setResult]       = useState<FullAnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<"hair" | "outfit">("hair");
  const [prices, setPrices]       = useState({ basic: 19900, standard: 34900, pro: 59900 });
  const [generatedLooks, setGeneratedLooks]     = useState<GeneratedLook[]>([]);
  const [generatingLooks, setGeneratingLooks]   = useState(false);
  const [showLbConsent, setShowLbConsent]       = useState(false);
  const [upgradeInfo, setUpgradeInfo]           = useState<UpgradePrice | null>(null);
  const [proInvoice, setProInvoice]           = useState<InvoiceResponse | null>(null);
  const [proPayState, setProPayState]         = useState<"idle" | "creating" | "waiting" | "success">("idle");
  const router      = useRouter();
  const inputRef    = useRef<HTMLInputElement>(null);
  const { user }    = useAuth();

  /* ── On mount: read browser APIs, then fetch profile ── */
  useEffect(() => {
    const token = tokenStore.get();
    const saved  = photoStore.get();
    const planParam = new URLSearchParams(window.location.search).get("plan");

    if (!token) {
      // Batch all sync state into one async-style callback via queueMicrotask
      queueMicrotask(() => {
        setNotLoggedIn(true);
        setSelectedPlan(planParam === "basic" || planParam === "pro" ? planParam : null);
        setStep("subscribe");
      });
      return;
    }

    getProfile()
      .then((p) => {
        // All state updates happen inside an async callback — no ESLint warning
        setProfile(p);
        if (saved?.preview) setPreview(saved.preview);
        if (planParam === "basic" || planParam === "pro") setSelectedPlan(planParam);
        const sub = p.subscription;
        if (sub?.status !== "active") { setStep("subscribe"); return; }
        if (sub.monthlyUsage >= sub.usageLimit) { setStep("limitReached"); return; }

        // ── Hard-refresh recovery ────────────────────────────
        // If the user refreshed while looks were generating, restore result
        // and jump back to the result step — the recovery useEffect handles the rest
        const savedResult = resultStore.getResult();
        const savedPhoto  = resultStore.getPhotoUrl();
        if (savedResult) {
          setResult(savedResult);
          setActiveTab("hair");
          if (savedPhoto) setPhotoUrl(savedPhoto);
          setStep("result");
          return;
        }

        setStep(saved?.preview ? "occasion" : "upload");
      })
      .catch(() => setStep("subscribe"));

    getPrices()
      .then((p) => setPrices({ basic: p.basicPrice, standard: p.standardPrice ?? 34900, pro: p.proPrice }))
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch upgrade price when a plan is selected and user is authenticated
  // Note: when selectedPlan is null or user is not logged in, upgradeInfo stays null
  // (set to null by lazy initializer — no synchronous setState in effect)
  useEffect(() => {
    if (!selectedPlan || notLoggedIn || !tokenStore.get()) return;
    let cancelled = false;
    getUpgradePrice(selectedPlan)
      .then((p) => { if (!cancelled) setUpgradeInfo(p); })
      .catch(() => { if (!cancelled) setUpgradeInfo(null); });
    return () => { cancelled = true; };
  }, [selectedPlan, notLoggedIn]);

  /* ── Warn user before leaving while looks are generating ── */
  useEffect(() => {
    if (!generatingLooks) return;
    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "Зураг үүсгэж байна. Хуудсыг орхивол үр дүн алдагдаж болно.";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [generatingLooks]);

  /* ── On result mount: recover existing looks if user refreshed mid-generation ── */
  useEffect(() => {
    if (step !== "result" || !result?.analysisId || generatedLooks.length > 0 || generatingLooks) return;

    const id = result.analysisId;

    // Step 1: Check DB — setGeneratingLooks inside async callback to avoid ESLint warning
    import("@/apis/analyze").then(async ({ generateLooks: gl }) => {
      setGeneratingLooks(true);
      try {
        const { siteUrl } = await import("@/config/site");
        const res = await fetch(`${siteUrl}/analyze/result/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.looks && data.looks.length > 0) {
            // Looks already in DB — no need to re-generate
            setGeneratedLooks(data.looks);
            setGeneratingLooks(false);
            return;
          }
        }
      } catch { /* fall through to generate */ }

      // Step 2: Looks not in DB — try generate-looks
      // Server returns 202 if already generating (lock held) → poll DB instead
      if (!result.analysis) { setGeneratingLooks(false); return; }

      let pollTimer: ReturnType<typeof setTimeout>;
      async function pollUntilReady() {
        try {
          const { siteUrl: su } = await import("@/config/site");
          const r = await fetch(`${su}/analyze/result/${id}`);
          if (r.ok) {
            const d = await r.json();
            if (d.looks && d.looks.length > 0) {
              setGeneratedLooks(d.looks);
              setGeneratingLooks(false);
              return;
            }
          }
        } catch { /* keep polling */ }
        pollTimer = setTimeout(pollUntilReady, 5000);
      }

      gl(
        photoUrl ?? "",
        id,
        {
          gender:              result.analysis.gender,
          faceShape:           result.analysis.faceShape,
          skinTone:            result.analysis.skinTone,
          lookmaxScore:        result.analysis.lookmaxScore,
          hairRecommendations: result.analysis.hairRecommendations ?? [],
          outfitStyle:         result.analysis.outfitStyle,
          colorPalette:        result.analysis.colorPalette ?? [],
        },
        result.occasion ?? "casual"
      )
        .then(({ looks }) => { setGeneratedLooks(looks); setGeneratingLooks(false); })
        .catch((err) => {
          // 202 means server is generating — poll DB every 5s
          if (err?.status === 202 || err?.message?.includes("202")) {
            pollUntilReady();
          } else {
            setGeneratingLooks(false);
          }
        });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, result?.analysisId]);

  /* ── File select: show preview immediately, upload to R2 in background ── */
  async function handleFile(file: File) {
    setPreview(URL.createObjectURL(file));
    setPhotoUrl(null);
    setError(null); setResult(null);
    setUploading(true);
    setStep("occasion");

    try {
      const { url } = await uploadSelfie(file);
      setPhotoUrl(url);
      resultStore.setPhotoUrl(url);   // persist for hard-refresh recovery
    } catch (err) {
      setError(err instanceof Error ? err.message : "Зураг хуулахад алдаа гарлаа");
      setStep("upload");
    } finally {
      setUploading(false);
    }
  }

  /* ── Subscribe → QPay ── */
  async function handleSubscribe() {
    if (!selectedPlan) return;
    if (!tokenStore.get()) {
      // Not logged in → redirect to login, come back here with plan pre-selected
      router.push(`/login?next=${encodeURIComponent(window.location.pathname + (window.location.search || `?plan=${selectedPlan}`))}`);
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

  /* ── GPT-4o looksmaxxing analysis, then DALL-E look images in background ── */
  const runAll = useCallback(async () => {
    if (!photoUrl) {
      setError("Зураг хуулж дуусаагүй байна, хүлээнэ үү..."); return;
    }
    setStep("analyzing"); setError(null);
    try {
      const r = await runFullAnalysis(photoUrl, occasion);
      setResult(r); setActiveTab("hair"); setStep("result");
      resultStore.setResult(r);   // persist for hard-refresh recovery

      // fal.ai InstantID look generation — both Basic (2 img) and Pro (5 img)
      setGeneratedLooks([]); setGeneratingLooks(true);
      generateLooks(
        photoUrl,
        r.analysisId,
        {
          gender:              r.analysis.gender,
          faceShape:           r.analysis.faceShape,
          skinTone:            r.analysis.skinTone,
          lookmaxScore:        r.analysis.lookmaxScore,
          hairRecommendations: r.analysis.hairRecommendations ?? [],
          outfitStyle:         r.analysis.outfitStyle,
          colorPalette:        r.analysis.colorPalette ?? [],
        },
        occasion
      )
        .then(({ looks }) => {
          setGeneratedLooks(looks);
          resultStore.clear();   // looks done — no longer need recovery data
          // Show leaderboard consent ONLY if:
          // 1. Looks generated successfully
          // 2. New score is HIGHER than existing score (improvement)
          if (looks.length > 0) {
            const newScore   = Math.round((r.analysis.lookmaxScore ?? 0) * 10 * 1000) / 1000;
            const prevScore  = user?.lookScore ?? 0;
            if (newScore > prevScore) {
              setShowLbConsent(true);
            }
          }
        })
        .catch(() => { /* images optional — analysis already shown */ })
        .finally(() => setGeneratingLooks(false));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Алдаа гарлаа";
      if (msg === "needsSubscription")   { setStep("subscribe");    }
      else if (msg === "usageLimitReached") {
        // Refresh profile to get latest usage count, then show limit screen
        getProfile().then(setProfile).catch(() => {});
        setStep("limitReached");
      }
      else { setError(msg); setStep("occasion"); }
    }
  }, [photoUrl, occasion]);

  async function handleProUpgrade() {
    if (!tokenStore.get()) { router.push("/login"); return; }
    setProPayState("creating");
    try {
      const inv = await createSubscriptionInvoice("pro");
      setProInvoice(inv);
      setProPayState("waiting");

      const timer = setInterval(async () => {
        try {
          const s = await checkPayment(inv.invoiceId);
          if (s.paid) {
            clearInterval(timer);
            setProPayState("success");
            setTimeout(() => router.push("/"), 2000);
          }
        } catch { /* keep polling */ }
      }, 3000);
      setTimeout(() => { clearInterval(timer); setProPayState("idle"); }, 15 * 60 * 1000);
    } catch (err) {
      setProPayState("idle");
      setError(err instanceof Error ? err.message : "Алдаа гарлаа");
    }
  }

  function resetToUpload() {
    setPreview(null); setPhotoUrl(null); setResult(null); setError(null);
    setGeneratedLooks([]); setGeneratingLooks(false);
    resultStore.clear();
    setStep("upload");
  }

  /* ─────────────────── UI ─────────────────── */

  return (
    <>
      {/* Loading overlay — fixed fullscreen, no tree mismatch */}
      {(step === "checking" || step === "analyzing") && (
        <LoadingScreen text={step === "analyzing" ? "Шинжилж байна, түр хүлээнэ үү..." : undefined} />
      )}

    <div className="min-h-screen relative overflow-hidden">

      <div className="relative max-w-[1200px] mx-auto px-5 pt-10 pb-24">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 text-[0.72rem] font-bold tracking-[0.12em] uppercase"
            style={{ background: "rgba(147,51,234,0.08)", color: "#9333ea", border: "1px solid rgba(147,51,234,0.2)" }}>
            🌸 AI Looka · Beauty
          </div>
          <h1 className="text-[clamp(1.6rem,4vw,2.2rem)] font-extrabold tracking-[-0.03em] leading-[1.15]"
            style={{ color: "#1c1c1e" }}>
            {step === "subscribe"   && <>Захиалга сонгох <span className="text-[#9333ea]">✨</span></>}
            {step === "payment"     && <>QPay төлбөр <span className="text-purple-500">💳</span></>}
            {step === "upload"      && <>Selfie оруулах <span className="text-[#9333ea]">📸</span></>}
            {step === "occasion"    && <>Нөхцөл сонгох <span className="text-purple-500">🎀</span></>}
            {step === "result"      && <>Миний шинжилгээ <span className="text-[#9333ea]">✨</span></>}
            {step === "limitReached" && <>Сарын хязгаарт хүрлээ <span className="text-red-400">🚫</span></>}
          </h1>
          <p className="text-[0.82rem] mt-2" style={{ color: "#9ca3af" }}>
            {step === "upload"   && "AI шинжилгээ · Үс · Хувцас"}
            {step === "occasion" && "Ямар нөхцөлд зориулж байна вэ?"}
            {step === "subscribe" && "Сарын захиалгаар AI шинжилгээ авна уу"}
          </p>
        </div>

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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {PLAN_META.map((plan) => (
                <button key={plan.id} onClick={() => setSelectedPlan(plan.id)}
                  className="p-6 rounded-[22px] text-left transition-all relative overflow-hidden cursor-pointer"
                  style={{
                    background:  selectedPlan === plan.id ? (plan.highlight ? "#1c1c1e" : `${plan.color}08`) : "#fff",
                    border:      `2px solid ${selectedPlan === plan.id ? plan.color : "rgba(0,0,0,0.08)"}`,
                    boxShadow:   selectedPlan === plan.id ? `0 8px 32px ${plan.color}25` : "0 2px 12px rgba(0,0,0,0.05)",
                    opacity:     (plan as { decoy?: boolean }).decoy ? 0.85 : 1,
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
                    {(plan as { decoy?: boolean }).decoy && (
                      <span className="text-[0.55rem] font-bold text-[#8e8e93] bg-[rgba(0,0,0,0.05)] border border-[rgba(0,0,0,0.08)] rounded-full px-2 py-0.5">
                        Стандарт
                      </span>
                    )}
                  </div>

                  {/* Price — show discounted price if upgrading */}
                  {selectedPlan === plan.id && upgradeInfo?.isUpgrade ? (
                    <div className="mb-4">
                      <div className="flex items-end gap-2">
                        <p className="text-[2rem] font-extrabold leading-none"
                          style={{ color: plan.highlight ? "#fff" : "#1c1c1e" }}>
                          ₮{upgradeInfo.amount.toLocaleString()}
                        </p>
                        <p className="text-[1rem] line-through mb-1"
                          style={{ color: plan.highlight ? "rgba(255,255,255,0.3)" : "#aeaeb2" }}>
                          ₮{upgradeInfo.fullPrice.toLocaleString()}
                        </p>
                      </div>
                      <p className="text-[0.72rem] font-semibold mt-1"
                        style={{ color: plan.highlight ? "#c084fc" : "#9333ea" }}>
                        -{upgradeInfo.discount.toLocaleString()}₮ хасагдсан ({upgradeInfo.remainingDays} өдрийн үлдэгдэл)
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-[2rem] font-extrabold leading-none mb-1"
                        style={{ color: plan.highlight && selectedPlan === plan.id ? "#fff" : "#1c1c1e" }}>
                        ₮{(plan.id === "basic" ? prices.basic : prices.pro).toLocaleString()}
                      </p>
                      <p className="text-[0.78rem] mb-4"
                        style={{ color: plan.highlight && selectedPlan === plan.id ? "rgba(255,255,255,0.4)" : "#8e8e93" }}>
                        / сар · {plan.limit} шинжилгээ
                      </p>
                    </>
                  )}

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
                  ? upgradeInfo?.isUpgrade
                    ? `Upgrade хийх — ₮${upgradeInfo.amount.toLocaleString()} →`
                    : `${selectedPlan === "pro" ? "Pro" : selectedPlan === "standard" ? "Standard" : "Basic"} захиалах — ₮${(selectedPlan === "pro" ? prices.pro : selectedPlan === "standard" ? prices.standard : prices.basic).toLocaleString()} →`
                  : "Багц сонгоно уу"}
            </button>
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
              <p className="text-[0.85rem] text-[#8e8e93] mb-2">
                {selectedPlan === "pro" ? "Pro · сард 10 шинжилгээ · 4 AI look" : "Basic · сард 5 шинжилгээ · 2 AI look"}
              </p>
              {upgradeInfo?.isUpgrade && (
                <div className="inline-flex items-center gap-2 bg-[rgba(147,51,234,0.08)] border border-[rgba(147,51,234,0.2)] rounded-full px-4 py-1.5 mb-6">
                  <span className="text-[0.72rem] font-bold text-[#9333ea]">
                    Upgrade хөнгөлөлт: -{upgradeInfo.discount.toLocaleString()}₮
                  </span>
                  <span className="text-[0.65rem] text-[#8e8e93]">({upgradeInfo.remainingDays} өдрийн үлдэгдэл)</span>
                </div>
              )}

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
                  <span key={i} className="animate-dot-blink w-[6px] h-[6px] rounded-full bg-[#9333ea]-block" style={{ animationDelay: `${i*0.2}s` }} />
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
          <div className="flex flex-col gap-4">
            <div
              className="rounded-[32px] min-h-[340px] cursor-pointer flex flex-col items-center justify-center gap-5 p-10 transition-all relative overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.7)",
                backdropFilter: "blur(20px)",
                border: "2px dashed rgba(147,51,234,0.3)",
                boxShadow: "0 8px 32px rgba(147,51,234,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
              }}
              onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith("image/")) handleFile(f); }}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => inputRef.current?.click()}
            >
              {/* Cute corner decorations */}
              <span className="absolute top-4 left-4 text-purple-200 text-lg select-none">🌸</span>
              <span className="absolute top-4 right-4 text-purple-200 text-lg select-none">✨</span>
              <span className="absolute bottom-4 left-4 text-purple-200 text-lg select-none">💜</span>
              <span className="absolute bottom-4 right-4 text-purple-200 text-lg select-none">🌸</span>

              <input ref={inputRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

              {/* Camera icon */}
              <div className="w-24 h-24 rounded-full flex items-center justify-center relative"
                style={{ background: "linear-gradient(135deg, rgba(147,51,234,0.12), rgba(147,51,234,0.12))" }}>
                <div className="absolute inset-0 rounded-full animate-ping opacity-20"
                  style={{ background: "radial-gradient(circle, #9333ea, transparent)" }} />
                <span className="text-[2.8rem] relative z-10">📸</span>
              </div>

              <div className="text-center">
                <p className="text-[1.1rem] font-extrabold mb-1" style={{ color: "#1c1c1e" }}>
                  Селфи оруулна уу
                </p>
                <p className="text-[0.8rem] font-semibold mb-1" style={{ color: "#9333ea" }}>
                  Хөөрхөн гарсан селфигээ оруулаарай😁
                </p>
                <p className="text-[0.75rem]" style={{ color: "#a78bfa" }}>
                  JPG · PNG · WEBP
                </p>
              </div>

              <div className="px-6 py-2.5 rounded-full font-bold text-[0.85rem] text-white"
                style={{ background: "linear-gradient(270deg, #9333ea, #7c3aed)", boxShadow: "0 4px 16px rgba(147,51,234,0.35)" }}>
                Зураг сонгох
              </div>
            </div>
          </div>
        )}

        {/* ── OCCASION ── */}
        {step === "occasion" && (
          <div className="flex flex-col gap-4">
            {/* Preview card */}
            {preview && (
              <div className="flex items-center gap-4 p-4 rounded-[20px]"
                style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 4px 20px rgba(147,51,234,0.06)" }}>
                <div className="relative shrink-0">
                  <Image src={preview} alt="preview" width={60} height={60}
                    className="object-cover rounded-[14px] border-2 border-purple-100" style={{ aspectRatio: "1" }} />
                  {uploading && (
                    <div className="absolute inset-0 rounded-[14px] bg-white/60 flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-[0.88rem] font-bold" style={{ color: "#1c1c1e" }}>
                    {uploading ? "Хуулж байна... 🌸" : "Зураг бэлэн ✓"}
                  </p>
                  <p className="text-[0.74rem] mt-0.5" style={{ color: "#a78bfa" }}>
                    {uploading ? "Хуулж байна..." : "Нөхцлөө сонгоно уу"}
                  </p>
                </div>
                <button onClick={() => setStep("upload")}
                  className="text-[0.72rem] font-semibold px-3 py-1.5 rounded-full border-none cursor-pointer"
                  style={{ background: "rgba(147,51,234,0.08)", color: "#9333ea" }}>
                  Солих
                </button>
              </div>
            )}

            {/* Occasion grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {OCCASIONS.map((o) => {
                const sel = occasion === o.id;
                return (
                  <button key={o.id} onClick={() => setOccasion(o.id)}
                    className="py-5 px-3 rounded-[20px] text-center cursor-pointer transition-all relative overflow-hidden"
                    style={{
                      background:  sel ? "linear-gradient(135deg, rgba(147,51,234,0.1), rgba(147,51,234,0.08))" : "rgba(255,255,255,0.7)",
                      border:      sel ? "2px solid rgba(147,51,234,0.4)" : "2px solid rgba(255,255,255,0.9)",
                      boxShadow:   sel ? "0 6px 20px rgba(147,51,234,0.15)" : "0 2px 12px rgba(0,0,0,0.04)",
                      backdropFilter: "blur(12px)",
                    }}>
                    {sel && (
                      <div className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center"
                        style={{ background: "linear-gradient(270deg, #9333ea, #7c3aed)" }}>
                        <span className="text-white text-[0.5rem] font-black">✓</span>
                      </div>
                    )}
                    <p className="text-[1.8rem] mb-2">{o.icon}</p>
                    <p className="text-[0.8rem] font-extrabold mb-0.5" style={{ color: sel ? "#9333ea" : "#1c1c1e" }}>{o.label}</p>
                    <p className="text-[0.65rem] font-medium" style={{ color: sel ? "#9333ea" : "#a78bfa" }}>{o.sub}</p>
                  </button>
                );
              })}
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-[14px] px-4 py-3">
                <span className="text-sm">⚠️</span>
                <p className="text-[0.8rem] text-red-400">{error}</p>
              </div>
            )}

            <button onClick={runAll} disabled={uploading || !photoUrl}
              className="w-full py-4 border-none rounded-full font-extrabold text-[0.95rem] text-white transition-all"
              style={{
                background: uploading || !photoUrl
                  ? "rgba(0,0,0,0.08)"
                  : "linear-gradient(270deg, #9333ea, #7c3aed)",
                boxShadow:  uploading || !photoUrl ? "none" : "0 6px 24px rgba(147,51,234,0.4)",
                color:      uploading || !photoUrl ? "#a78bfa" : "#fff",
                cursor:     uploading || !photoUrl ? "not-allowed" : "pointer",
              }}>
              {uploading ? "Хуулж байна... 🌸" : "Шинжлэх ✨"}
            </button>
          </div>
        )}

        {/* ── LIMIT REACHED ── */}
        {step === "limitReached" && (
          <div className="max-w-[480px] mx-auto flex flex-col gap-5">
            {/* Icon + message */}
            <div className="card p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-[rgba(239,68,68,0.08)] border-2 border-[rgba(239,68,68,0.15)] flex items-center justify-center mx-auto mb-4">
                <span className="text-[2rem]">🚫</span>
              </div>
              <p className="text-[1.15rem] font-extrabold text-[#1c1c1e] mb-2">Сарын хязгаарт хүрлээ</p>
              <p className="text-[0.88rem] text-[#6e6e73] leading-[1.6] mb-5">
                Энэ сард боломжит шинжилгээний тоо дууслаа.<br />
                Ирэх сарын эхэнд автоматаар шинэчлэгдэнэ.
              </p>

              {/* Usage bar */}
              {profile?.subscription && (
                <div className="bg-[#f5f5f7] rounded-2xl p-4 mb-5 text-left">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[0.78rem] font-semibold text-[#3a3a3c]">
                      {profile.subscription.plan.toUpperCase()} багц
                    </span>
                    <span className="text-[0.78rem] font-bold text-[#ef4444]">
                      {profile.subscription.monthlyUsage} / {profile.subscription.usageLimit} ашигласан
                    </span>
                  </div>
                  <div className="h-2 bg-[rgba(0,0,0,0.08)] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[#ef4444]" style={{ width: "100%" }} />
                  </div>
                  {profile.subscription.usageResetAt && (
                    <p className="text-[0.72rem] text-[#aeaeb2] mt-2">
                      Шинэчлэгдэх: {new Date(profile.subscription.usageResetAt).toLocaleDateString("mn-MN", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  )}
                </div>
              )}

              {/* Upgrade to Pro if on basic/standard */}
              {profile?.subscription?.plan !== "pro" && (
                <div className="rounded-2xl p-4 mb-4 text-left"
                  style={{ background: "linear-gradient(135deg,rgba(147,51,234,0.06),rgba(124,58,237,0.03))", border: "1px solid rgba(147,51,234,0.15)" }}>
                  <p className="text-[0.82rem] font-bold text-[#1c1c1e] mb-1">
                    ⭐ Pro-д шилжиж сард 10 шинжилгээ авна уу
                  </p>
                  <p className="text-[0.75rem] text-[#6e6e73] mb-3">4 AI Look зураг + AI Стилист чат</p>
                  <button onClick={() => { setSelectedPlan("pro"); setStep("subscribe"); }}
                    className="w-full py-[11px] rounded-full font-bold text-[0.85rem] text-white border-none cursor-pointer"
                    style={{ background: "linear-gradient(135deg,#9333ea,#7c3aed)", boxShadow: "0 4px 20px rgba(147,51,234,0.35)" }}>
                    Pro-д upgrade хийх →
                  </button>
                </div>
              )}

              <p className="text-[0.78rem] text-[#aeaeb2]">
                Сарын шинэчлэл хийгдсэний дараа дахин шинжилгээ хийх боломжтой.
              </p>
            </div>
          </div>
        )}

        {/* analyzing — handled by early return above */}

        {/* ── RESULT ── */}
        {step === "result" && result && (
          <div className="anim-fade-up flex flex-col gap-5">

            {/* Score card */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="label-style mb-1">Looksmax оноо</p>
                  <div className="flex items-end gap-2">
                    <span className="text-[3rem] font-extrabold text-[#1c1c1e] leading-none tracking-[-0.04em]">
                      {(result.analysis.lookmaxScore * 10).toFixed(3)}
                    </span>
                    <span className="text-[#aeaeb2] text-[1rem] mb-1">/100</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="label-style mb-1">Нүүрний хэлбэр</p>
                  <p className="text-[1rem] font-bold text-[#1c1c1e]">{result.analysis.faceShape}</p>
                  <p className="text-[0.8rem] text-[#8e8e93] mt-0.5">{result.analysis.skinTone}</p>
                </div>
              </div>
              {/* Score bar */}
              <div className="h-2 bg-[rgba(0,0,0,0.06)] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(result.analysis.lookmaxScore / 10) * 100}%`,
                    background: result.analysis.lookmaxScore >= 8
                      ? "linear-gradient(90deg,#16a34a,#22c55e)"
                      : result.analysis.lookmaxScore >= 6
                      ? "linear-gradient(90deg,#9333ea,#a855f7)"
                      : "linear-gradient(90deg,#d97706,#f59e0b)",
                  }} />
              </div>
              {/* Color palette */}
              {result.analysis.colorPalette?.length > 0 && (
                <div className="flex gap-2 mt-4 flex-wrap">
                  {result.analysis.colorPalette.map((c) => (
                    <div key={c} className="flex flex-col items-center gap-1">
                      <div className="w-9 h-9 rounded-xl border border-[rgba(0,0,0,0.08)]" style={{ background: c }} />
                      <span className="text-[0.55rem] text-[#aeaeb2]">{c}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Undertone + Seasonal color — things users don't know about themselves */}
            {(result.analysis.undertone || result.analysis.seasonalColor) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {result.analysis.undertone && (
                  <div className="card p-5">
                    <p className="label-style mb-2" style={{ color: "#d97706" }}>🌡 Арьсны далд тон</p>
                    <p className="text-[1rem] font-bold text-[#1c1c1e] mb-1">{result.analysis.undertone}</p>
                    <p className="text-[0.78rem] text-[#6e6e73] leading-[1.5]">
                      Ихэнх хүн өөрийнхөө undertone-г мэддэггүй. Энэ нь хувцас, нүүр будалт, үс будалтын өнгийг сонгоход хамгийн чухал хүчин зүйл.
                    </p>
                  </div>
                )}
                {result.analysis.seasonalColor && (
                  <div className="card p-5">
                    <p className="label-style mb-2" style={{ color: "#059669" }}>🌸 Өнгөний улирал</p>
                    <p className="text-[1rem] font-bold text-[#1c1c1e] mb-1">{result.analysis.seasonalColor}</p>
                    <p className="text-[0.78rem] text-[#6e6e73] leading-[1.5]">
                      Энэ улирлын өнгөнүүд таны арьс, нүд, үсний өнгөтэй хамгийн сайн нийцэж, нүүрийг гэрэлтүүлнэ.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Hidden strengths — what others notice but you don't */}
            {result.analysis.hiddenStrengths && result.analysis.hiddenStrengths.length > 0 && (
              <div className="card p-5"
                style={{ background: "linear-gradient(135deg,rgba(147,51,234,0.04),rgba(167,139,250,0.02))", border: "1px solid rgba(147,51,234,0.15)" }}>
                <p className="label-style text-[#9333ea] mb-3">✨ Бусад хүмүүс анзаардаг онцлогууд</p>
                <ul className="flex flex-col gap-2 list-none p-0">
                  {result.analysis.hiddenStrengths.map((s, i) => (
                    <li key={i} className="flex gap-2 text-[0.86rem] text-[#3a3a3c] leading-[1.6]">
                      <span className="text-[#9333ea] shrink-0">✦</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Features breakdown */}
            <div className="card p-5">
              <p className="label-style mb-4">Нүүрний онцлог</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(result.analysis.features ?? {}).map(([key, val]) => {
                  const LABELS: Record<string, string> = { eyes: "Нүд", jawline: "Эрүү", chin: "Эрүүний доор", nose: "Хамар", lips: "Уруул" };
                  return (
                    <div key={key} className="bg-[#f9f9fb] rounded-xl p-3 border border-[rgba(0,0,0,0.05)]">
                      <p className="label-style mb-1" style={{ color: "#9333ea" }}>{LABELS[key] ?? key}</p>
                      <p className="text-[0.82rem] text-[#3a3a3c] leading-[1.5]">{String(val)}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="card p-5">
                <p className="label-style text-[#16a34a] mb-3">✓ Давуу тал</p>
                <ul className="flex flex-col gap-2 list-none p-0">
                  {(result.analysis.strengths ?? []).map((s, i) => (
                    <li key={i} className="flex gap-2 text-[0.84rem] text-[#3a3a3c] leading-[1.5]">
                      <span className="text-[#16a34a] shrink-0 font-bold">+</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card p-5">
                <p className="label-style text-[#9333ea] mb-3">↑ Looksmax зөвлөмж</p>
                <ul className="flex flex-col gap-2 list-none p-0">
                  {(result.analysis.improvements ?? []).map((s, i) => (
                    <li key={i} className="flex gap-2 text-[0.84rem] text-[#3a3a3c] leading-[1.5]">
                      <span className="text-[#9333ea] shrink-0 font-bold">→</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Makeup tips */}
            {result.analysis.makeupTips && (
              <div className="card p-5">
                <p className="label-style mb-2" style={{ color: "#9333ea" }}>💄 Нүүр будалтын зөвлөгөө</p>
                <p className="text-[0.86rem] text-[#3a3a3c] leading-[1.65]">{result.analysis.makeupTips}</p>
              </div>
            )}

            {/* Hair & Style */}
            {/* Hair recommendations */}
            <div className="card p-5">
              <p className="label-style mb-3">✂️ Солонгос үс засалтын зөвлөмж</p>
              <div className="flex flex-col gap-3">
                {(result.analysis.hairRecommendations ?? []).map((h, i) => (
                  <div key={h.name} className="flex gap-3 items-start bg-[rgba(147,51,234,0.04)] rounded-xl p-3 border border-[rgba(147,51,234,0.1)]">
                    <span className="text-[0.7rem] font-black text-[#9333ea] bg-[rgba(147,51,234,0.12)] rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    <div>
                      <p className="text-[0.88rem] font-bold text-[#1c1c1e]">{h.name}</p>
                      <p className="text-[0.78rem] text-[#6e6e73] leading-[1.5] mt-0.5">{h.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Outfit style */}
            {result.analysis.outfitStyle && (
              <div className="card p-5">
                <p className="label-style mb-3">👗 Korean хувцасны зөвлөмж</p>
                {result.analysis.outfitStyle.koreanStyle && (
                  <div className="mb-4">
                    <p className="text-[0.95rem] font-extrabold text-[#1c1c1e] mb-1">
                      {result.analysis.outfitStyle.koreanStyle.styleName}
                    </p>
                    <p className="text-[0.8rem] text-[#6e6e73] leading-[1.55]">
                      {result.analysis.outfitStyle.koreanStyle.description}
                    </p>
                  </div>
                )}
                {result.analysis.outfitStyle.bestColors && result.analysis.outfitStyle.bestColors.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[0.72rem] font-bold text-[#16a34a] uppercase tracking-wider mb-2">✓ Тохирох өнгөнүүд</p>
                    <div className="flex flex-wrap gap-2">
                      {result.analysis.outfitStyle.bestColors.map((c) => (
                        <span key={c} className="text-[0.75rem] font-medium text-[#1c1c1e] bg-[rgba(22,163,74,0.07)] border border-[rgba(22,163,74,0.2)] rounded-full px-3 py-0.5">{c}</span>
                      ))}
                    </div>
                  </div>
                )}
                {result.analysis.outfitStyle.avoidColors && result.analysis.outfitStyle.avoidColors.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[0.72rem] font-bold text-[#ef4444] uppercase tracking-wider mb-2">✗ Зайлсхийх өнгөнүүд</p>
                    <div className="flex flex-wrap gap-2">
                      {result.analysis.outfitStyle.avoidColors.map((c) => (
                        <span key={c} className="text-[0.75rem] font-medium text-[#6e6e73] bg-[rgba(239,68,68,0.05)] border border-[rgba(239,68,68,0.15)] rounded-full px-3 py-0.5">{c}</span>
                      ))}
                    </div>
                  </div>
                )}
                {result.analysis.outfitStyle.koreanStyle && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                    {[
                      { label: "Дээд хувцас", items: result.analysis.outfitStyle.koreanStyle.tops },
                      { label: "Доод хувцас", items: result.analysis.outfitStyle.koreanStyle.bottoms },
                      { label: "Гадуур хувцас", items: result.analysis.outfitStyle.koreanStyle.outerwear },
                    ].map(({ label, items: its }) => its && its.length > 0 && (
                      <div key={label} className="bg-[#f9f9fb] rounded-xl p-3 border border-[rgba(0,0,0,0.05)]">
                        <p className="text-[0.68rem] font-bold text-[#9333ea] uppercase tracking-wider mb-2">{label}</p>
                        {its.map((item) => (
                          <p key={item} className="text-[0.78rem] text-[#3a3a3c] leading-[1.5]">· {item}</p>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Pro upsell — shown after Basic user sees their 2 images */}
            {profile?.subscription?.plan === "basic" && !generatingLooks && generatedLooks.length > 0 && (
              <div className="card p-4 flex items-center gap-3"
                style={{ background: "linear-gradient(135deg,rgba(147,51,234,0.04),rgba(124,58,237,0.02))", border: "1px solid rgba(147,51,234,0.15)" }}>
                <span className="text-[1.4rem] shrink-0">⭐</span>
                <div className="flex-1">
                  <p className="text-[0.85rem] font-bold text-[#1c1c1e]">Pro-д 5 AI look зураг авна</p>
                  <p className="text-[0.75rem] text-[#6e6e73]">2 үс засалт + 2 хувцас + 1 casual look</p>
                </div>
                <button onClick={handleProUpgrade} disabled={proPayState !== "idle"}
                  className="shrink-0 text-[0.78rem] font-bold text-white px-3 py-[8px] rounded-full whitespace-nowrap border-none cursor-pointer"
                  style={{ background: "linear-gradient(135deg,#9333ea,#7c3aed)", opacity: proPayState !== "idle" ? 0.7 : 1 }}>
                  {proPayState === "creating" ? "..." : "Upgrade →"}
                </button>
              </div>
            )}

            {/* AI generated look images */}
            {(generatingLooks || generatedLooks.length > 0) && (
              <div className="card p-4 sm:p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="label-style">AI үүсгэсэн look-ууд</p>
                  {generatingLooks && (
                    <div className="flex items-center gap-2">
                      {[0,1,2].map((i) => (
                        <span key={i} className="animate-dot-blink w-[5px] h-[5px] rounded-full bg-[#9333ea]-block" style={{ animationDelay: `${i*0.2}s` }} />
                      ))}
                      <span className="text-[0.72rem] text-[#9333ea]">Зурагийг үүсгэж байна...</span>
                    </div>
                  )}
                </div>

                {/* Mobile: 1 col full-width · Desktop: 2 col */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {generatedLooks.map((look) => (
                    <div key={look.name} className="relative rounded-[16px] overflow-hidden bg-[#f5f5f7] group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={look.imageUrl} alt={look.name} className="w-full h-full object-cover object-top" />
                      <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-10"
                        style={{ background: "linear-gradient(to top,rgba(0,0,0,0.85),transparent)" }}>
                        <p className="text-[0.82rem] font-bold text-white text-center tracking-wide mb-2">{look.name}</p>
                        {/* Download button */}
                        <button
                          onClick={async () => {
                            try {
                              const res  = await fetch(look.imageUrl);
                              const blob = await res.blob();
                              const url  = URL.createObjectURL(blob);
                              const a    = document.createElement("a");
                              a.href     = url;
                              a.download = `looka-${look.name.replace(/\s+/g, "-").toLowerCase()}.jpg`;
                              a.click();
                              URL.revokeObjectURL(url);
                            } catch {
                              window.open(look.imageUrl, "_blank");
                            }
                          }}
                          className="w-full flex items-center justify-center gap-2 py-[9px] rounded-full text-[0.78rem] font-bold text-white border border-white/30 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all cursor-pointer"
                        >
                          ⬇ Татаж авах
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Loading placeholders */}
                  {generatingLooks && generatedLooks.length === 0 && (
                    [...Array(2)].map((_, i) => (
                      <div key={i} className="rounded-[16px] bg-[rgba(147,51,234,0.06)] animate-pulse border border-[rgba(147,51,234,0.1)]" style={{ aspectRatio: "3/4" }}>
                        <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                          <div className="w-10 h-10 rounded-full border-2 border-[rgba(147,51,234,0.2)] border-t-[#9333ea] animate-spin" />
                          <p className="text-[0.75rem] text-[#9333ea] font-medium">AI үүсгэж байна...</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 flex-wrap">
              <button onClick={() => setStep("occasion")}
                className="flex-1 min-w-[120px] py-[13px] bg-[rgba(147,51,234,0.08)] border border-[rgba(147,51,234,0.2)] rounded-full font-bold text-[0.87rem] text-[#9333ea] cursor-pointer">
                Дахин шинжлэх
              </button>
              <button onClick={resetToUpload}
                className="flex-1 min-w-[120px] py-[13px] bg-transparent border border-[rgba(0,0,0,0.1)] rounded-full font-semibold text-[0.87rem] text-[#6e6e73] cursor-pointer">
                Шинэ зураг
              </button>
            </div>
                  {result?.analysisId && (
                <ShareButton url={`${appUrl}/results/${result.analysisId}`} />
              )}
          </div>
        )}
      </div>

      {/* ── Leaderboard consent modal ── */}
      {showLbConsent && (
        <LeaderboardConsent
          lookScore={result?.analysis?.lookmaxScore ? Math.round(result.analysis.lookmaxScore * 10 * 1000) / 1000 : 0}
          looks={generatedLooks}
          username={user?.username ?? null}
          onClose={() => setShowLbConsent(false)}
        />
      )}

      {/* ── Pro upgrade QPay modal ── */}
      {(proPayState === "waiting" || proPayState === "success") && proInvoice && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 pt-[72px]"
          onClick={(e) => { if (e.target === e.currentTarget && proPayState !== "success") setProPayState("idle"); }}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[4px]" />
          <div className="relative z-[1] w-full max-w-[400px] bg-white rounded-[24px] shadow-[0_24px_64px_rgba(0,0,0,0.18)] overflow-hidden flex flex-col max-h-[calc(100vh-88px)] anim-scale-in">

            {proPayState === "success" ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-[rgba(22,163,74,0.1)] border-2 border-[rgba(22,163,74,0.2)] flex items-center justify-center mx-auto mb-4">
                  <span className="text-[2rem]">✅</span>
                </div>
                <p className="text-[1.2rem] font-extrabold text-[#1c1c1e] mb-2">Pro идэвхжлээ!</p>
                <p className="text-[0.88rem] text-[#6e6e73] mb-1">Сард 40 шинжилгээ + AI Look зурагнууд.</p>
                <p className="text-[0.8rem] text-[#aeaeb2]">Нүүр хуудас руу шилжиж байна...</p>
              </div>
            ) : (
              <>
                {/* Fixed top */}
                <div className="px-6 pt-6 pb-4 text-center shrink-0">
                  <button onClick={() => setProPayState("idle")}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[rgba(0,0,0,0.06)] flex items-center justify-center text-[#6e6e73] cursor-pointer border-none text-[1.1rem] hover:bg-[rgba(0,0,0,0.1)] transition-all leading-none">
                    ×
                  </button>
                  <p className="label-style mb-2">Pro захиалга — Upgrade</p>
                  <p className="text-[2rem] font-extrabold text-[#1c1c1e] mb-1 tracking-[-0.02em]">{proInvoice.amount.toLocaleString()}₮</p>
                  <p className="text-[0.82rem] text-[#8e8e93]">Сард 40 шинжилгээ + AI Look зурагнууд</p>
                  {upgradeInfo?.isUpgrade && (
                    <p className="text-[0.72rem] font-semibold text-[#9333ea] mt-1">
                      -{upgradeInfo.discount.toLocaleString()}₮ хөнгөлөлт агуулсан
                    </p>
                  )}
                  {proInvoice.qrImage && (
                    <div className="flex justify-center mt-4">
                      <div className="bg-white p-3 rounded-[18px] border border-[rgba(0,0,0,0.07)] shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={`data:image/png;base64,${proInvoice.qrImage}`} alt="QPay QR" width={160} height={160} className="rounded-lg block" />
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 justify-center mt-4">
                    {[0,1,2].map((i) => (
                      <span key={i} className="animate-dot-blink w-[5px] h-[5px] rounded-full bg-[#9333ea]-block" style={{ animationDelay: `${i*0.2}s` }} />
                    ))}
                    <span className="text-[0.8rem] text-[#8e8e93]">Төлбөр хүлээж байна...</span>
                  </div>
                </div>

                {/* Scrollable bank list */}
                {proInvoice.urls && proInvoice.urls.length > 0 && (
                  <div className="border-t border-[rgba(0,0,0,0.06)] px-4 py-3 overflow-y-auto flex-1">
                    <p className="label-style mb-2 text-center">Банкны апп-аар төлөх</p>
                    <div className="grid grid-cols-3 gap-2">
                      {proInvoice.urls.map((u: QPayUrl) => (
                        <a key={u.name} href={u.link} target="_blank" rel="noopener noreferrer"
                          className="flex flex-col items-center gap-1 px-2 py-2 rounded-xl bg-[#f5f5f7] border border-[rgba(0,0,0,0.06)] hover:bg-[rgba(147,51,234,0.04)] hover:border-[rgba(147,51,234,0.2)] transition-all">
                          {u.logo
                            ? <img src={u.logo} alt={u.name} width={32} height={32} className="rounded-[8px] object-contain" />
                            : <div className="w-8 h-8 rounded-[8px] bg-[rgba(0,0,0,0.06)]" />}
                          <span className="text-[0.62rem] text-[#3a3a3c] text-center font-medium leading-tight overflow-hidden" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>{u.name}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
    </>
  );
}
