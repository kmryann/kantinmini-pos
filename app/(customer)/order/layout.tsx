import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

const ORDER_TITLE = "Daftar Menu — Kantin Mini Bandung";
const ORDER_DESCRIPTION =
  "Lihat daftar menu lengkap dan harga Kantin Mini Bandung: aneka ayam, katsu, pempek, mie, hingga minuman segar. Pesan online dengan mudah untuk makan di tempat atau bawa pulang.";

export const metadata: Metadata = {
  title: ORDER_TITLE,
  description: ORDER_DESCRIPTION,
  alternates: {
    canonical: "/order",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: `${SITE_URL}/order`,
    siteName: SITE_NAME,
    title: ORDER_TITLE,
    description: ORDER_DESCRIPTION,
    images: [
      {
        url: "/assets/og-image.jpg",
        width: 1200,
        height: 630,
        alt: ORDER_TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: ORDER_TITLE,
    description: ORDER_DESCRIPTION,
    images: ["/assets/og-image.jpg"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
