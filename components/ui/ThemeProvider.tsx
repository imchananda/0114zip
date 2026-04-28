'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ReactNode } from 'react';

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"       // adds .dark / .light to <html>
      defaultTheme="dark"
      enableSystem            // respects OS preference
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemesProvider>
  );
}
