"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { fileToDataUrl } from "@/apis/analyze";
import { photoStore } from "@/utils/photoStore";

const F = "var(--font-montserrat),'Helvetica Neue',Arial,sans-serif";

const SERVICES = [
  { id: "analyze",   label: "Нүүрний шинжилгээ", sub: "Face shape · Skin tone · Style type", icon: "◈", color: "#9333ea", href: "/analyze"   },
  { id: "hairstyle", label: "Үс засал & Грим",    sub: "Hair styles · Makeup looks",          icon: "✦", color: "#a855f7", href: "/hairstyle" },
  { id: "outfit",    label: "Хувцаслалт",          sub: "Outfit ideas · Style advice",         icon: "◉", color: "#7c3aed", href: "/outfit"    },
  { id: "chat",      label: "AI Стилист",           sub: "Персональ зөвлөгч · Chat",           icon: "◇", color: "#6d28d9", href: "/chat"      },
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

  function goTo(href: string) {
    router.push(href);
  }

  return (
    <div style={{ width: "100%" }}>
      {!preview ? (
        /* ── Upload zone ── */
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          onDragOver={(e) => e.preventDefault()}
          style={{
            borderRadius: 24, padding: "56px 24px", cursor: "pointer",
            border: "2px dashed rgba(147,51,234,0.3)",
            background: "rgba(147,51,234,0.03)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20,
            transition: "all 0.2s",
          }}
        >
          <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(147,51,234,0.1)", border: "2px solid rgba(147,51,234,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>
            📸
          </div>

          <div style={{ textAlign: "center" }}>
            <p style={{ fontFamily: F, fontSize: "1.15rem", fontWeight: 700, color: "#1c1c1e", margin: "0 0 8px" }}>
              Зургаа оруулна уу
            </p>
            <p style={{ fontFamily: F, fontSize: "0.88rem", color: "#8e8e93", margin: "0 0 12px" }}>
              JPG · PNG · WEBP · Selfie хамгийн сайн
            </p>
            <span style={{ fontFamily: F, fontSize: "0.78rem", fontWeight: 700, color: "#9333ea", background: "rgba(147,51,234,0.08)", border: "1px solid rgba(147,51,234,0.2)", borderRadius: 999, padding: "4px 14px" }}>
              Эхний удаа үнэгүй ✦
            </span>
          </div>

          {loading && (
            <div style={{ display: "flex", gap: 8 }}>
              {[0,1,2].map(i => <span key={i} className="animate-dot-blink" style={{ width: 8, height: 8, borderRadius: "50%", background: "#9333ea", display: "inline-block", animationDelay: `${i*0.18}s` }} />)}
            </div>
          )}
        </div>
      ) : (
        /* ── Service selection ── */
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Photo preview */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, background: "#fff", borderRadius: 18, border: "1px solid rgba(0,0,0,0.07)", padding: "14px 18px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <Image src={preview} alt="Таны зураг" width={60} height={60} style={{ objectFit: "cover", borderRadius: 12, border: "1px solid rgba(0,0,0,0.08)" }} />
              <div style={{ position: "absolute", bottom: -4, right: -4, width: 20, height: 20, borderRadius: "50%", background: "#9333ea", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#fff", fontSize: "0.55rem" }}>✦</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: F, fontSize: "0.92rem", fontWeight: 700, color: "#1c1c1e", margin: "0 0 3px" }}>Зураг бэлэн боллоо</p>
              <p style={{ fontFamily: F, fontSize: "0.78rem", color: "#8e8e93", margin: 0 }}>Доорх үйлчилгээнүүдээс сонгоно уу</p>
            </div>
            <button onClick={() => { setPreview(null); photoStore.clear(); }}
              style={{ fontFamily: F, fontSize: "0.75rem", color: "#aeaeb2", background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}>
              Солих
            </button>
          </div>

          {/* Service cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {SERVICES.map((s) => (
              <button key={s.id} onClick={() => goTo(s.href)}
                style={{
                  padding: "20px 18px", borderRadius: 18, textAlign: "left", cursor: "pointer",
                  border: `1.5px solid ${s.color}25`,
                  background: `${s.color}06`,
                  boxShadow: `0 2px 12px ${s.color}0f`,
                  transition: "all 0.18s",
                  display: "flex", flexDirection: "column", gap: 10,
                }}>
                <span style={{ fontSize: "1.4rem", color: s.color }}>{s.icon}</span>
                <div>
                  <p style={{ fontFamily: F, fontSize: "0.92rem", fontWeight: 800, color: "#1c1c1e", margin: "0 0 4px" }}>{s.label}</p>
                  <p style={{ fontFamily: F, fontSize: "0.73rem", color: "#8e8e93", margin: 0, lineHeight: 1.4 }}>{s.sub}</p>
                </div>
                <span style={{ fontFamily: F, fontSize: "0.72rem", fontWeight: 700, color: s.color, alignSelf: "flex-start" }}>Үргэлжлүүлэх →</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
