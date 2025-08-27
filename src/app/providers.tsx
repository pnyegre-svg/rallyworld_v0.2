'use client';
import { useEffect } from 'react';
import { initAppCheck } from '@/lib/app-check';
import { ThemeProvider } from '@/components/theme-provider';

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => { initAppCheck(); }, []);
  return (
    <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
    >
        {children}
    </ThemeProvider>
  );
}