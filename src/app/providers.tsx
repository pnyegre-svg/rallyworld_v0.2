
'use client';
import { useEffect } from 'react';
import { initAppCheck } from '@/lib/app-check';
import { ThemeProvider } from '@/components/theme-provider';
import { getToken, getAppCheck } from 'firebase/app-check';
import { app } from '@/lib/firebase';

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => { 
    initAppCheck(); 

    const verifyAppCheck = async () => {
      try {
        // Correctly get the AppCheck instance from the initialized Firebase app
        const appCheck = getAppCheck(app);
        const token = await getToken(appCheck, /* forceRefresh */ false);
        console.log('AppCheck token successfully retrieved:', token.token);
      } catch (error) {
        console.error('AppCheck token error:', error);
      }
    };

    // Only run verification in development to avoid console noise in production
    if (process.env.NODE_ENV === 'development') {
      verifyAppCheck();
    }

  }, []);
  
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
