import { initializeApp, applicationDefault } from 'firebase-admin/app';
// One-time global Admin initialization (works in emulators & prod)
initializeApp({ credential: applicationDefault() });
