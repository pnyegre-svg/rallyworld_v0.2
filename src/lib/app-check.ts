
'use client';

import { app } from '@/lib/firebase';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

export function initializeFirebaseAppCheck() {
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
}
