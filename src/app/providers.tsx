
'use client';

import * as React from 'react';
import { useUserStore } from '@/hooks/use-user';
import Loading from '@/app/(main)/loading';
import { db } from '@/lib/firebase.client';
import { enableIndexedDbPersistence } from 'firebase/firestore';

// This is a one-time initialization component.
let persistenceInitialized = false;

export function Providers({ children }: { children: React.ReactNode }) {
    const { initializeAuth } = useUserStore();
    const [isReady, setIsReady] = React.useState(false);

    React.useEffect(() => {
        console.log('Initializing Firebase Auth...');
        
        // Initialize Auth State Listener
        const unsubscribe = initializeAuth();
        console.log('Firebase initialization complete.');
        
        // Enable Firestore persistence
        if (typeof window !== 'undefined' && !persistenceInitialized) {
          enableIndexedDbPersistence(db).then(() => {
              persistenceInitialized = true;
              console.log('Firestore persistence enabled.');
          }).catch((error) => {
              if (error.code == 'failed-precondition') {
                  console.warn('Firestore persistence failed to initialize. Multiple tabs open?');
              } else if (error.code === 'unimplemented') {
                  console.log('Firestore persistence is not available in this environment.');
              } else {
                  console.error('Error initializing Firestore persistence:', error);
              }
          });
        }


        // We can now consider the app ready.
        setIsReady(true);
        
        // Cleanup subscription on component unmount
        return () => unsubscribe();
    }, [initializeAuth]);

    if (!isReady) {
        return <div className="flex h-screen items-center justify-center"><Loading /></div>
    }
    
    return <>{children}</>;
}
