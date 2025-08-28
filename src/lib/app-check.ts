
'use client';

import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { getFirebaseApp } from './firebase';

let inited = false;
export function initAppCheck() {
    if (inited || typeof window === 'undefined') return;
    const app = getFirebaseApp(); // Get the initialized app instance
    (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = process.env.NEXT_PUBLIC_FB_APPCHECK_DEBUG_TOKEN;
    initializeAppCheck(app, { provider: new ReCaptchaV3Provider(process.env.NEXT_PUBLIC_FB_APPCHECK_SITE_KEY!), isTokenAutoRefreshEnabled: true });
    inited = true;
}
