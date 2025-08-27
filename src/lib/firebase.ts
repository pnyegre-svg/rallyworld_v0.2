
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

const firebaseConfig = {
  projectId: 'rally-world',
  appId: '1:67027100425:web:832f96f8228d9346e4a9d8',
  storageBucket: 'rally-world.firebasestorage.app',
  apiKey: 'AIzaSyD1SDoZo2M84Lqy6w6zbK3ZhWKtQcGQf-g',
  authDomain: 'rally-world.firebaseapp.com',
  measurementId: '',
  messagingSenderId: '67027100425',
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize App Check on the client
if (typeof window !== 'undefined') {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!),
    isTokenAutoRefreshEnabled: true,
  });
}

// Initialize and export Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
