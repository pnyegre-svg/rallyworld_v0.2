'use client';
import { useEffect } from 'react';
import { useUserStore } from '@/hooks/use-user';
import { initializeAppCheck, getToken, ReCaptchaV3Provider } from 'firebase/app-check';
import { ThemeProvider } from '@/components/theme-provider';
import Toaster from '@/components/ui/toaster';
import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator }from 'firebase/functions';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FB_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FB_AUTH_DOMAIN!,
    projectId: process.env.NEXT_PUBLIC_FB_PROJECT_ID!,
    storageBucket: process.env.NEXT_PUBLIC_FB_STORAGE_BUCKET!,
    appId: process.env.NEXT_PUBLIC_FB_APP_ID!,
};


let appInited = false;
export function Providers({ children }: { children: React.ReactNode }) {
  const { initialize, isAuthReady } = useUserStore();
  
  useEffect(() => {
    if (appInited || isAuthReady) return;
    appInited = true;

    const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const storage = getStorage(app);
    const region = process.env.NEXT_PUBLIC_FB_FUNCTIONS_REGION || 'europe-central2';
    const functions = getFunctions(app, region);

    if (process.env.NEXT_PUBLIC_USE_FUNCTIONS_EMULATOR === 'true') {
        connectFunctionsEmulator(functions, 'localhost', 5001);
    }
    
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_APPCHECK_DEBUG) {
        (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = process.env.NEXT_PUBLIC_APPCHECK_DEBUG;
    }

    const appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY!),
      isTokenAutoRefreshEnabled: true,
    });

    // Warm the token to avoid “first request denied” races
    getToken(appCheck, /* forceRefresh */ true).catch(() => {/* ignore; UI will still work */});
    
    const unsubscribe = initialize({ auth, db, storage, functions });
    return () => unsubscribe();
  }, [initialize, isAuthReady]);
  
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
