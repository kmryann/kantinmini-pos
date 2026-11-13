import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/app/providers";
import { iconSprite } from "@/lib/icon-sprite";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: "Kantin Mini — Makan enak, tanpa antre",
  description:
    "Pesan dari meja lewat QR, bayar QRIS atau cash, dan pantau pesanan sampai siap. Kantin Mini, kantin lingkungan dengan rasa rumahan.",
  icons: {
    icon: "/assets/favicon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" data-scroll-behavior="smooth">
      <head>
        <link
          rel="preload"
          href="/assets/fonts/bricolage-grotesque-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          as="image"
          href="/assets/hero/hero-kantin-sm.webp"
          media="(max-width: 640px)"
        />
        <link
          rel="preload"
          as="image"
          href="/assets/hero/hero-kantin-lg.webp"
          media="(min-width: 641px)"
        />
      </head>
      <body className="min-h-screen font-body text-ink antialiased">
        <div dangerouslySetInnerHTML={{ __html: iconSprite }} />
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
