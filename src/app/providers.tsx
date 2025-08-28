
'use client';

import * as React from 'react';
import { useUserStore } from '@/hooks/use-user';
import Loading from '@/app/(main)/loading';
import { app } from '@/lib/firebase';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

// This is a one-time initialization component.
let firebaseInitialized = false;

export function Providers({ children }: { children: React.ReactNode }) {
    const { initializeAuth } = useUserStore();
    const [isReady, setIsReady] = React.useState(false);

    React.useEffect(() => {
        if (!firebaseInitialized) {
            console.log('Initializing Firebase and App Check...');
            // In development, use the debug token from the .env.local file
            // This will be ignored in production.
            if (process.env.NODE_ENV === 'development') {
                (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = process.env.NEXT_PUBLIC_FB_APPCHECK_DEBUG_TOKEN;
            }

            // Initialize App Check
            initializeAppCheck(app, {
                provider: new ReCaptchaV3Provider(process.env.NEXT_PUBLIC_FB_APPCHECK_SITE_KEY!),
                isTokenAutoRefreshEnabled: true,
            });

            // Initialize Auth State Listener
            const unsubscribe = initializeAuth();
            firebaseInitialized = true;
            console.log('Firebase initialization complete.');

            // We can now consider the app ready.
            setIsReady(true);
            
            // Cleanup subscription on component unmount
            return () => unsubscribe();
        } else {
            // If already initialized, just set to ready.
            setIsReady(true);
        }
    }, [initializeAuth]);

    if (!isReady) {
        return <div className="flex h-screen items-center justify-center"><Loading /></div>
    }
    
    return <>{children}</>;
}
