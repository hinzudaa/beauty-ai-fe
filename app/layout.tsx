import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import Nav from "@/components/Nav";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "Looka — AI Beauty Platform",
  description: "Монгол хүний нүүр, биеийн онцлогт тохирсон AI гоо сайхны зөвлөгч",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn" className={montserrat.variable}>
      <body className="min-h-screen" style={{ background: "#f2f2f7", color: "#1c1c1e" }}>
        <AuthProvider>
          <Nav />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
