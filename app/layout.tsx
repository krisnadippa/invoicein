import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0a0a0c",
  width: "device-width",
  initialScale: 1,
};

const getSiteUrl = () => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "https://invoicein.id";
};

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: {
    default: "Invoice.In — Aplikasi Pembuat Invoice & Manajemen Bisnis Praktis",
    template: "%s | Invoice.In",
  },
  description:
    "Buat invoice profesional dalam hitungan detik, pantau status pembayaran, hitung uang muka (DP) & pajak otomatis, cetak PDF resmi, dan kelola keuangan bisnis Anda dengan Invoice.In.",
  applicationName: "Invoice.In",
  keywords: [
    "Invoice.In",
    "invoice generator indonesia",
    "aplikasi pembuat invoice",
    "buat faktur online",
    "invoice tour travel",
    "tagihan bisnis",
    "cetak invoice pdf",
    "software invoice gratis",
    "manajemen keuangan usaha",
    "faktur pembayaran",
    "rekapitulasi tagihan"
  ],
  authors: [{ name: "Invoice.In Official", url: siteUrl }],
  creator: "Invoice.In",
  publisher: "Invoice.In",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/images/logoin2.png", sizes: "any" },
      { url: "/icon.png", type: "image/png" },
      { url: "/favicon.ico" }
    ],
    shortcut: ["/images/logoin2.png"],
    apple: [
      { url: "/images/logoin2.png", sizes: "180x180", type: "image/png" },
      { url: "/apple-icon.png" }
    ],
  },
  openGraph: {
    title: "Invoice.In — Solusi Pembuatan Invoice & Penagihan Bisnis Cerdas",
    description:
      "Buat dan kirim invoice resmi berstandar profesional dalam hitungan detik. Lacak status pembayaran, terima uang muka (DP), dan unduh PDF otomatis.",
    url: siteUrl,
    siteName: "Invoice.In",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/images/logoin2.png",
        width: 1200,
        height: 630,
        alt: "Invoice.In - Aplikasi Pembuat Invoice & Manajemen Bisnis Praktis",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Invoice.In — Solusi Pembuatan Invoice & Penagihan Bisnis Cerdas",
    description:
      "Buat invoice profesional dalam hitungan detik, lacak pembayaran, dan kelola keuangan bisnis Anda dengan Invoice.In.",
    images: ["/images/logoin2.png"],
    creator: "@invoicein",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

import NeonAuthHandler from "./components/NeonAuthHandler";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={inter.variable} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/images/logoin2.png" type="image/png" sizes="any" />
        <link rel="apple-touch-icon" href="/images/logoin2.png" />
        <meta property="og:site_name" content="Invoice.In" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/images/logoin2.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="/images/logoin2.png" />
      </head>
      <body suppressHydrationWarning>
        <NeonAuthHandler />
        {children}
      </body>
    </html>
  );
}
