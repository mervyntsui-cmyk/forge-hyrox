import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = {
  title: "FORGE — HYROX Race Engine",
  description: "AI-powered personalized HYROX training plans. Forge your race strategy.",
};

import { Providers } from "@/components/Providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head />
      <body className={`${inter.variable} ${manrope.variable} antialiased font-sans flex flex-col min-h-screen`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
