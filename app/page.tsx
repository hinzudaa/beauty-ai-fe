import Link from "next/link";
import UploadHero from "@/components/UploadHero";
import { getPrices } from "@/apis/prices";

function ScanDot({ x, y, delay = "0s" }: { x: string; y: string; delay?: string }) {
  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: x, top: y }}>
      <div className="w-[7px] h-[7px] rounded-full bg-[#64dcff] shadow-[0_0_8px_#64dcff] relative">
        <div
          className="absolute inset-0 rounded-full bg-[rgba(100,220,255,0.4)]"
          style={{ animation: `dot-ping 1.6s ease-out ${delay} infinite` }}
        />
      </div>
    </div>
  );
}

function HairCard({ label, isFirst, src, delay = "0ms" }: {
  label: string; isFirst?: boolean; src: string; delay?: string;
}) {
  return (
    <div
      className="anim-scale-in relative rounded-[14px] overflow-hidden bg-[#1a1a2e] flex-1 min-w-[80px] md:min-w-0"
      style={{ animationDelay: delay }}
    >
      <div className="aspect-[3/4]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={label} className="w-full h-full object-cover block" />
      </div>
      {isFirst && (
        <div
          className="absolute top-[7px] right-[7px] rounded-full px-[9px] py-[3px]"
          style={{ background: "linear-gradient(135deg,#9333ea,#7c3aed)" }}
        >
          <span className="text-[0.58rem] font-bold text-white">Best ✦</span>
        </div>
      )}
      <div
        className="absolute bottom-0 left-0 right-0 px-2 pb-[9px] pt-[18px]"
        style={{ background: "linear-gradient(to top,rgba(0,0,0,0.8),transparent)" }}
      >
        <p className="text-[0.6rem] font-bold text-white text-center">{label}</p>
      </div>
    </div>
  );
}

function PricingCard({ name, price, tag, features, cta, href, highlight = false, animDelay = "0ms" }: {
  name: string; price: string; tag: string; features: string[];
  cta: string; href: string; highlight?: boolean; animDelay?: string;
}) {
  return (
    <div
      className={`anim-fade-up ${highlight ? "pricing-card-pro" : "pricing-card-basic"} rounded-[24px] flex flex-col gap-[22px] relative overflow-hidden`}
      style={{
        animationDelay: animDelay,
        background: highlight ? "#1c1c1e" : "#fff",
        border: highlight ? "none" : "1px solid rgba(0,0,0,0.08)",
        boxShadow: highlight ? "0 20px 60px rgba(28,28,30,0.22)" : "0 2px 16px rgba(0,0,0,0.05)",
        padding: "32px 28px",
      }}
    >
      {highlight && (
        <>
          <div
            className="absolute top-0 left-0 right-0 h-[3px]"
            style={{ background: "linear-gradient(90deg,#9333ea,#c084fc,#7c3aed)", backgroundSize: "200%", animation: "gradient-x 3s ease infinite" }}
          />
          <div
            className="absolute -top-[60px] -right-[60px] w-[200px] h-[200px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle,rgba(147,51,234,0.15),transparent 70%)" }}
          />
        </>
      )}

      <div>
        <div className="flex items-start justify-between mb-[18px] gap-2">
          <span className={`text-[0.72rem] font-bold tracking-[0.1em] uppercase ${highlight ? "text-[rgba(255,255,255,0.45)]" : "text-[#8e8e93]"}`}>
            {name}
          </span>
          {highlight && (
            <span className="text-[0.6rem] font-bold tracking-[0.06em] uppercase text-[#c084fc] bg-[rgba(192,132,252,0.12)] border border-[rgba(192,132,252,0.28)] rounded-full px-[10px] py-[3px] whitespace-nowrap shrink-0">
              Хамгийн алдартай
            </span>
          )}
        </div>
        <p className={`text-[2.8rem] font-extrabold tracking-[-0.04em] leading-none mb-1 ${highlight ? "text-white" : "text-[#1c1c1e]"}`}>
          ₮{price}
        </p>
        <p className={`text-[0.84rem] ${highlight ? "text-[rgba(255,255,255,0.38)]" : "text-[#8e8e93]"}`}>{tag}</p>
      </div>

      <div className={`h-px ${highlight ? "bg-[rgba(255,255,255,0.08)]" : "bg-[rgba(0,0,0,0.06)]"}`} />

      <ul className="list-none p-0 flex flex-col gap-[11px]">
        {features.map((f, i) => (
          <li key={i} className={`flex gap-[10px] text-[0.86rem] leading-[1.45] ${highlight ? "text-[rgba(255,255,255,0.78)]" : "text-[#3a3a3c]"}`}>
            <span className={`shrink-0 font-bold ${highlight ? "text-[#c084fc]" : "text-[#9333ea]"}`}>✓</span>{f}
          </li>
        ))}
      </ul>

      <Link
        href={href}
        className="block text-center rounded-full py-[14px] font-bold text-[0.9rem] transition-all duration-200 mt-auto"
        style={{
          background: highlight ? "linear-gradient(135deg,#9333ea,#7c3aed)" : "transparent",
          color: highlight ? "#fff" : "#1c1c1e",
          border: highlight ? "none" : "1.5px solid rgba(0,0,0,0.14)",
          boxShadow: highlight ? "0 4px 20px rgba(147,51,234,0.4)" : "none",
        }}
      >
        {cta}
      </Link>
    </div>
  );
}

export default async function Home() {
  const { basicPrice, proPrice } = await getPrices();
  return (
    <div className="bg-[#f2f2f7] min-h-screen">

      {/* Ambient blobs */}
      <div aria-hidden className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="anim-fade-in delay-0 absolute -top-[25%] -left-[15%] w-[60vw] h-[60vw] rounded-full"
          style={{ background: "radial-gradient(circle,rgba(167,139,250,0.14),transparent 68%)", filter: "blur(56px)" }} />
        <div className="anim-fade-in delay-300 absolute top-[30%] -right-[12%] w-[45vw] h-[45vw] rounded-full"
          style={{ background: "radial-gradient(circle,rgba(192,132,252,0.1),transparent 68%)", filter: "blur(56px)" }} />
        <div className="anim-fade-in delay-600 absolute -bottom-[5%] left-[25%] w-[50vw] h-[35vw] rounded-full"
          style={{ background: "radial-gradient(circle,rgba(139,92,246,0.09),transparent 68%)", filter: "blur(64px)" }} />
      </div>

      <div className="relative z-[1]">

        {/* ══ HERO ══════════════════════════════════════════ */}
        <section className="max-w-[1200px] mx-auto px-5 md:px-12 lg:px-20 pt-[60px] pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[52px] items-start">

            {/* Left */}
            <div>
              <div className="anim-fade-up delay-0 mb-6">
                <span className="text-[0.68rem] font-bold tracking-[0.1em] uppercase text-[#9333ea] inline-flex items-center gap-[7px] px-[14px] py-[6px] rounded-full bg-[rgba(147,51,234,0.08)] border border-[rgba(147,51,234,0.2)]">
                  <div className="animate-dot-blink w-[5px] h-[5px] rounded-full bg-[#9333ea]" />
                  Монголд анхных · 2026
                </span>
              </div>

              <h1 className="anim-fade-up delay-150 text-[clamp(1.5rem,3.2vw,2.5rem)] font-bold leading-[1.22] tracking-[-0.025em] text-[#3a3a3c] mb-7">
                Looka -Таны өдөр тутмын
                <br />
                <span className="animated-gradient-text font-extrabold">хувийн стилист </span>
              </h1>

              <div className="anim-fade-up delay-200 flex flex-col gap-4 mb-8">
                <p className="text-[0.95rem] font-medium leading-[1.8] text-[#3a3a3c]">
                  Монгол хүний нүүр, биеийн онцлог, физиологид тохируулан таны нүүрний хэлбэр болон гоо зүйн ерөнхий анализийг хийж, хувийн стильд тохирсон үр дүнг гаргана.
                </p>
                <p className="text-[0.9rem] leading-[1.8] text-[#6e6e73]">
                  Дэвшилтэт хиймэл оюун ухаанд суурилсан энэхүү технологи нь таны нүүр болон бие дээр үс засалт, нүүр будалт, хувцаслалтын өөр өөр хувилбаруудыг AI-generated зураг хэлбэрээр харуулж, танд хамгийн тохирох look-ийг санал болгоно.
                </p>
                <p className="text-[0.9rem] leading-[1.8] text-[#6e6e73]">
                  Мөн сонгосон стиль бүр дээр тохирох бүтээгдэхүүн, худалдан авах боломжтой линкүүд болон зөвлөмжүүдийг нэг дороос авах боломжтой.
                </p>
              </div>

              {/* Feature pills */}
              <div className="anim-fade-up delay-300 flex flex-wrap gap-2">
                {["Нүүрний шинжилгээ", "Үс засал", "Нүүр будалт", "Хувцаслалт", "Бүтээгдэхүүн зөвлөмж"].map((l, i) => (
                  <span
                    key={l}
                    className="anim-scale-in text-[0.78rem] font-semibold text-[#6e6e73] bg-white border border-[rgba(0,0,0,0.08)] rounded-full px-[14px] py-[6px] shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
                    style={{ animationDelay: `${300 + i * 60}ms` }}
                  >
                    {l}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — Upload */}
            <div className="anim-scale-in delay-200">
              <UploadHero />
            </div>
          </div>
        </section>

        {/* ══ AI SHOWCASE BANNER ════════════════════════════ */}
        <section className="anim-fade-up delay-400 max-w-[1200px] mx-auto px-5 md:px-12 lg:px-20 pb-[72px]">
          <div
            className="rounded-[28px] overflow-hidden bg-[#0d0d18] relative"
            style={{ boxShadow: "0 8px 56px rgba(0,0,0,0.22)" }}
          >
            {/* top gradient bar */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ background: "linear-gradient(90deg,transparent,#9333ea,#c084fc,#7c3aed,transparent)", animation: "gradient-x 3s ease infinite", backgroundSize: "200%" }}
            />

            {/* Banner header */}
            <div className="px-7 py-[22px] border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-[10px]">
                <div className="w-[7px] h-[7px] rounded-full bg-[#64dcff] shadow-[0_0_8px_#64dcff] relative">
                  <div className="absolute inset-0 rounded-full bg-[rgba(100,220,255,0.4)]"
                    style={{ animation: "dot-ping 1.6s ease-out infinite" }} />
                </div>
                <span className="text-[0.7rem] font-bold tracking-[0.12em] uppercase text-[rgba(255,255,255,0.5)]">AI Vision · Live Analysis</span>
              </div>
              <span className="text-[0.7rem] font-semibold text-[rgba(255,255,255,0.25)] tracking-[0.08em] uppercase">Demo preview</span>
            </div>

            {/* Showcase content — stacks on mobile, side-by-side on md+ */}
            <div className="p-4 md:p-[24px_28px_28px] flex flex-col md:flex-row gap-4 md:gap-5 items-stretch">

              {/* Left — face scan: full width on mobile, fixed 180px on md+ */}
              <div className="anim-scale-in delay-500 relative rounded-[18px] overflow-hidden bg-[#111122] w-full md:w-[180px] md:shrink-0 lg:w-[220px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://res.cloudinary.com/dvbjtnaks/image/upload/v1780543684/original2_hpoiae.jpg"
                  alt="Face scan"
                  className="w-full object-cover block opacity-85 aspect-[4/3] md:aspect-[3/4]"
                />

                {/* Scan overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="scan-line" />
                  <div className="absolute top-[43%] left-[8%] right-[8%] h-px bg-[rgba(100,220,255,0.35)]" />
                  <div className="absolute left-1/2 top-[12%] bottom-[12%] w-px bg-[rgba(100,220,255,0.35)] -translate-x-1/2" />
                  {([
                    { l:"9%",  t:"11%", h:"top-0 left-0",       v:"top-0 left-0"       }, // ┌ top-left
                    { l:"81%", t:"11%", h:"top-0 left-[-11px]",  v:"top-0 left-0"       }, // ┐ top-right
                    { l:"9%",  t:"81%", h:"top-0 left-0",        v:"top-[-11px] left-0" }, // └ bottom-left
                    { l:"81%", t:"81%", h:"top-0 left-[-11px]",  v:"top-[-11px] left-0" }, // ┘ bottom-right
                  ] as const).map(({ l, t, h, v }, i) => (
                    <div key={i} className="absolute" style={{ left: l, top: t }}>
                      <div className={`absolute w-[11px] h-[2px] bg-[#64dcff] ${h}`} />
                      <div className={`absolute w-[2px] h-[11px] bg-[#64dcff] ${v}`} />
                    </div>
                  ))}
                  <ScanDot x="50%" y="28%" delay="0s" />
                  <ScanDot x="33%" y="40%" delay="0.2s" />
                  <ScanDot x="67%" y="40%" delay="0.4s" />
                  <ScanDot x="42%" y="52%" delay="0.6s" />
                  <ScanDot x="58%" y="52%" delay="0.8s" />
                  <ScanDot x="50%" y="61%" delay="1s" />
                  <ScanDot x="35%" y="70%" delay="0.3s" />
                  <ScanDot x="65%" y="70%" delay="0.7s" />
                </div>

                <div className="absolute bottom-3 left-3 bg-[rgba(0,0,0,0.72)] backdrop-blur-[8px] rounded-[9px] px-[11px] py-[5px] flex items-center gap-[6px]">
                  <div className="animate-dot-blink w-[5px] h-[5px] rounded-full bg-[#64dcff]" />
                  <span className="text-[0.62rem] font-bold text-white tracking-[0.08em]">SCANNING</span>
                </div>
                <div className="absolute top-[10px] right-[10px] bg-[rgba(100,220,255,0.12)] border border-[rgba(100,220,255,0.35)] rounded-[7px] px-[9px] py-[3px]">
                  <span className="text-[0.58rem] font-bold text-[#64dcff] tracking-[0.06em]">BEFORE</span>
                </div>
              </div>

              {/* Right — 5 hair results */}
              <div className="flex-1 min-w-0 flex flex-col gap-[14px]">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[0.7rem] font-bold tracking-[0.1em] uppercase text-[rgba(255,255,255,0.38)]">
                    AI санал болгосон look-ууд
                  </p>
                  <span className="text-[0.66rem] font-semibold text-[#9333ea] bg-[rgba(147,51,234,0.15)] border border-[rgba(147,51,234,0.28)] rounded-full px-[10px] py-[3px] shrink-0">
                    5 хувилбар
                  </span>
                </div>

                {/* Horizontally scrollable on mobile, flex-wrap on desktop */}
                <div className="flex gap-[9px] overflow-x-auto pb-1 md:overflow-hidden md:flex-nowrap">
                  <HairCard label="Short bob" isFirst delay="500ms" src="https://res.cloudinary.com/dvbjtnaks/image/upload/v1780543684/shortbob_dwmyht.jpg" />
                  <HairCard label="Wavy lob"  delay="580ms"        src="https://res.cloudinary.com/dvbjtnaks/image/upload/v1780543688/wavylob_hssboa.jpg"  />
                  <HairCard label="Updo"      delay="660ms"        src="https://res.cloudinary.com/dvbjtnaks/image/upload/v1780543686/updo_mfnbp7.jpg"     />
                  <HairCard label="Straight"  delay="740ms"        src="https://res.cloudinary.com/dvbjtnaks/image/upload/v1780543685/straight_nofrmt.jpg" />
                  <HairCard label="Braided"   delay="820ms"        src="https://res.cloudinary.com/dvbjtnaks/image/upload/v1780543685/braided_yf0lre.jpg"  />
                </div>

                <div className="anim-fade-in delay-700 flex flex-wrap gap-[7px]">
                  {[
                    { label: "Oval нүүр",      color: "#9333ea" },
                    { label: "Warm undertone", color: "#d97706" },
                    { label: "Classic style",  color: "#059669" },
                    { label: "Medium depth",   color: "#2563eb" },
                  ].map((c) => (
                    <span
                      key={c.label}
                      className="text-[0.71rem] font-semibold rounded-full px-3 py-1"
                      style={{ color: c.color, background: `${c.color}18`, border: `1px solid ${c.color}30` }}
                    >
                      {c.label}
                    </span>
                  ))}
                </div>

                <div className="anim-fade-in delay-800 flex items-center gap-[14px] mt-1 flex-wrap">
                  <Link
                    href="/analyze"
                    className="text-[0.86rem] font-bold text-[#9333ea] bg-[rgba(147,51,234,0.12)] border border-[rgba(147,51,234,0.22)] rounded-full px-[22px] py-[10px]"
                  >
                    Өөрийн look авах →
                  </Link>
                  <p className="text-[0.76rem] text-[rgba(255,255,255,0.28)]">
                    Зургаа оруулаад 30 сек-д үр дүн авна
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ PRICING ══════════════════════════════════════ */}
        <section className="max-w-[1200px] mx-auto px-5 md:px-12 lg:px-20 pb-20">

          <div className="anim-fade-up delay-0 text-center mb-12">
            <p className="label-style mb-[14px]">Үнийн санал</p>
            <h2 className="text-[clamp(1.9rem,4vw,2.8rem)] tracking-[-0.03em] leading-[1.1] mb-4">
              Хэрэгцээндээ тохирсон<br />багцаа сонгоорой
            </h2>
            <p className="text-[0.95rem] text-[#6e6e73] leading-[1.75]">
              Нүүр · Үс & Грим · Хувцас — нэг дор. Хэрэгцээндээ тохирсон багцаа сонгоно уу.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px] max-w-[820px] mx-auto">
            <PricingCard
              name="Basic" price={basicPrice.toLocaleString()} tag="/ сар"
              href="/analyze?plan=basic" cta="Basic захиалах →" animDelay="100ms"
              features={[
                "Сард 20 шинжилгээ",
                "Нүүр · Үс & Грим · Хувцас — нэг дор",
                "Бүрэн AI нүүрний шинжилгээ",
                "Үс засал & грим зөвлөмж",
                "Хувцас хослол санал болгох",
                "Өнгөний палет & персональ зөвлөмж",
              ]}
            />
            <PricingCard
              name="Pro" price={proPrice.toLocaleString()} tag="/ сар"
              href="/analyze?plan=pro" cta="Pro захиалах →" highlight animDelay="200ms"
              features={[
                "Сард 40 шинжилгээ",
                "AI Personal Stylist Chat",
                "Бүх Basic боломжууд",
                "Хамгийн өндөр нарийвчлал",
              ]}
            />
          </div>

          <div className="anim-fade-in delay-500 text-center mt-7">
            <p className="text-[0.82rem] text-[#aeaeb2]">
              Нэвтэрч орсны дараа · Дурдсан үед цуцлах боломжтой
            </p>
          </div>
        </section>

        {/* ══ FOOTER STATS ════════════════════════════════ */}
        <div className="max-w-[1200px] mx-auto px-5 md:px-12 lg:px-20 pb-14">
          <div
            className="anim-fade-up delay-200 rounded-[22px] border border-[rgba(255,255,255,0.95)] px-7 py-[22px] flex flex-wrap items-center justify-between gap-4"
            style={{
              background: "rgba(255,255,255,0.78)",
              backdropFilter: "blur(24px) saturate(1.6)",
              WebkitBackdropFilter: "blur(24px) saturate(1.6)",
              boxShadow: "0 1px 0 rgba(255,255,255,0.9) inset, 0 4px 24px rgba(0,0,0,0.06)",
            }}
          >
            <div className="flex gap-8 flex-wrap">
              {[
                { num: "500+", label: "Хэрэглэгч" },
                { num: "2",    label: "Багц сонголт" },
                { num: "4",    label: "AI функц" },
                { num: "30s",  label: "Үр дүн авах хугацаа" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-[1.45rem] font-extrabold tracking-[-0.02em] text-[#1c1c1e]">{s.num}</p>
                  <p className="label-style mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
            <p className="text-[0.74rem] text-[#c7c7cc]">© 2026 Looka · Монгол</p>
          </div>
        </div>

      </div>
    </div>
  );
}
