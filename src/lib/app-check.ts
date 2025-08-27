
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { FirebaseApp } from 'firebase/app';

let appCheckReadyResolver: (value: unknown) => void;

// A promise that resolves when App Check is initialized.
export const appCheckReady = new Promise(resolve => {
  appCheckReadyResolver = resolve;
});

export function initAppCheck(app: FirebaseApp) {
  if (typeof window === 'undefined') {
    return;
  }
  
  // Set debug token to true in development to generate a debug token in the console
  // This will be ignored in production.
  if (process.env.NODE_ENV === 'development') {
    (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }

  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(process.env.NEXT_PUBLIC_FB_APPCHECK_SITE_KEY!),
    isTokenAutoRefreshEnabled: true,
  });
  
  // Signal that App Check is ready.
  appCheckReadyResolver(true);
}
