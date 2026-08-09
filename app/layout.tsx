import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Invoice.In — Aplikasi Pembuat Invoice & Manajemen Bisnis Praktis",
  description:
    "Buat invoice profesional dalam hitungan detik, pantau status pembayaran, dan kelola arus kas bisnis Anda secara otomatis dengan Invoice.In.",
  keywords: [
    "invoice",
    "faktur",
    "invoice generator",
    "aplikasi invoice",
    "tagihan",
    "billing",
    "payments",
    "Invoice.In",
    "tour travel invoice",
    "business finance"
  ],
  authors: [{ name: "Invoice.In" }],
  creator: "Invoice.In",
  metadataBase: new URL("https://invoicein.id"),
  icons: {
    icon: "/images/logoin2.png",
    shortcut: "/images/logoin2.png",
    apple: "/images/logoin2.png",
  },
  openGraph: {
    title: "Invoice.In — Solusi Pembuatan Invoice & Penagihan Bisnis Cerdas",
    description:
      "Buat dan kirim invoice resmi berstandar profesional dalam hitungan detik. Lacak status pembayaran, terima uang muka (DP), dan unduh PDF otomatis.",
    url: "https://invoicein.id",
    siteName: "Invoice.In",
    images: [
      {
        url: "/images/logoin2.png",
        width: 800,
        height: 800,
        alt: "Invoice.In Official Logo",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Invoice.In — Solusi Pembuatan Invoice & Penagihan Bisnis Cerdas",
    description:
      "Buat invoice profesional dalam hitungan detik, lacak pembayaran, dan kelola keuangan bisnis Anda dengan Invoice.In.",
    images: ["/images/logoin2.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={inter.variable} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/images/logoin2.png" type="image/png" />
        <meta property="og:image" content="/images/logoin2.png" />
        <meta property="twitter:image" content="/images/logoin2.png" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
