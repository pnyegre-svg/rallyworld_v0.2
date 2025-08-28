
'use client';

import * as React from 'react';
import { useUserStore } from '@/hooks/use-user';
import Loading from '@/app/(main)/loading';
import { initializeFirebaseAppCheck } from '@/lib/app-check';

// This is a one-time initialization component.
let firebaseInitialized = false;

export function Providers({ children }: { children: React.ReactNode }) {
    const { initializeAuth } = useUserStore();
    const [isReady, setIsReady] = React.useState(false);

    React.useEffect(() => {
        if (!firebaseInitialized) {
            console.log('Initializing Firebase Auth and App Check...');
            
            // Initialize App Check
            initializeFirebaseAppCheck();

            // Initialize Auth State Listener
            const unsubscribe = initializeAuth();
            firebaseInitialized = true;
            console.log('Firebase initialization complete.');

            // We can now consider the app ready.
            setIsReady(true);
            
            // Cleanup subscription on component unmount
            return () => unsubscribe();
        } else {
            // If already initialized, just set to ready.
            setIsReady(true);
        }
    }, [initializeAuth]);

    if (!isReady) {
        return <div className="flex h-screen items-center justify-center"><Loading /></div>
    }
    
    return <>{children}</>;
}
