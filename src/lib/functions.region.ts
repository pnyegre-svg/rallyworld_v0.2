
'use client';
import { fns } from './firebase.client';

// The functions instance is now initialized in providers.tsx and accessed via firebase.client.ts
// This file is kept for compatibility with existing imports, but simply re-exports the instance.
export { fns };
