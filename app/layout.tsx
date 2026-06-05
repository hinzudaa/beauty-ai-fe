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
  title: "Looka — AI Looksmax шинжилгээ",
  description: "Looka AI-д шинжлүүлж өөрийн looksmax оноогоо мэдээрэй!",
  icons: {
    icon:     "/favicon.png",
    shortcut: "/favicon.png",
    apple:    "/favicon.png",
  },
  openGraph: {
    title:       "Looka — AI Looksmax шинжилгээ",
    description: "Looka AI-д шинжлүүлж өөрийн looksmax оноогоо мэдээрэй!",
    url:         "https://looka.beauty",
    siteName:    "looka.beauty",
    images:      [{ url: "https://looka.beauty/favicon.png", width: 512, height: 512 }],
    type:        "website",
    locale:      "mn_MN",
  },
  twitter: {
    card:        "summary",
    title:       "Looka — AI Looksmax шинжилгээ",
    description: "Looka AI-д шинжлүүлж өөрийн looksmax оноогоо мэдээрэй!",
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
