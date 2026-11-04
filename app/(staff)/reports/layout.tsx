import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Laporan transaksi · Kantin Mini",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
