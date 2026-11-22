import type { Metadata } from "next";
import { NOINDEX_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Keranjang · Kantin Mini",
  robots: NOINDEX_ROBOTS,
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
