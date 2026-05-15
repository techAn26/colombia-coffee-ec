import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: {
    default: "Colombia Coffee | コロンビア スペシャリティコーヒー",
    template: "%s | Colombia Coffee",
  },
  description:
    "コロンビアの農園から届くスペシャリティコーヒー豆。生産者の顔が見える、こだわりの一杯を。産地・焙煎度・フレーバーで、あなただけの一杯を見つけてください。",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: "Colombia Coffee",
    title: "Colombia Coffee | コロンビア スペシャリティコーヒー",
    description:
      "コロンビアの農園から届くスペシャリティコーヒー豆。生産者の顔が見える、こだわりの一杯を。",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="border-t px-6 py-4 text-center text-sm text-muted-foreground">
          &copy; 2026 Colombia Coffee. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
