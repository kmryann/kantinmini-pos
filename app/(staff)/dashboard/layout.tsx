import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard · Kantin Mini",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
