"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { GenerationProvider } from "@/lib/generation-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <GenerationProvider>
          {children}
        </GenerationProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
