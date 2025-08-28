
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';

let _app: FirebaseApp | undefined;

export function getFirebaseApp(): FirebaseApp {
  if (_app) return _app;

  if (getApps().length > 0) {
    _app = getApp();
    return _app;
  }
  
  _app = initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FB_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FB_AUTH_DOMAIN!,
    projectId: process.env.NEXT_PUBLIC_FB_PROJECT_ID!,
    storageBucket: process.env.NEXT_PUBLIC_FB_STORAGE_BUCKET!,
    appId: process.env.NEXT_PUBLIC_FB_APP_ID!,
    messagingSenderId: process.env.NEXT_PUBLIC_FB_MESSAGING_SENDER_ID,
  });

  return _app;
}

export const auth = getAuth(getFirebaseApp());
export { getFirebaseApp as app };


// Helper that waits for auth to be ready
export async function requireUser(): Promise<User> {
  const existing = auth.currentUser;
  if (existing) return existing;
  return new Promise((resolve, reject) => {
    const unsub = onAuthStateChanged(auth, (u) => {
      unsub();
      if (u) resolve(u);
      else reject(new Error('Not signed in'));
    });
  });
}
