"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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

type SubState  = "loading" | "no-auth" | "no-sub" | "basic" | "standard" | "pro";
type PayState  = "idle" | "creating" | "waiting" | "success";

interface Props { basicPrice: number; standardPrice: number; proPrice: number; }

const PLAN_FEATURES = {
  basic: [
    "Сард 5 шинжилгээ",
    "Бүрэн AI looksmax шинжилгээ",
    "2 AI Look зураг",
    "Өнгөний палет & зөвлөмж",
  ],
  standard: [
    "Сард 10 шинжилгээ",
    "Бүрэн AI looksmax шинжилгээ",
    "3 AI Look зураг",
    "Өнгөний палет & зөвлөмж",
  ],
  pro: [
    "Сард 20 шинжилгээ",
    "5 AI Look зураг",
    "AI Personal Stylist Chat",
    "Бүх Basic боломжууд",
  ],
};

export default function PricingSection({ basicPrice, standardPrice, proPrice }: Props) {
  // Lazy init: skip "loading" entirely if no token
  const [subState,    setSubState]    = useState<SubState>(() =>
    tokenStore.get() ? "loading" : "no-auth"
  );
  // upgradeInfos[targetPlan] = pro-rated price to upgrade from current → target
  const [upgradeInfos, setUpgradeInfos] = useState<Partial<Record<"standard"|"pro", UpgradePrice>>>({});
  const [payState,     setPayState]     = useState<PayState>("idle");
  const [invoice,      setInvoice]      = useState<InvoiceResponse | null>(null);
  const [activePlan,   setActivePlan]   = useState<"basic" | "standard" | "pro" | null>(null);
  const [payError,     setPayError]     = useState<string | null>(null);
  const router  = useRouter();
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Check current subscription
  useEffect(() => {
    // No token → already "no-auth" via lazy init; skip async call
    if (!tokenStore.get()) return;
    getProfile()
      .then((p) => {
        const plan = p.subscription?.status === "active" ? p.subscription.plan : null;
        setSubState(plan ?? "no-sub");
        // Fetch upgrade prices for valid upgrade paths only
        if (plan === "basic") {
          // basic → standard and basic → pro
          Promise.allSettled([
            getUpgradePrice("standard"),
            getUpgradePrice("pro"),
          ]).then(([stdRes, proRes]) => {
            setUpgradeInfos({
              standard: stdRes.status === "fulfilled" ? stdRes.value : undefined,
              pro:      proRes.status === "fulfilled" ? proRes.value : undefined,
            });
          });
        } else if (plan === "standard") {
          // standard → pro only
          getUpgradePrice("pro")
            .then((info) => setUpgradeInfos({ pro: info }))
            .catch(() => {});
        }
      })
      .catch(() => setSubState("no-sub"));
  }, []);

  // Cleanup poll on unmount
  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  async function handleSubscribe(plan: "basic" | "standard" | "pro") {
    if (!tokenStore.get()) {
      router.push(`/login?next=${encodeURIComponent(`/?plan=${plan}`)}`);
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

      {/* 3-plan grid — Standard as decoy makes Pro look best value */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        {([
          { id: "basic"    as const, name: "Basic",    price: basicPrice,    color: "#3b82f6", dark: false },
          { id: "standard" as const, name: "Standard", price: standardPrice, color: "#6e6e73", dark: false },
          { id: "pro"      as const, name: "Pro",       price: proPrice,      color: "#9333ea", dark: true  },
        ]).map((plan, idx) => {
          const isCurrent = subState === plan.id;

          // Valid upgrade paths: basic→standard, basic→pro, standard→pro
          const UPGRADE_PATHS: Record<string, string[]> = {
            basic:    ["standard", "pro"],
            standard: ["pro"],
            pro:      [],
          };
          const canUpgrade = !isCurrent &&
            (subState === "loading" || subState === "no-auth" || subState === "no-sub"
              ? false
              : UPGRADE_PATHS[subState]?.includes(plan.id) ?? false);

          const upgradeInfo = upgradeInfos[plan.id as "standard" | "pro"];
          const showUpgrade = canUpgrade && upgradeInfo?.isUpgrade;
          // Downgrade = user has an active plan but target is lower tier
          const hasActivePlan = subState === "basic" || subState === "standard" || subState === "pro";
          const isDowngrade   = !isCurrent && !canUpgrade && hasActivePlan;

          const disabled = payState !== "idle" && activePlan !== plan.id;
          const creating = payState === "creating" && activePlan === plan.id;

          return (
            <div key={plan.id}
              className={`anim-fade-up rounded-[24px] flex flex-col gap-5 relative overflow-hidden`}
              style={{
                animationDelay: `${(idx + 1) * 100}ms`,
                background:     plan.dark ? "#1c1c1e" : isCurrent ? `${plan.color}06` : canUpgrade ? "#fff" : "#fff",
                border:         plan.dark ? "none" : isCurrent ? `1.5px solid ${plan.color}40` : canUpgrade ? "1px solid rgba(0,0,0,0.14)" : "1px solid rgba(0,0,0,0.08)",
                boxShadow:      plan.dark
                  ? isCurrent ? `0 0 0 2.5px ${plan.color}, 0 20px 60px rgba(28,28,30,0.22)` : "0 20px 60px rgba(28,28,30,0.22)"
                  : "0 2px 16px rgba(0,0,0,0.05)",
                padding: "28px 24px",
              }}>

              {/* Pro animated top bar */}
              {plan.dark && (
                <>
                  <div className="absolute top-0 left-0 right-0 h-[3px]"
                    style={{ background: "linear-gradient(90deg,#9333ea,#c084fc,#7c3aed)", backgroundSize: "200%", animation: "gradient-x 3s ease infinite" }} />
                  <div className="absolute -top-[60px] -right-[60px] w-[180px] h-[180px] rounded-full pointer-events-none"
                    style={{ background: "radial-gradient(circle,rgba(147,51,234,0.15),transparent 70%)" }} />
                </>
              )}

              {/* Header */}
              <div>
                <div className="flex items-start justify-between mb-3 gap-2">
                  <span className="text-[0.68rem] font-bold tracking-[0.1em] uppercase"
                    style={{ color: plan.dark ? "rgba(255,255,255,0.45)" : canUpgrade ? "#6e6e73" : "#8e8e93" }}>
                    {plan.name}
                  </span>
                  {isCurrent && (
                    <span className="text-[0.58rem] font-bold rounded-full px-[9px] py-[2px] whitespace-nowrap"
                      style={{ color: plan.color, background: `${plan.color}18`, border: `1px solid ${plan.color}30` }}>
                      Идэвхтэй ✓
                    </span>
                  )}
                  {!isCurrent && plan.dark && (
                    <span className="text-[0.58rem] font-bold text-[#c084fc] bg-[rgba(192,132,252,0.12)] border border-[rgba(192,132,252,0.28)] rounded-full px-[9px] py-[2px] whitespace-nowrap">
                      Хамгийн сайн
                    </span>
                  )}
                </div>

                {showUpgrade ? (
                  <div>
                    <div className="flex items-end gap-2 mb-1">
                      <p className="text-[2.4rem] font-extrabold tracking-[-0.04em] leading-none"
                        style={{ color: plan.dark ? "#fff" : "#1c1c1e" }}>₮{upgradeInfo!.amount.toLocaleString()}</p>
                      <p className="text-[1rem] line-through mb-0.5"
                        style={{ color: plan.dark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)" }}>₮{plan.price.toLocaleString()}</p>
                    </div>
                    <p className="text-[0.68rem] font-semibold"
                      style={{ color: plan.dark ? "#c084fc" : "#9333ea" }}>
                      -{upgradeInfo!.discount.toLocaleString()}₮ хасагдсан
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-[2.4rem] font-extrabold tracking-[-0.04em] leading-none mb-1"
                      style={{ color: plan.dark ? "#fff" : canUpgrade ? "#1c1c1e" : "#3a3a3c" }}>
                      ₮{plan.price.toLocaleString()}
                    </p>
                    <p className="text-[0.82rem]" style={{ color: plan.dark ? "rgba(255,255,255,0.38)" : "#8e8e93" }}>/ сар</p>
                  </>
                )}
              </div>

              <div className="h-px" style={{ background: plan.dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" }} />

              <ul className="list-none p-0 flex flex-col gap-[10px] flex-1">
                {PLAN_FEATURES[plan.id].map((f) => (
                  <li key={f} className="flex gap-[8px] text-[0.83rem] leading-[1.45]"
                    style={{ color: plan.dark ? "rgba(255,255,255,0.78)" : canUpgrade ? "#1c1c1e" : "#3a3a3c" }}>
                    <span className="shrink-0 font-bold"
                      style={{ color: plan.dark ? plan.color : canUpgrade ? plan.color === "#6e6e73" ? "#1c1c1e" : plan.color : plan.color }}>✓</span>{f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {isCurrent ? (
                <div className="text-center py-[12px] rounded-full text-[0.87rem] font-bold"
                  style={{ color: plan.color, background: `${plan.color}10`, border: `1px solid ${plan.color}25` }}>
                  {plan.name} идэвхтэй
                </div>
              ) : isDowngrade && (subState === "standard" || subState === "pro") ? (
                /* Downgrade path — disabled */
                <div className="text-center py-[12px] rounded-full text-[0.82rem] text-[#aeaeb2] border border-[rgba(0,0,0,0.08)]">
                  Боломжгүй
                </div>
              ) : (
                <button onClick={() => handleSubscribe(plan.id)} disabled={disabled}
                  className="block w-full text-center rounded-full py-[12px] font-bold text-[0.87rem] transition-all cursor-pointer border-none"
                  style={{
                    background: plan.dark ? "linear-gradient(135deg,#9333ea,#7c3aed)" : "transparent",
                    color:      plan.dark ? "#fff" : "#1c1c1e",
                    border:     plan.dark ? "none" : "1.5px solid rgba(0,0,0,0.14)",
                    boxShadow:  plan.dark ? "0 4px 20px rgba(147,51,234,0.4)" : "none",
                    opacity:    disabled ? 0.5 : 1,
                  }}>
                  {creating ? "Үүсгэж байна..."
                    : showUpgrade ? `Upgrade → ₮${upgradeInfo!.amount.toLocaleString()}`
                    : canUpgrade && upgradeInfo && !upgradeInfo.isUpgrade ? `${plan.name} руу шилжих →`
                    : `${plan.name} захиалах →`}
                </button>
              )}
            </div>
          );
        })}
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
                    ? "Pro идэвхжлээ. Сард 20 шинжилгээ · 5 AI look · AI Стилист чат."
                    : activePlan === "standard"
                    ? "Standard идэвхжлээ. Сард 10 шинжилгээ · 3 AI look."
                    : "Basic идэвхжлээ. Сард 5 шинжилгээ · 2 AI look."}
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
                    {activePlan === "pro" ? "Pro · сард 20 шинжилгээ · 5 AI look"
                      : activePlan === "standard" ? "Standard · сард 10 шинжилгээ · 3 AI look"
                      : "Basic · сард 5 шинжилгээ · 2 AI look"}
                  </p>
                  {activePlan && upgradeInfos[activePlan as "standard" | "pro"]?.isUpgrade && (
                    <p className="text-[0.72rem] font-semibold text-[#9333ea] mt-1">
                      -{upgradeInfos[activePlan as "standard" | "pro"]!.discount.toLocaleString()}₮ хөнгөлөлт агуулсан
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
