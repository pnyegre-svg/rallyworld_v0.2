'use client';
import { useEffect } from 'react';
import { useUserStore } from '@/hooks/use-user';
import { initAppCheck } from '@/lib/app-check';

export function Providers({ children }: { children: React.ReactNode }) {
  const { initializeAuth } = useUserStore();
  
  useEffect(() => {
    initAppCheck();
    const unsubscribe = initializeAuth();
    return () => unsubscribe();
  }, [initializeAuth]);
  
  return <>{children}</>;
}
