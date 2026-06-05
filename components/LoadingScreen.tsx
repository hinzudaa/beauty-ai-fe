"use client";

import Image from "next/image";

const PETALS = [
  { left: "5%",  delay: "0s",    dur: "6s",   size: 22, rotate: 15  },
  { left: "15%", delay: "1.2s",  dur: "7s",   size: 16, rotate: -20 },
  { left: "28%", delay: "0.6s",  dur: "5.5s", size: 24, rotate: 35  },
  { left: "42%", delay: "2s",    dur: "8s",   size: 14, rotate: -10 },
  { left: "55%", delay: "0.3s",  dur: "6.5s", size: 18, rotate: 50  },
  { left: "68%", delay: "1.8s",  dur: "5s",   size: 20, rotate: -40 },
  { left: "80%", delay: "0.9s",  dur: "7.5s", size: 16, rotate: 25  },
  { left: "92%", delay: "2.4s",  dur: "6.2s", size: 20, rotate: -60 },
];

export default function LoadingScreen({ inline = false, text }: { inline?: boolean; text?: string }) {
  return (
    <div
      className={`${inline ? "w-full flex items-center justify-center" : "fixed inset-0 z-[999] flex items-center justify-center"} overflow-hidden`}
      style={{
        background: "linear-gradient(160deg, #fdf4ff 0%, #f5f0ff 40%, #fff0f8 100%)",
        minHeight:  inline ? "calc(100vh - 3.5rem)" : undefined,
      }}
    >
      {/* Background orbs — using globals.css keyframes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[400px] h-[400px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #d946ef, transparent 70%)", animation: "lsOrb1 8s ease-in-out infinite alternate" }} />
        <div className="absolute -bottom-32 -right-32 w-[350px] h-[350px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #9333ea, transparent 70%)", animation: "lsOrb2 6s ease-in-out infinite alternate" }} />
      </div>

      {/* 🌸 Sakura petals — animation via globals.css @keyframes petalFall */}
      {PETALS.map((p, i) => (
        <div key={i} style={{
          position:  "absolute",
          top:       "-50px",
          left:      p.left,
          width:     p.size,
          height:    p.size,
          animation: `petalFall ${p.dur} ease-in-out ${p.delay} infinite`,
          pointerEvents: "none",
        }}>
          <svg viewBox="0 0 40 40" style={{ transform: `rotate(${p.rotate}deg)`, opacity: 0.75 }}>
            {[0, 72, 144, 216, 288].map((r, j) => (
              <ellipse key={r} cx="20" cy="20" rx="9" ry="18"
                fill={j % 2 === 0 ? "#f9a8d4" : "#e879f9"}
                transform={`rotate(${r} 20 20)`} opacity="0.85" />
            ))}
            <circle cx="20" cy="20" r="3.5" fill="#fff" opacity="0.9" />
          </svg>
        </div>
      ))}

      {/* Optional text */}
      {text && (
        <div className="absolute bottom-16 left-0 right-0 flex flex-col items-center gap-1 px-6">
          <p className="text-[0.95rem] font-bold text-[#1c1c1e] text-center">{text}</p>
          <div className="flex gap-[5px] mt-1">
            {[0,1,2].map((i) => (
              <span key={i} className="w-[6px] h-[6px] rounded-full bg-[#9333ea] inline-block"
                style={{ animation: `lsPulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
            ))}
          </div>
        </div>
      )}

      {/* 💜 3 rings + ✨ 6 sparkles + 🪁 logo */}
      <div className="relative flex items-center justify-center">

        <div className="absolute rounded-full border-2 border-purple-200"
          style={{ width: 180, height: 180, animation: "lsSpin 10s linear infinite" }} />
        <div className="absolute rounded-full border-2 border-pink-200"
          style={{ width: 148, height: 148, animation: "lsSpinR 6s linear infinite" }} />
        <div className="absolute rounded-full border border-purple-300"
          style={{ width: 116, height: 116, animation: "lsSpin 4s linear infinite" }} />

        <div className="absolute rounded-full"
          style={{ width: 88, height: 88, background: "radial-gradient(circle, rgba(147,51,234,0.18), transparent 70%)", animation: "lsPulse 2s ease-in-out infinite" }} />

        <div className="relative z-10 bg-white rounded-2xl p-3 shadow-[0_8px_32px_rgba(147,51,234,0.2)]"
          style={{ animation: "lsFloat 3s ease-in-out infinite" }}>
          <Image src="/logo.svg" alt="Looka" width={80} height={30} priority />
        </div>

        {[0, 60, 120, 180, 240, 300].map((deg, i) => (
          <div key={i} className="absolute rounded-full"
            style={{
              width:          i % 2 === 0 ? 7 : 5,
              height:         i % 2 === 0 ? 7 : 5,
              background:     i % 3 === 0 ? "#d946ef" : i % 3 === 1 ? "#9333ea" : "#f472b6",
              transform:      `rotate(${deg}deg) translateX(85px)`,
              animation:      `lsOrbit 4s linear ${i * -0.66}s infinite`,
              boxShadow:      "0 0 6px 2px rgba(147,51,234,0.45)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
