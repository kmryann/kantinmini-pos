import type { Metadata } from "next";
import "@/app/styles/staff.css";
import { NOINDEX_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Masuk staf · Kantin Mini",
  robots: NOINDEX_ROBOTS,
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
