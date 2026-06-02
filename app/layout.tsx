import type { Metadata } from "next";
import "./globals.css";
import Nav from "./components/Nav";

export const metadata: Metadata = {
  title: "Beauty AI Platform",
  description: "AI-powered загвар зөвлөгөө — Монголд анхных",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn">
      <body className="min-h-screen bg-[#0d0a18] text-[#ede0f8]">
        {/* Ambient orbs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden>
          <div className="absolute -top-[20rem] -left-[15rem] w-[55rem] h-[55rem] rounded-full opacity-35"
            style={{ background: "radial-gradient(circle, #9b59d0 0%, transparent 65%)", filter: "blur(60px)" }} />
          <div className="absolute top-[30%] -right-[20rem] w-[50rem] h-[50rem] rounded-full opacity-25"
            style={{ background: "radial-gradient(circle, #d070b8 0%, transparent 65%)", filter: "blur(80px)" }} />
          <div className="absolute bottom-0 left-[35%] w-[40rem] h-[40rem] rounded-full opacity-30"
            style={{ background: "radial-gradient(circle, #7c3aed 0%, transparent 60%)", filter: "blur(70px)" }} />
        </div>
        <Nav />
        <main className="relative z-10">{children}</main>
      </body>
    </html>
  );
}
