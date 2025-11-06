import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Navbar from "./components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BlockLens - Solana Portfolio Tracker",
  description: "Track all your Solana wallets, tokens, and NFTs in one place. Unified analytics for Web3 portfolios.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-white text-black dark:bg-neutral-950 dark:text-white`}>
        <Providers>
          <Navbar />
          <main className="mx-auto max-w-6xl px-6 py-12 sm:px-8 lg:px-10">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
