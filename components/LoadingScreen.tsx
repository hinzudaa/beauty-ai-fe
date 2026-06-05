"use client";


import Image from "next/image";

const PETALS = [
  { left: "8%",  delay: "0s",    dur: "6s",   size: 18, rotate: 15  },
  { left: "18%", delay: "1.2s",  dur: "7s",   size: 14, rotate: -20 },
  { left: "30%", delay: "0.6s",  dur: "5.5s", size: 22, rotate: 35  },
  { left: "45%", delay: "2s",    dur: "8s",   size: 12, rotate: -10 },
  { left: "58%", delay: "0.3s",  dur: "6.5s", size: 16, rotate: 50  },
  { left: "70%", delay: "1.8s",  dur: "5s",   size: 20, rotate: -40 },
  { left: "82%", delay: "0.9s",  dur: "7.5s", size: 14, rotate: 25  },
  { left: "92%", delay: "2.4s",  dur: "6s",   size: 18, rotate: -60 },
];

export default function LoadingScreen({ inline = false }: { inline?: boolean }) {
  return (
    <div
      className={`${inline ? "w-full flex items-center justify-center" : "fixed inset-0 z-[999] flex items-center justify-center"} overflow-hidden`}
      style={{
        background: "linear-gradient(160deg, #fdf4ff 0%, #f5f0ff 40%, #fff0f8 100%)",
        animation:  "fadeIn 0.3s ease both",
        minHeight:  inline ? "calc(100vh - 3.5rem)" : undefined,
      }}
    >
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[400px] h-[400px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #d946ef, transparent 70%)", animation: "orb1 8s ease-in-out infinite alternate" }} />
        <div className="absolute -bottom-32 -right-32 w-[350px] h-[350px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #9333ea, transparent 70%)", animation: "orb2 6s ease-in-out infinite alternate" }} />
      </div>

      {/* 🌸 Falling sakura petals */}
      {PETALS.map((p, i) => (
        <div key={i} style={{
          position: "absolute", top: "-40px", left: p.left,
          width: p.size, height: p.size,
          animationName: "petalFall", animationDuration: p.dur,
          animationDelay: p.delay, animationTimingFunction: "ease-in-out",
          animationIterationCount: "infinite", pointerEvents: "none",
        }}>
          <svg viewBox="0 0 40 40" style={{ transform: `rotate(${p.rotate}deg)`, opacity: 0.65 }}>
            <defs>
              <linearGradient id={`pk${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f9a8d4" />
                <stop offset="100%" stopColor="#e879f9" />
              </linearGradient>
            </defs>
            {[0, 72, 144, 216, 288].map((r) => (
              <ellipse key={r} cx="20" cy="20" rx="9" ry="18"
                fill={`url(#pk${i})`} transform={`rotate(${r} 20 20)`} opacity="0.85" />
            ))}
            <circle cx="20" cy="20" r="3" fill="#fff" opacity="0.8" />
          </svg>
        </div>
      ))}

      {/* 💜 3 rings + ✨ 6 sparkles + 🪁 floating logo */}
      <div className="relative flex items-center justify-center">

        {/* Outer ring */}
        <div className="absolute rounded-full border-2 border-purple-200"
          style={{ width: 180, height: 180, animation: "spin 10s linear infinite" }} />
        {/* Middle ring */}
        <div className="absolute rounded-full border-2 border-pink-200"
          style={{ width: 148, height: 148, animation: "spinReverse 6s linear infinite" }} />
        {/* Inner ring */}
        <div className="absolute rounded-full border-[1.5px] border-purple-300"
          style={{ width: 116, height: 116, animation: "spin 4s linear infinite" }} />

        {/* Pulsing glow */}
        <div className="absolute rounded-full"
          style={{ width: 88, height: 88, background: "radial-gradient(circle, rgba(147,51,234,0.2), transparent 70%)", animation: "pulse 2s ease-in-out infinite" }} />

        {/* 🪁 Logo card */}
        <div className="relative z-10 bg-white rounded-2xl p-3 shadow-[0_8px_32px_rgba(147,51,234,0.2)]"
          style={{ animation: "float 3s ease-in-out infinite" }}>
          <Image src="/logo.svg" alt="Looka" width={80} height={30} priority />
        </div>

        {/* ✨ 6 orbiting sparkle dots */}
        {[0, 60, 120, 180, 240, 300].map((deg, i) => (
          <div key={i} className="absolute rounded-full"
            style={{
              width:  i % 2 === 0 ? 7 : 5,
              height: i % 2 === 0 ? 7 : 5,
              background: i % 3 === 0 ? "#d946ef" : i % 3 === 1 ? "#9333ea" : "#f472b6",
              transform: `rotate(${deg}deg) translateX(85px)`,
              animation: "orbit 4s linear infinite",
              animationDelay: `${i * -0.66}s`,
              boxShadow: "0 0 6px 2px rgba(147,51,234,0.45)",
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes fadeIn      { from { opacity: 0; } to { opacity: 1; } }
        @keyframes petalFall {
          0%   { transform: translateY(-40px) rotate(0deg) translateX(0px); opacity: 0; }
          10%  { opacity: 0.7; }
          90%  { opacity: 0.5; }
          100% { transform: translateY(110vh) rotate(360deg) translateX(60px); opacity: 0; }
        }
        @keyframes spin        { to { transform: rotate(360deg); } }
        @keyframes spinReverse { to { transform: rotate(-360deg); } }
        @keyframes orbit       { to { transform: rotate(360deg) translateX(85px); } }
        @keyframes float       { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes pulse       { 0%,100% { transform: scale(1); opacity: 0.6; } 50% { transform: scale(1.3); opacity: 1; } }
        @keyframes orb1        { from { transform: translate(0,0); } to { transform: translate(30px,20px); } }
        @keyframes orb2        { from { transform: translate(0,0); } to { transform: translate(-20px,-30px); } }
      `}</style>
    </div>
  );
}
