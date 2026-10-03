import type { Metadata } from "next";
import { Archivo, Geist, Geist_Mono } from "next/font/google";
import { siteUrl } from "@/lib/seo";
import "./globals.css";

const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo", display: "swap" });
const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  applicationName: "SEVEN ROCK",
  title: { default: "SEVEN ROCK | Future menswear", template: "%s | SEVEN ROCK" },
  description: "Premium modern men's fashion and Gen-Z streetwear from SEVEN ROCK.",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "SEVEN ROCK",
    title: "SEVEN ROCK | Future menswear",
    description: "Premium modern men's fashion and Gen-Z streetwear from SEVEN ROCK.",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEVEN ROCK | Future menswear",
    description: "Premium modern men's fashion and Gen-Z streetwear from SEVEN ROCK.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${archivo.variable} ${geist.variable} ${geistMono.variable} bg-ink`}>
      <body className="min-h-screen bg-ink font-sans text-paper antialiased">{children}</body>
    </html>
  );
}
