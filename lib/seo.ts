import type { Metadata } from "next";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://kantinmini.web.id"
).replace(/\/+$/, "");

export const SITE_NAME = "Kantin Mini";

export const DEFAULT_TITLE = "Kantin Mini Bandung — Masakan Rumahan Sejak 1986";
export const DEFAULT_DESCRIPTION =
  "Masakan rumahan hangat & ramah di kantong di Gang Melong Kaler I No. 1, Bandung. Katsu, Pempek Palembang, ayam geprek, mie, hingga minuman segar. Pesan online dengan mudah, bayar QRIS atau cash.";

export const NOINDEX_ROBOTS: Metadata["robots"] = {
  index: false,
  follow: false,
  googleBot: {
    index: false,
    follow: false,
  },
};
