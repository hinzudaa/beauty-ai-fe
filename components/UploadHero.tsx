"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { fileToDataUrl } from "@/apis/analyze";
import { photoStore } from "@/utils/photoStore";

const SERVICES = [
  { id: "analyze", label: "Бүрэн шинжилгээ", sub: "Нүүр · Үс & Грим · Хувцас — нэг дор", icon: "◈", color: "#9333ea", href: "/analyze" },
  { id: "chat",    label: "AI Стилист",       sub: "Персональ зөвлөгч · Pro захиалга",     icon: "◇", color: "#6d28d9", href: "/chat"    },
];

export default function UploadHero() {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    setLoading(true);
    const objectUrl = URL.createObjectURL(file);
    const dataUrl = await fileToDataUrl(file);
    photoStore.set(dataUrl, objectUrl);
    setPreview(objectUrl);
    setLoading(false);
  }

  return (
    <div className="w-full">
      {!preview ? (
        /* ── Upload zone ── */
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          onDragOver={(e) => e.preventDefault()}
          className="upload-zone rounded-[24px] py-14 px-6 cursor-pointer border-2 border-dashed border-[rgba(147,51,234,0.3)] bg-[rgba(147,51,234,0.03)] flex flex-col items-center justify-center gap-5 transition-all duration-200"
        >
          <input
            ref={inputRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />

          <div className="w-20 h-20 rounded-full bg-[rgba(147,51,234,0.1)] border-2 border-[rgba(147,51,234,0.2)] flex items-center justify-center text-[2rem]">
            📸
          </div>

          <div className="text-center">
            <p className="text-[1.15rem] font-bold text-[#1c1c1e] mb-2">
              Зургаа оруулна уу
            </p>
            <p className="text-[0.88rem] text-[#8e8e93]">
              JPG · PNG · WEBP · Selfie хамгийн сайн
            </p>
          </div>

          {loading && (
            <div className="flex gap-2">
              {[0,1,2].map(i => (
                <span key={i} className="animate-dot-blink w-2 h-2 rounded-full bg-[#9333ea] inline-block" style={{ animationDelay: `${i*0.18}s` }} />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ── Service selection ── */
        <div className="flex flex-col gap-5">
          {/* Photo preview */}
          <div className="flex items-center gap-4 bg-white rounded-[18px] border border-[rgba(0,0,0,0.07)] px-[18px] py-[14px] shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
            <div className="relative shrink-0">
              <Image
                src={preview} alt="Таны зураг" width={60} height={60}
                className="object-cover rounded-xl border border-[rgba(0,0,0,0.08)]"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#9333ea] flex items-center justify-center">
                <span className="text-white text-[0.55rem]">✦</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[0.92rem] font-bold text-[#1c1c1e] mb-[3px]">Зураг бэлэн боллоо</p>
              <p className="text-[0.78rem] text-[#8e8e93]">Доорх үйлчилгээнүүдээс сонгоно уу</p>
            </div>
            <button
              onClick={() => { setPreview(null); photoStore.clear(); }}
              className="text-[0.75rem] text-[#aeaeb2] bg-transparent border-none cursor-pointer shrink-0"
            >
              Солих
            </button>
          </div>

          {/* Service cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SERVICES.map((s) => (
              <button
                key={s.id}
                onClick={() => router.push(s.href)}
                className="p-[20px_18px] rounded-[18px] text-left cursor-pointer flex flex-col gap-[10px] transition-all duration-[180ms]"
                style={{
                  border: `1.5px solid ${s.color}25`,
                  background: `${s.color}06`,
                  boxShadow: `0 2px 12px ${s.color}0f`,
                }}
              >
                <span className="text-[1.4rem]" style={{ color: s.color }}>{s.icon}</span>
                <div>
                  <p className="text-[0.92rem] font-extrabold text-[#1c1c1e] mb-1">{s.label}</p>
                  <p className="text-[0.73rem] text-[#8e8e93] leading-[1.4]">{s.sub}</p>
                </div>
                <span className="text-[0.72rem] font-bold self-start" style={{ color: s.color }}>
                  Үргэлжлүүлэх →
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
