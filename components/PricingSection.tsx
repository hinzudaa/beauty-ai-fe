"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { tokenStore } from "@/utils/request";
import { getProfile } from "@/apis/profile";
import {
  createSubscriptionInvoice,
  checkPayment,
  getUpgradePrice,
  InvoiceResponse,
  QPayUrl,
  UpgradePrice,
} from "@/apis/payment";

type SubState  = "loading" | "no-auth" | "no-sub" | "basic" | "pro";
type PayState  = "idle" | "creating" | "waiting" | "success";

interface Props { basicPrice: number; proPrice: number; }

const BASIC_FEATURES = [
  "Сард 20 шинжилгээ",
  "Нүүр · Үс & Грим · Хувцас — нэг дор",
  "Бүрэн AI дүн шинжилгээ",
  "Өнгөний палет & зөвлөмж",
  "Хувцас хослол санал болгох",
];

const PRO_FEATURES = [
  "Сард 40 шинжилгээ",
  "AI Look зурагнууд (gpt-image-1)",
  "AI Personal Stylist Chat",
  "Бүх Basic боломжууд",
  "Хамгийн өндөр нарийвчлал",
];

export default function PricingSection({ basicPrice, proPrice }: Props) {
  // Lazy init: skip "loading" entirely if no token
  const [subState,    setSubState]    = useState<SubState>(() =>
    tokenStore.get() ? "loading" : "no-auth"
  );
  const [upgradeInfo, setUpgradeInfo] = useState<UpgradePrice | null>(null);
  const [payState,     setPayState]     = useState<PayState>("idle");
  const [invoice,      setInvoice]      = useState<InvoiceResponse | null>(null);
  const [activePlan,   setActivePlan]   = useState<"basic" | "pro" | null>(null);
  const [payError,     setPayError]     = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Check current subscription
  useEffect(() => {
    // No token → already "no-auth" via lazy init; skip async call
    if (!tokenStore.get()) return;
    getProfile()
      .then((p) => {
        const plan = p.subscription?.status === "active" ? p.subscription.plan : null;
        setSubState(plan ?? "no-sub");
        if (plan === "basic") {
          getUpgradePrice("pro").then(setUpgradeInfo).catch(() => {});
        }
      })
      .catch(() => setSubState("no-sub"));
  }, []);

  // Cleanup poll on unmount
  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  async function handleSubscribe(plan: "basic" | "pro") {
    if (!tokenStore.get()) {
      window.location.href = `/login?next=${encodeURIComponent(`/?plan=${plan}`)}`;
      return;
    }
    setPayError(null);
    setActivePlan(plan);
    setPayState("creating");

    try {
      const inv = await createSubscriptionInvoice(plan);
      setInvoice(inv);
      setPayState("waiting");

      // Start polling
      pollRef.current = setInterval(async () => {
        try {
          const s = await checkPayment(inv.invoiceId);
          if (s.paid) {
            clearInterval(pollRef.current!);
            setPayState("success");
            // Refresh subscription state
            getProfile()
              .then((p) => {
                const newPlan = p.subscription?.status === "active" ? p.subscription.plan : null;
                setSubState(newPlan ?? "no-sub");
              })
              .catch(() => {});
          }
        } catch { /* keep polling */ }
      }, 3000);

      // Timeout after 15 min
      setTimeout(() => {
        if (pollRef.current) clearInterval(pollRef.current);
        setPayState((s) => s === "waiting" ? "idle" : s);
      }, 15 * 60 * 1000);
    } catch (err) {
      setPayState("idle");
      setPayError(err instanceof Error ? err.message : "Алдаа гарлаа");
    }
  }

  function cancelPayment() {
    if (pollRef.current) clearInterval(pollRef.current);
    setPayState("idle"); setInvoice(null); setActivePlan(null); setPayError(null);
  }

  const isBasic = subState === "basic";
  const isPro   = subState === "pro";

  return (
    <div className="flex flex-col gap-5">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px] max-w-[820px] mx-auto w-full">

        {/* ── BASIC CARD ── */}
        <div className="anim-fade-up pricing-card-basic rounded-[24px] flex flex-col gap-[22px] relative overflow-hidden"
          style={{
            animationDelay: "100ms",
            background:     isBasic ? "rgba(59,130,246,0.04)" : "#fff",
            border:         isBasic ? "1.5px solid rgba(59,130,246,0.3)" : "1px solid rgba(0,0,0,0.08)",
            boxShadow:      "0 2px 16px rgba(0,0,0,0.05)",
            padding:        "32px 28px",
          }}>
          <div>
            <div className="flex items-start justify-between mb-[18px] gap-2">
              <span className="text-[0.72rem] font-bold tracking-[0.1em] uppercase text-[#8e8e93]">Basic</span>
              {isBasic && <span className="text-[0.6rem] font-bold text-[#3b82f6] bg-[rgba(59,130,246,0.1)] border border-[rgba(59,130,246,0.25)] rounded-full px-[10px] py-[3px]">Одоогийн багц ✓</span>}
            </div>
            <p className="text-[2.8rem] font-extrabold tracking-[-0.04em] leading-none mb-1 text-[#1c1c1e]">₮{basicPrice.toLocaleString()}</p>
            <p className="text-[0.84rem] text-[#8e8e93]">/ сар</p>
          </div>
          <div className="h-px bg-[rgba(0,0,0,0.06)]" />
          <ul className="list-none p-0 flex flex-col gap-[11px]">
            {BASIC_FEATURES.map((f) => (
              <li key={f} className="flex gap-[10px] text-[0.86rem] leading-[1.45] text-[#3a3a3c]">
                <span className="shrink-0 font-bold text-[#3b82f6]">✓</span>{f}
              </li>
            ))}
          </ul>
          {isBasic ? (
            <div className="mt-auto text-center py-[14px] rounded-full text-[0.9rem] font-bold text-[#3b82f6] bg-[rgba(59,130,246,0.07)] border border-[rgba(59,130,246,0.2)]">Basic идэвхтэй</div>
          ) : isPro ? (
            <div className="mt-auto text-center py-[14px] rounded-full text-[0.84rem] text-[#aeaeb2] border border-[rgba(0,0,0,0.08)]">Одоо Pro ашиглаж байна</div>
          ) : (
            <button onClick={() => handleSubscribe("basic")} disabled={payState !== "idle"}
              className="mt-auto block w-full text-center rounded-full py-[14px] font-bold text-[0.9rem] transition-all cursor-pointer border-none"
              style={{ background: "transparent", color: "#1c1c1e", border: "1.5px solid rgba(0,0,0,0.14)", opacity: payState !== "idle" && activePlan !== "basic" ? 0.5 : 1 }}>
              {payState === "creating" && activePlan === "basic" ? "Үүсгэж байна..." : "Basic захиалах →"}
            </button>
          )}
        </div>

        {/* ── PRO CARD ── */}
        <div className="anim-fade-up pricing-card-pro rounded-[24px] flex flex-col gap-[22px] relative overflow-hidden"
          style={{
            animationDelay: "200ms",
            background:     "#1c1c1e",
            border:         "none",
            boxShadow:      isPro ? "0 0 0 2.5px #9333ea, 0 20px 60px rgba(28,28,30,0.22)" : "0 20px 60px rgba(28,28,30,0.22)",
            padding:        "32px 28px",
          }}>
          <div className="absolute top-0 left-0 right-0 h-[3px]"
            style={{ background: "linear-gradient(90deg,#9333ea,#c084fc,#7c3aed)", backgroundSize: "200%", animation: "gradient-x 3s ease infinite" }} />
          <div className="absolute -top-[60px] -right-[60px] w-[200px] h-[200px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle,rgba(147,51,234,0.15),transparent 70%)" }} />

          <div>
            <div className="flex items-start justify-between mb-[18px] gap-2">
              <span className="text-[0.72rem] font-bold tracking-[0.1em] uppercase text-[rgba(255,255,255,0.45)]">Pro</span>
              {isPro
                ? <span className="text-[0.6rem] font-bold text-[#c084fc] bg-[rgba(192,132,252,0.15)] border border-[rgba(192,132,252,0.3)] rounded-full px-[10px] py-[3px]">Одоогийн багц ✓</span>
                : <span className="text-[0.6rem] font-bold text-[#c084fc] bg-[rgba(192,132,252,0.12)] border border-[rgba(192,132,252,0.28)] rounded-full px-[10px] py-[3px] whitespace-nowrap">Хамгийн алдартай</span>}
            </div>
            {isBasic && upgradeInfo?.isUpgrade ? (
              <div>
                <div className="flex items-end gap-2 mb-1">
                  <p className="text-[2.8rem] font-extrabold tracking-[-0.04em] leading-none text-white">₮{upgradeInfo.amount.toLocaleString()}</p>
                  <p className="text-[1.1rem] line-through mb-1 text-[rgba(255,255,255,0.3)]">₮{proPrice.toLocaleString()}</p>
                </div>
                <p className="text-[0.72rem] font-semibold text-[#c084fc]">
                  -{upgradeInfo.discount.toLocaleString()}₮ хасагдсан · {upgradeInfo.remainingDays} өдрийн үлдэгдэл
                </p>
              </div>
            ) : (
              <>
                <p className="text-[2.8rem] font-extrabold tracking-[-0.04em] leading-none mb-1 text-white">₮{proPrice.toLocaleString()}</p>
                <p className="text-[0.84rem] text-[rgba(255,255,255,0.38)]">/ сар</p>
              </>
            )}
          </div>

          <div className="h-px bg-[rgba(255,255,255,0.08)]" />
          <ul className="list-none p-0 flex flex-col gap-[11px]">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex gap-[10px] text-[0.86rem] leading-[1.45] text-[rgba(255,255,255,0.78)]">
                <span className="shrink-0 font-bold text-[#c084fc]">✓</span>{f}
              </li>
            ))}
          </ul>

          {isPro ? (
            <div className="mt-auto text-center py-[14px] rounded-full text-[0.9rem] font-bold text-[#c084fc] bg-[rgba(192,132,252,0.1)] border border-[rgba(192,132,252,0.2)]">Pro идэвхтэй</div>
          ) : (
            <button onClick={() => handleSubscribe("pro")} disabled={payState !== "idle"}
              className="mt-auto block w-full text-center rounded-full py-[14px] font-bold text-[0.9rem] text-white transition-all cursor-pointer border-none"
              style={{
                background: "linear-gradient(135deg,#9333ea,#7c3aed)",
                boxShadow:  "0 4px 20px rgba(147,51,234,0.4)",
                opacity:    payState !== "idle" && activePlan !== "pro" ? 0.5 : 1,
              }}>
              {payState === "creating" && activePlan === "pro"
                ? "Үүсгэж байна..."
                : isBasic
                  ? `Upgrade хийх → ₮${(upgradeInfo?.amount ?? proPrice).toLocaleString()}`
                  : "Pro захиалах →"}
            </button>
          )}
        </div>
      </div>

      {payError && (
        <p className="text-center text-[0.82rem] text-[#ef4444]">{payError}</p>
      )}

      {/* ── QPay Modal ── */}
      {(payState === "waiting" || payState === "success") && invoice && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 pt-[72px]"
          onClick={(e) => { if (e.target === e.currentTarget && payState !== "success") cancelPayment(); }}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[4px]" />

          {/* Modal card — max-height with internal scroll */}
          <div className="relative z-[1] w-full max-w-[400px] bg-white rounded-[24px] shadow-[0_24px_64px_rgba(0,0,0,0.18)] overflow-hidden flex flex-col max-h-[calc(100vh-88px)] anim-scale-in">

            {payState === "success" ? (
              /* ── Success state ── */
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-[rgba(22,163,74,0.1)] border-2 border-[rgba(22,163,74,0.2)] flex items-center justify-center mx-auto mb-4">
                  <span className="text-[2rem]">✅</span>
                </div>
                <p className="text-[1.2rem] font-extrabold text-[#1c1c1e] mb-2">Төлбөр амжилттай!</p>
                <p className="text-[0.88rem] text-[#6e6e73] mb-6">
                  {activePlan === "pro"
                    ? "Pro захиалга идэвхжлээ. Сард 40 шинжилгээ + AI Look зурагнууд."
                    : "Basic захиалга идэвхжлээ. Сард 20 шинжилгээ."}
                </p>
                <Link href="/analyze"
                  className="block w-full py-[13px] rounded-full font-bold text-[0.92rem] text-white"
                  style={{ background: "linear-gradient(135deg,#9333ea,#7c3aed)", boxShadow: "0 4px 20px rgba(147,51,234,0.4)" }}>
                  Шинжилгээ хийх →
                </Link>
              </div>
            ) : (
              /* ── Waiting for payment ── */
              <>
                {/* Fixed header — amount + QR */}
                <div className="px-6 pt-6 pb-4 text-center shrink-0">
                  {/* Close */}
                  <button onClick={cancelPayment}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[rgba(0,0,0,0.06)] flex items-center justify-center text-[#6e6e73] cursor-pointer border-none text-[1.1rem] hover:bg-[rgba(0,0,0,0.1)] transition-all leading-none">
                    ×
                  </button>

                  <p className="label-style mb-2">QPay захиалгын төлбөр</p>
                  <p className="text-[2rem] font-extrabold text-[#1c1c1e] mb-1 tracking-[-0.02em]">
                    {invoice.amount.toLocaleString()}₮
                  </p>
                  <p className="text-[0.84rem] text-[#8e8e93]">
                    {activePlan === "pro"
                      ? (upgradeInfo?.isUpgrade ? "Pro upgrade" : "Pro · сард 40 шинжилгээ")
                      : "Basic · сард 20 шинжилгээ"}
                  </p>
                  {upgradeInfo?.isUpgrade && activePlan === "pro" && (
                    <p className="text-[0.72rem] font-semibold text-[#9333ea] mt-1">
                      -{upgradeInfo.discount.toLocaleString()}₮ хөнгөлөлт агуулсан
                    </p>
                  )}

                  {invoice.qrImage && (
                    <div className="flex justify-center mt-4">
                      <div className="bg-white p-3 rounded-[18px] border border-[rgba(0,0,0,0.07)] shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={`data:image/png;base64,${invoice.qrImage}`} alt="QPay QR" width={160} height={160} className="rounded-lg block" />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 justify-center mt-4">
                    {[0,1,2].map((i) => (
                      <span key={i} className="animate-dot-blink w-[5px] h-[5px] rounded-full bg-[#9333ea] inline-block" style={{ animationDelay: `${i*0.2}s` }} />
                    ))}
                    <span className="text-[0.8rem] text-[#8e8e93]">Төлбөр хүлээж байна...</span>
                  </div>
                </div>

                {/* Scrollable bank list */}
                {invoice.urls && invoice.urls.length > 0 && (
                  <div className="border-t border-[rgba(0,0,0,0.06)] px-4 py-3 overflow-y-auto flex-1">
                    <p className="label-style mb-2 text-center">Банкны апп-аар төлөх</p>
                    <div className="grid grid-cols-3 gap-2">
                      {invoice.urls.map((u: QPayUrl) => (
                        <a key={u.name} href={u.link} target="_blank" rel="noopener noreferrer"
                          className="flex flex-col items-center gap-1 px-2 py-2 rounded-xl bg-[#f5f5f7] border border-[rgba(0,0,0,0.06)] hover:bg-[rgba(147,51,234,0.04)] hover:border-[rgba(147,51,234,0.2)] transition-all">
                          {u.logo
                            ? <img src={u.logo} alt={u.name} width={32} height={32} className="rounded-[8px] object-contain" />
                            : <div className="w-8 h-8 rounded-[8px] bg-[rgba(0,0,0,0.06)]" />}
                          <span className="text-[0.62rem] text-[#3a3a3c] text-center font-medium leading-tight overflow-hidden" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{u.name}</span>
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
  );
}
