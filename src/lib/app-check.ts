
'use client';

import { initializeAppCheck, ReCaptchaV3Provider, AppCheck } from 'firebase/app-check';
import { app } from './firebase';

let appCheckInstance: AppCheck | undefined;
let appCheckReady: Promise<void>;

export function initAppCheck() {
  if (appCheckInstance || typeof window === 'undefined') {
    return;
  }
  
  appCheckReady = new Promise((resolve) => {
    // For development environments, explicitly set the debug token flag to true.
    // This forces the SDK to generate and log a debug token in the browser console.
    if (process.env.NODE_ENV === 'development') {
      (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }

    appCheckInstance = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(process.env.NEXT_PUBLIC_FB_APPCHECK_SITE_KEY!),
      isTokenAutoRefreshEnabled: true,
    });
    
    // The App Check SDK is ready once it's initialized.
    // The first token exchange will happen automatically on the first Firebase service call.
    resolve();
  });
}

// Export the promise so other parts of the app can wait for it.
export { appCheckReady };
