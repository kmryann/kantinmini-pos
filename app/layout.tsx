import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/app/providers";
import { iconSprite } from "@/lib/icon-sprite";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: "Kantin Mini",
  description:
    "Kantin Mini, Cita Rasa Terbaik.",
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
          href="/assets/fonts/rubik-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
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
