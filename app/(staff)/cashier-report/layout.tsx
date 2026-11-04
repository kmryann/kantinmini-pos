import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Laporan hari ini · Kantin Mini",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
