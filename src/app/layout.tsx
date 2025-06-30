import type { Metadata } from "next";
import './globals.css';

import { Geist, Geist_Mono, Inter } from 'next/font/google';
import TopLoader from 'nextjs-toploader';

import { Providers } from '@/context/providers';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vetanytime",
  description: "Created by Andritiana.sh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <head>
        <meta name="googlebot" content="notranslate" />
        <meta name="google" content="notranslate" />
      </head>
      <body
        translate="no"
        suppressHydrationWarning
        className={`min-h-screen overflow-y-scroll scroll-auto bg-[#F7F7F7] antialiased selection:bg-cyan-100 selection:text-primary`}
      >
        <TopLoader showSpinner={false} color="#4338ca" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
