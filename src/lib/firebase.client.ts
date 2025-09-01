
'use client';

// This file is now a proxy to the services initialized in the `useUserStore`.
// This is to prevent multiple Firebase app instances.

import { useFirebaseServices } from '@/hooks/use-user';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { FirebaseStorage } from 'firebase/storage';
import { FirebaseFunctions } from 'firebase/functions';

// Throw a clear error if trying to access services before initialization.
const serviceError = (name: string) => {
    return () => {
        throw new Error(`${name} is not available. Ensure Firebase is initialized via the main Provider.`);
    }
}

// These are getters that will fetch the service from the hook when called.
export const auth: Auth = new Proxy({} as Auth, { get: (_, prop) => Reflect.get(useFirebaseServices().auth, prop) });
export const db: Firestore = new Proxy({} as Firestore, { get: (_, prop) => Reflect.get(useFirebaseServices().db, prop) });
export const storage: FirebaseStorage = new Proxy({} as FirebaseStorage, { get: (_, prop) => Reflect.get(useFirebaseServices().storage, prop) });
export const fns: FirebaseFunctions = new Proxy({} as FirebaseFunctions, { get: (_, prop) => Reflect.get(useFirebaseServices().functions, prop) });
