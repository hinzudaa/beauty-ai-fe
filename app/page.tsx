import Link from "next/link";

function CardVideo({ src }: { src: string }) {
  return (
    <video
      src={src}
      className="absolute inset-0 h-full w-full object-cover"
      autoPlay muted loop playsInline
    />
  );
}

const CARD = "bg-[#160d24] rounded-3xl border border-white/[0.08] relative overflow-hidden transition-colors hover:border-gold/20";
const BADGE = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/15 border border-gold/30 text-gold text-[0.68rem] tracking-[0.14em] uppercase font-medium font-sans";
const LABEL = "text-[0.68rem] tracking-[0.18em] uppercase font-medium text-white/40 font-sans";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0d0a18] px-6 md:px-12 lg:px-20 pt-14 pb-20">

      <section className="mb-16">
        <div className="mb-7">
          <span className={BADGE}>✦ &nbsp;Монголд анхных · 2025</span>
        </div>

        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <h1 style={{ fontSize: "clamp(3rem, 7vw, 5.5rem)", lineHeight: 1.06, letterSpacing: "-0.03em" }}>
              Таны гоо сайхныг
              <br />
              <span className="text-gold">AI</span> илрүүлнэ.
            </h1>
            <p className="mt-5 text-base text-white/60 max-w-md font-sans" style={{ lineHeight: 1.75 }}>
              Нүүрний шинжилгээ. Хувцасны зөвлөмж. Үс засал, грим.
              <br />Нэг платформ — хязгааргүй боломж.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 items-start md:items-end shrink-0">
            <Link
              href="/analyze"
              className="liquid-glass backdrop-blur-md bg-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-full px-7 py-3 text-sm text-white font-sans hover:scale-[1.02] transition-transform"
              style={{ letterSpacing: "0.07em" }}
            >
              Туршиж үзэх →
            </Link>
            <span className="text-xs text-white/20 font-sans" style={{ letterSpacing: "0.05em" }}>
              Free · Premium 19,900₮/сар
            </span>
          </div>
        </div>

        <div className="mt-12 h-px w-full bg-gradient-to-r from-gold/30 to-transparent" />
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <span className={LABEL}>Core Features</span>
          <span className={`${LABEL} text-white/20`}>04 боломж</span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:grid-rows-2">

          <Link href="/analyze" className={`${CARD} md:row-span-2 min-h-[32rem] p-7 flex flex-col`}>
            <CardVideo src="https://pub-b4ea1073afd44537a913d4d4b2a8fbae.r2.dev/assets/asset-016.mp4" />
            <div className="relative flex flex-col h-full">
              <div className="flex items-center justify-between">
                <span className={`${LABEL} text-gold`}>01</span>
                <span className={LABEL}>AI Vision</span>
              </div>
              <div className="flex-1" />
              <div>
                <h2 style={{ fontSize: "clamp(1.5rem, 2.5vw, 2rem)", lineHeight: 1.2, letterSpacing: "-0.02em" }}>
                  Нүүрний<br />Шинжилгээ
                </h2>
                <div className="mt-4 h-px w-full bg-gold/30" />
                <p className="mt-4 text-sm text-white/60 font-sans" style={{ lineHeight: 1.7 }}>
                  Нүүрний хэлбэр, арьсны тон,<br />style type — AI-аар.
                </p>
                <div className="mt-5">
                  <span className={BADGE}>Шинжлэх →</span>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/outfit" className={`${CARD} md:col-span-2 p-7 flex flex-col min-h-[15rem]`}>
            <CardVideo src="https://pub-b4ea1073afd44537a913d4d4b2a8fbae.r2.dev/assets/asset-017.mp4" />
            <div className="relative flex flex-col h-full">
              <div className="flex items-start justify-between">
                <div>
                  <span className={`${LABEL} text-gold block mb-3`}>02</span>
                  <h2 style={{ fontSize: "clamp(1.5rem, 2.5vw, 2rem)", lineHeight: 1.2, letterSpacing: "-0.02em" }}>
                    Хувцас<br />Генератор
                  </h2>
                </div>
                <span className={LABEL}>MVP гол</span>
              </div>
              <div className="flex-1 min-h-12" />
              <p className="text-sm text-white/60 font-sans">
                Event сонгоод AI-аар хувцас хослол авах.
              </p>
            </div>
          </Link>

          <Link href="/hairstyle" className={`${CARD} p-7 flex flex-col min-h-[14rem]`}>
            <CardVideo src="https://pub-b4ea1073afd44537a913d4d4b2a8fbae.r2.dev/assets/asset-018.mp4" />
            <div className="relative flex flex-col h-full">
              <div className="flex items-center justify-between">
                <span className={`${LABEL} text-gold`}>03</span>
                <span className={LABEL}>Үс · Грим</span>
              </div>
              <p className="mt-6 text-sm text-white/60 font-sans" style={{ lineHeight: 1.7 }}>
                Зургаа upload хийж нүүрний хэлбэрт<br />тохирсон үс засал, грим авах.
              </p>
              <div className="flex-1" />
              <span className="liquid-glass backdrop-blur-md bg-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-full px-4 py-2 text-sm text-white font-sans inline-block w-fit mt-5">
                Шинжлэх →
              </span>
            </div>
          </Link>

          <Link href="/chat" className={`${CARD} p-7 flex flex-col min-h-[14rem]`}>
            <CardVideo src="https://pub-b4ea1073afd44537a913d4d4b2a8fbae.r2.dev/assets/asset-019.mp4" />
            <div className="relative flex flex-col h-full">
              <div className="flex items-center justify-between">
                <span className={`${LABEL} text-gold`}>04</span>
                <span className={BADGE}>Premium</span>
              </div>
              <div className="flex-1" />
              <div>
                <h3 style={{ fontSize: "1.2rem", letterSpacing: "-0.01em" }}>AI Стилист</h3>
                <p className="mt-2 text-sm text-white/60 font-sans" style={{ lineHeight: 1.65 }}>
                  &ldquo;Маргааш interview юу өмсөх вэ?&rdquo; —<br />чатаар асуугаарай.
                </p>
              </div>
            </div>
          </Link>

        </div>
      </section>

      <section className="mt-16 pt-8 border-t border-white/[0.08] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-10">
          {[
            { num: "500+", label: "Хэрэглэгч" },
            { num: "19900₮", label: "Premium/сар" },
            { num: "4", label: "AI боломж" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-kenoky text-white font-bold">{s.num}</p>
              <p className={`${LABEL} mt-1`}>{s.label}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-white/50 font-sans font-bold" style={{ letterSpacing: "0.05em" }}>
          © 2026 Beauty AI Platform · Монгол
        </p>
      </section>

    </main>
  );
}
