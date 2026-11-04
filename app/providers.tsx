"use client";

import type { ReactNode } from "react";
import { LanguageProvider } from "@/lib/i18n";
import { ToastProvider } from "@/components/ToastProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <ToastProvider>{children}</ToastProvider>
    </LanguageProvider>
  );
}
