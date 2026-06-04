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
  icons: {
    icon:        "/favicon.png",
    shortcut:    "/favicon.png",
    apple:       "/favicon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn" className={montserrat.variable}>
      <body className="min-h-screen bg-[#f2f2f7] text-[#1c1c1e]">
        <AuthProvider>
          <Nav />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
