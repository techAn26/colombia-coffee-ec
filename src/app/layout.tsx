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

export const metadata: Metadata = {
  title: "Colombia Coffee | コロンビア スペシャリティコーヒー",
  description:
    "コロンビアの農園から届くスペシャリティコーヒー豆。生産者の顔が見える、こだわりの一杯を。",
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
