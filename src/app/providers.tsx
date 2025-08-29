'use client';
import { useEffect } from 'react';
import { useUserStore } from '@/hooks/use-user';
import { initAppCheck } from '@/lib/app-check';
import { ThemeProvider } from '@/components/theme-provider';
import Toaster from '@/components/ui/toaster';

export function Providers({ children }: { children: React.ReactNode }) {
  const { initializeAuth } = useUserStore();
  
  useEffect(() => {
    initAppCheck();
    const unsubscribe = initializeAuth();
    return () => unsubscribe();
  }, [initializeAuth]);
  
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Toaster>{children}</Toaster>
    </ThemeProvider>
  );
}
