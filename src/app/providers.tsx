
'use client';
import { useEffect, useState, createContext } from 'react';
import { useUserStore } from '@/hooks/use-user';
import { ThemeProvider } from '@/components/theme-provider';
import Toaster from '@/components/ui/toaster';
import { auth } from '@/lib/firebase.client';
import { AppReadyContext } from '@/hooks/use-app-ready';

export function Providers({ children }: { children: React.ReactNode }) {
  const { initialize } = useUserStore();
  const [isAppReady, setIsAppReady] = useState(false);
  
  useEffect(() => {
    // Initialize the user store which sets up the auth listener
    const unsubscribe = initialize();

    // When the auth state is confirmed, the app is ready
    const checkReadyState = () => {
        if (auth.currentUser !== undefined) {
            setIsAppReady(true);
        }
    };
    
    // Check immediately and also on auth state change
    checkReadyState();
    const unsubAuth = auth.onAuthStateChanged(checkReadyState);

    return () => {
      unsubscribe();
      unsubAuth();
    };
  }, [initialize]);
  
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AppReadyContext.Provider value={isAppReady}>
        <Toaster>{children}</Toaster>
      </AppReadyContext.Provider>
    </ThemeProvider>
  );
}
