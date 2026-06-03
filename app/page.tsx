import Link from "next/link";
import UploadHero from "@/components/UploadHero";

const F = "var(--font-montserrat),'Helvetica Neue',Arial,sans-serif";

function ScanDot({ x, y, delay = "0s" }: { x: string; y: string; delay?: string }) {
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: "translate(-50%,-50%)" }}>
      <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#64dcff", boxShadow: "0 0 8px #64dcff", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(100,220,255,0.4)", animation: `dot-ping 1.6s ease-out ${delay} infinite` }} />
      </div>
    </div>
  );
}

function HairCard({ label, isFirst, videoSrc, delay = "0ms" }: { label: string; isFirst?: boolean; videoSrc: string; delay?: string }) {
  return (
    <div className="anim-scale-in" style={{ animationDelay: delay, position: "relative", borderRadius: 14, overflow: "hidden", background: "#1a1a2e", flex: "1 1 0", minWidth: 0 }}>
      <div style={{ aspectRatio: "3/4" }}>
        <video src={videoSrc} autoPlay muted loop playsInline style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      </div>
      {isFirst && (
        <div style={{ position: "absolute", top: 7, right: 7, background: "linear-gradient(135deg,#9333ea,#7c3aed)", borderRadius: 999, padding: "3px 9px" }}>
          <span style={{ fontFamily: F, fontSize: "0.58rem", fontWeight: 700, color: "#fff" }}>Best ✦</span>
        </div>
      )}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(to top,rgba(0,0,0,0.8),transparent)", padding: "18px 8px 9px" }}>
        <p style={{ fontFamily: F, fontSize: "0.6rem", fontWeight: 700, color: "#fff", margin: 0, textAlign: "center" }}>{label}</p>
      </div>
    </div>
  );
}

function PricingCard({ name, price, tag, features, cta, href, highlight = false, animDelay = "0ms" }: {
  name: string; price: string; tag: string; features: string[];
  cta: string; href: string; highlight?: boolean; animDelay?: string;
}) {
  return (
    <div className={`anim-fade-up ${highlight ? "pricing-card-pro" : "pricing-card-basic"}`}
      style={{
        animationDelay: animDelay,
        background: highlight ? "#1c1c1e" : "#fff",
        borderRadius: 24,
        border: highlight ? "none" : "1px solid rgba(0,0,0,0.08)",
        boxShadow: highlight ? "0 20px 60px rgba(28,28,30,0.22)" : "0 2px 16px rgba(0,0,0,0.05)",
        padding: "32px 28px",
        display: "flex", flexDirection: "column", gap: 22,
        position: "relative", overflow: "hidden",
        transition: "all 0.3s ease",
      }}>
      {highlight && (
        <>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg,#9333ea,#c084fc,#7c3aed)", backgroundSize: "200%", animation: "gradient-x 3s ease infinite" }} />
          {/* subtle glow orb */}
          <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle,rgba(147,51,234,0.15),transparent 70%)", pointerEvents: "none" }} />
        </>
      )}

      <div>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18, gap: 8 }}>
          <span style={{ fontFamily: F, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: highlight ? "rgba(255,255,255,0.45)" : "#8e8e93" }}>
            {name}
          </span>
          {highlight && (
            <span style={{ fontFamily: F, fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#c084fc", background: "rgba(192,132,252,0.12)", border: "1px solid rgba(192,132,252,0.28)", borderRadius: 999, padding: "3px 10px", whiteSpace: "nowrap", flexShrink: 0 }}>
              Хамгийн алдартай
            </span>
          )}
        </div>
        <p style={{ fontFamily: F, fontSize: "2.8rem", fontWeight: 800, letterSpacing: "-0.04em", color: highlight ? "#fff" : "#1c1c1e", margin: "0 0 4px", lineHeight: 1 }}>
          ₮{price}
        </p>
        <p style={{ fontFamily: F, fontSize: "0.84rem", color: highlight ? "rgba(255,255,255,0.38)" : "#8e8e93", margin: 0 }}>{tag}</p>
      </div>

      <div style={{ height: 1, background: highlight ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" }} />

      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 11 }}>
        {features.map((f, i) => (
          <li key={i} style={{ display: "flex", gap: 10, fontFamily: F, fontSize: "0.86rem", color: highlight ? "rgba(255,255,255,0.78)" : "#3a3a3c", lineHeight: 1.45 }}>
            <span style={{ color: highlight ? "#c084fc" : "#9333ea", flexShrink: 0, fontWeight: 700 }}>✓</span>{f}
          </li>
        ))}
      </ul>

      <Link href={href} style={{
        display: "block", textAlign: "center", borderRadius: 999,
        padding: "14px 0", fontFamily: F, fontWeight: 700, fontSize: "0.9rem",
        textDecoration: "none",
        background: highlight ? "linear-gradient(135deg,#9333ea,#7c3aed)" : "transparent",
        color: highlight ? "#fff" : "#1c1c1e",
        border: highlight ? "none" : "1.5px solid rgba(0,0,0,0.14)",
        boxShadow: highlight ? "0 4px 20px rgba(147,51,234,0.4)" : "none",
        transition: "all 0.2s",
      }}>
        {cta}
      </Link>
    </div>
  );
}

export default function Home() {
  return (
    <div style={{ background: "#f2f2f7", minHeight: "100vh" }}>

      {/* Ambient blobs */}
      <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div className="anim-fade-in delay-0" style={{ position: "absolute", top: "-25%", left: "-15%", width: "60vw", height: "60vw", borderRadius: "50%", background: "radial-gradient(circle,rgba(167,139,250,0.14),transparent 68%)", filter: "blur(56px)" }} />
        <div className="anim-fade-in delay-300" style={{ position: "absolute", top: "30%", right: "-12%", width: "45vw", height: "45vw", borderRadius: "50%", background: "radial-gradient(circle,rgba(192,132,252,0.1),transparent 68%)", filter: "blur(56px)" }} />
        <div className="anim-fade-in delay-600" style={{ position: "absolute", bottom: "-5%", left: "25%", width: "50vw", height: "35vw", borderRadius: "50%", background: "radial-gradient(circle,rgba(139,92,246,0.09),transparent 68%)", filter: "blur(64px)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ══ HERO ══════════════════════════════════════════ */}
        <section style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 20px 64px" }} className="md:px-12 lg:px-20">
          <div style={{ display: "grid", gap: 52, alignItems: "start" }} className="grid-cols-1 md:grid-cols-2">

            {/* Left */}
            <div>
              <div className="anim-fade-up delay-0" style={{ marginBottom: 24 }}>
                <span style={{ fontFamily: F, fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9333ea", display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 14px", borderRadius: 999, background: "rgba(147,51,234,0.08)", border: "1px solid rgba(147,51,234,0.2)" }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#9333ea" }} className="animate-dot-blink" />
                  Монголд анхных · 2026
                </span>
              </div>

              {/* Brand name */}
              <div className="anim-fade-up delay-100" style={{ marginBottom: 12 }}>
                <span style={{
                  fontFamily: F, fontSize: "clamp(3.6rem,7vw,5.8rem)", fontWeight: 800,
                  letterSpacing: "-0.055em", lineHeight: 0.95,
                  background: "linear-gradient(135deg,#1c1c1e 0%,#3a3a3c 50%,#1c1c1e 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                  display: "inline-block",
                }}>
                
                </span>
              </div>

              {/* Tagline */}
              <h1 className="anim-fade-up delay-150" style={{
                fontFamily: F, fontSize: "clamp(1.5rem,3.2vw,2.5rem)",
                fontWeight: 700, lineHeight: 1.22, letterSpacing: "-0.025em",
                color: "#3a3a3c", margin: "0 0 28px",
              }}>
                Looka -Таны өдөр тутмын
                <br />
                <span className="animated-gradient-text" style={{ fontWeight: 800 }}>хувийн стилист </span>
              </h1>

              {/* Long subtitle */}
              <div className="anim-fade-up delay-200" style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 32 }}>
                <p style={{ fontFamily: F, fontSize: "0.95rem", fontWeight: 500, lineHeight: 1.8, color: "#3a3a3c" }}>
                  Монгол хүний нүүр, биеийн онцлог, физиологид тохируулан таны нүүрний хэлбэр болон гоо зүйн ерөнхий анализийг хийж, хувийн стильд тохирсон үр дүнг гаргана.
                </p>
                <p style={{ fontFamily: F, fontSize: "0.9rem", fontWeight: 400, lineHeight: 1.8, color: "#6e6e73" }}>
                  Дэвшилтэт хиймэл оюун ухаанд суурилсан энэхүү технологи нь таны нүүр болон бие дээр үс засалт, нүүр будалт, хувцаслалтын өөр өөр хувилбаруудыг AI-generated зураг хэлбэрээр харуулж, танд хамгийн тохирох look-ийг санал болгоно.
                </p>
                <p style={{ fontFamily: F, fontSize: "0.9rem", fontWeight: 400, lineHeight: 1.8, color: "#6e6e73" }}>
                  Мөн сонгосон стиль бүр дээр тохирох бүтээгдэхүүн, худалдан авах боломжтой линкүүд болон зөвлөмжүүдийг нэг дороос авах боломжтой.
                </p>
              </div>

              {/* Feature pills */}
              <div className="anim-fade-up delay-300" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {["Нүүрний шинжилгээ", "Үс засал", "Нүүр будалт", "Хувцаслалт", "Бүтээгдэхүүн зөвлөмж"].map((l, i) => (
                  <span key={l} className="anim-scale-in" style={{ animationDelay: `${300 + i * 60}ms`, fontFamily: F, fontSize: "0.78rem", fontWeight: 600, color: "#6e6e73", background: "#fff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 999, padding: "6px 14px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>{l}</span>
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
        <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px 72px" }} className="anim-fade-up delay-400 md:px-12 lg:px-20">
          <div style={{ borderRadius: 28, overflow: "hidden", background: "#0d0d18", boxShadow: "0 8px 56px rgba(0,0,0,0.22)", position: "relative" }}>

            {/* top gradient bar */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,#9333ea,#c084fc,#7c3aed,transparent)", animation: "gradient-x 3s ease infinite", backgroundSize: "200%" }} />

            {/* Banner header */}
            <div style={{ padding: "22px 28px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#64dcff", boxShadow: "0 0 8px #64dcff", position: "relative" }}>
                  <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(100,220,255,0.4)", animation: "dot-ping 1.6s ease-out infinite" }} />
                </div>
                <span style={{ fontFamily: F, fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>AI Vision · Live Analysis</span>
              </div>
              <span style={{ fontFamily: F, fontSize: "0.7rem", fontWeight: 600, color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Demo preview</span>
            </div>

            {/* Showcase content */}
            <div style={{ padding: "24px 28px 28px", display: "flex", gap: 20, alignItems: "stretch", flexWrap: "wrap" }}>

              {/* Left — face scan */}
              <div className="anim-scale-in delay-500" style={{ position: "relative", borderRadius: 18, overflow: "hidden", background: "#111122", flexShrink: 0, width: "min(220px, 100%)" }}>
                <video src="https://pub-b4ea1073afd44537a913d4d4b2a8fbae.r2.dev/assets/asset-016.mp4"
                  autoPlay muted loop playsInline
                  style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", display: "block", opacity: 0.85 }} />

                {/* Scan overlay */}
                <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                  {/* Animated scan line */}
                  <div className="scan-line" />
                  {/* Horizontal guide */}
                  <div style={{ position: "absolute", top: "43%", left: "8%", right: "8%", height: 1, background: "rgba(100,220,255,0.35)" }} />
                  {/* Vertical guide */}
                  <div style={{ position: "absolute", left: "50%", top: "12%", bottom: "12%", width: 1, background: "rgba(100,220,255,0.35)", transform: "translateX(-50%)" }} />
                  {/* Corner brackets */}
                  {[["9%","11%"],["81%","11%"],["9%","81%"],["81%","81%"]].map(([l,t],i) => (
                    <div key={i} style={{ position: "absolute", left: l, top: t }}>
                      <div style={{ position: "absolute", top: 0, left: 0, width: 11, height: 2, background: "#64dcff" }} />
                      <div style={{ position: "absolute", top: 0, left: 0, width: 2, height: 11, background: "#64dcff" }} />
                    </div>
                  ))}
                  {/* Tracking dots */}
                  <ScanDot x="50%" y="28%" delay="0s" />
                  <ScanDot x="33%" y="40%" delay="0.2s" />
                  <ScanDot x="67%" y="40%" delay="0.4s" />
                  <ScanDot x="42%" y="52%" delay="0.6s" />
                  <ScanDot x="58%" y="52%" delay="0.8s" />
                  <ScanDot x="50%" y="61%" delay="1s" />
                  <ScanDot x="35%" y="70%" delay="0.3s" />
                  <ScanDot x="65%" y="70%" delay="0.7s" />
                </div>

                {/* Badges */}
                <div style={{ position: "absolute", bottom: 12, left: 12, background: "rgba(0,0,0,0.72)", backdropFilter: "blur(8px)", borderRadius: 9, padding: "5px 11px", display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#64dcff" }} className="animate-dot-blink" />
                  <span style={{ fontFamily: F, fontSize: "0.62rem", fontWeight: 700, color: "#fff", letterSpacing: "0.08em" }}>SCANNING</span>
                </div>
                <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(100,220,255,0.12)", border: "1px solid rgba(100,220,255,0.35)", borderRadius: 7, padding: "3px 9px" }}>
                  <span style={{ fontFamily: F, fontSize: "0.58rem", fontWeight: 700, color: "#64dcff", letterSpacing: "0.06em" }}>BEFORE</span>
                </div>
              </div>

              {/* Right — 5 hair results */}
              <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <p style={{ fontFamily: F, fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.38)", margin: 0 }}>
                    AI санал болгосон look-ууд
                  </p>
                  <span style={{ fontFamily: F, fontSize: "0.66rem", fontWeight: 600, color: "#9333ea", background: "rgba(147,51,234,0.15)", border: "1px solid rgba(147,51,234,0.28)", borderRadius: 999, padding: "3px 10px", flexShrink: 0 }}>
                    5 хувилбар
                  </span>
                </div>

                <div style={{ display: "flex", gap: 9, overflow: "hidden" }}>
                  <HairCard label="Short bob" isFirst delay="500ms" videoSrc="https://pub-b4ea1073afd44537a913d4d4b2a8fbae.r2.dev/assets/asset-016.mp4" />
                  <HairCard label="Wavy lob"  delay="580ms" videoSrc="https://pub-b4ea1073afd44537a913d4d4b2a8fbae.r2.dev/assets/asset-017.mp4" />
                  <HairCard label="Updo"      delay="660ms" videoSrc="https://pub-b4ea1073afd44537a913d4d4b2a8fbae.r2.dev/assets/asset-018.mp4" />
                  <HairCard label="Straight"  delay="740ms" videoSrc="https://pub-b4ea1073afd44537a913d4d4b2a8fbae.r2.dev/assets/asset-019.mp4" />
                  <HairCard label="Braided"   delay="820ms" videoSrc="https://pub-b4ea1073afd44537a913d4d4b2a8fbae.r2.dev/assets/asset-016.mp4" />
                </div>

                <div className="anim-fade-in delay-700" style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {[
                    { label: "Oval нүүр",      color: "#9333ea" },
                    { label: "Warm undertone", color: "#d97706" },
                    { label: "Classic style",  color: "#059669" },
                    { label: "Medium depth",   color: "#2563eb" },
                  ].map((c) => (
                    <span key={c.label} style={{ fontFamily: F, fontSize: "0.71rem", fontWeight: 600, color: c.color, background: `${c.color}18`, border: `1px solid ${c.color}30`, borderRadius: 999, padding: "4px 12px" }}>
                      {c.label}
                    </span>
                  ))}
                </div>

                <div className="anim-fade-in delay-800" style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 4, flexWrap: "wrap" }}>
                  <Link href="/analyze" style={{ fontFamily: F, fontWeight: 700, fontSize: "0.86rem", color: "#9333ea", background: "rgba(147,51,234,0.12)", border: "1px solid rgba(147,51,234,0.22)", borderRadius: 999, padding: "10px 22px", textDecoration: "none" }}>
                    Өөрийн look авах →
                  </Link>
                  <p style={{ fontFamily: F, fontSize: "0.76rem", color: "rgba(255,255,255,0.28)", margin: 0 }}>
                    Зургаа оруулаад 30 сек-д үр дүн авна
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ PRICING ══════════════════════════════════════ */}
        <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px 80px" }} className="md:px-12 lg:px-20">

          {/* Header */}
          <div className="anim-fade-up delay-0" style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ fontFamily: F, fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#8e8e93", marginBottom: 14 }}>
              Үнийн санал
            </p>
            <h2 style={{ fontFamily: F, fontSize: "clamp(1.9rem,4vw,2.8rem)", fontWeight: 800, letterSpacing: "-0.03em", color: "#1c1c1e", lineHeight: 1.1, marginBottom: 16 }}>
              Хэрэгцээндээ тохирсон<br />багцаа сонгоорой
            </h2>
            <p style={{ fontFamily: F, fontSize: "0.95rem", color: "#6e6e73", maxWidth: 460, margin: "0 auto", lineHeight: 1.75 }}>
              Эхний нэг удаагийн туршилт үнэгүй. Дараагийн хэрэглээнд сарын багц шаардлагатай.
            </p>
          </div>

          {/* Cards — responsive: 1 col mobile, 2 col desktop */}
          <div style={{ display: "grid", gap: 18, maxWidth: 820, margin: "0 auto", gridTemplateColumns: "1fr" }} className="md:grid-cols-2">
            <PricingCard
              name="Basic" price="19,999" tag="/ сар" href="/login" cta="Basic эхлэх →" animDelay="100ms"
              features={[
                "Сард 20 зураг upload",
                "Бүрэн AI нүүрний шинжилгээ",
                "AI-generated look зурагнууд",
                "Үс засал, нүүр будалт хувилбарууд",
                "Хувцаслалтын зөвлөмж",
                "Before/After харьцуулалт",
                "Look татаж авах, хадгалах",
              ]}
            />
            <PricingCard
              name="Pro" price="29,999" tag="/ сар" href="/login" cta="Pro эхлэх →" highlight animDelay="200ms"
              features={[
                "Сард 40 зураг upload",
                "AI Personal Stylist Chat",
                "Бүтээгдэхүүний линк & зөвлөмж",
                "Real-time look санал болгох",
                "Бүх Basic боломжууд",
                "Хамгийн өндөр нарийвчлал",
                "Хязгааргүй look хадгалах",
              ]}
            />
          </div>

          {/* Free trial note */}
          <div className="anim-fade-in delay-500" style={{ textAlign: "center", marginTop: 28 }}>
            <p style={{ fontFamily: F, fontSize: "0.82rem", color: "#aeaeb2" }}>
              Эхний нэг анализ үнэгүй · Нэвтэрч орсны дараа · Дурдсан үед цуцлах боломжтой
            </p>
          </div>
        </section>

        {/* ══ FOOTER STATS ════════════════════════════════ */}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px 56px" }} className="md:px-12 lg:px-20">
          <div className="anim-fade-up delay-200" style={{
            background: "rgba(255,255,255,0.78)",
            backdropFilter: "blur(24px) saturate(1.6)",
            WebkitBackdropFilter: "blur(24px) saturate(1.6)",
            borderRadius: 22,
            border: "1px solid rgba(255,255,255,0.95)",
            boxShadow: "0 1px 0 rgba(255,255,255,0.9) inset, 0 4px 24px rgba(0,0,0,0.06)",
            padding: "22px 28px",
            display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16,
          }}>
            <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
              {[
                { num: "500+", label: "Хэрэглэгч" },
                { num: "2",    label: "Багц сонголт" },
                { num: "4",    label: "AI функц" },
                { num: "30s",  label: "Үр дүн авах хугацаа" },
              ].map((s) => (
                <div key={s.label}>
                  <p style={{ fontFamily: F, fontSize: "1.45rem", fontWeight: 800, letterSpacing: "-0.02em", color: "#1c1c1e", margin: 0 }}>{s.num}</p>
                  <p style={{ fontFamily: F, fontSize: "0.67rem", fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", color: "#aeaeb2", marginTop: 2 }}>{s.label}</p>
                </div>
              ))}
            </div>
            <p style={{ fontFamily: F, fontSize: "0.74rem", color: "#c7c7cc", margin: 0 }}>© 2026 Looka · Монгол</p>
          </div>
        </div>

      </div>
    </div>
  );
}
