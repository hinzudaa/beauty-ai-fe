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
      <body className="min-h-screen bg-black text-white">
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden>
          <div className="absolute -top-[20rem] -left-[15rem] w-[60rem] h-[60rem] rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #7c3aed 0%, transparent 65%)", filter: "blur(80px)" }} />
          <div className="absolute top-[30%] -right-[20rem] w-[50rem] h-[50rem] rounded-full opacity-[0.12]"
            style={{ background: "radial-gradient(circle, #a855f7 0%, transparent 65%)", filter: "blur(100px)" }} />
          <div className="absolute bottom-0 left-[35%] w-[45rem] h-[45rem] rounded-full opacity-[0.15]"
            style={{ background: "radial-gradient(circle, #6d28d9 0%, transparent 60%)", filter: "blur(80px)" }} />
        </div>
        <Nav />
        <main className="relative z-10">{children}</main>
      </body>
    </html>
  );
}
