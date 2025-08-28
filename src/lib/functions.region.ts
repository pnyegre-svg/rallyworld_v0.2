'use client';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { app } from '@/lib/firebase.client';

const region = process.env.NEXT_PUBLIC_FB_FUNCTIONS_REGION || 'europe-central2';
export const fns = getFunctions(app, region);

// Optional: keep emulator toggle for local dev
if (process.env.NEXT_PUBLIC_USE_FUNCTIONS_EMULATOR === 'true') {
  connectFunctionsEmulator(fns, 'localhost', 5001);
}
