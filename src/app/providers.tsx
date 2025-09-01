'use client';
import { useEffect } from 'react';
import { useUserStore } from '@/hooks/use-user';
import { initializeAppCheck, getToken, ReCaptchaV3Provider } from 'firebase/app-check';
import { ThemeProvider } from '@/components/theme-provider';
import Toaster from '@/components/ui/toaster';
import { app } from '@/lib/firebase.client';


let appInited = false;
export function Providers({ children }: { children: React.ReactNode }) {
  const { initializeAuth } = useUserStore();
  
  useEffect(() => {
    if (appInited) return;
    appInited = true;

    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_APPCHECK_DEBUG) {
        (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = process.env.NEXT_PUBLIC_APPCHECK_DEBUG;
    }

    const appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY!),
      isTokenAutoRefreshEnabled: true,
    });

    // Warm the token to avoid “first request denied” races
    getToken(appCheck, /* forceRefresh */ true).catch(() => {/* ignore; UI will still work */});
    
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
