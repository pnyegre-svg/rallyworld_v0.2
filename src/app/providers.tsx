
'use client';

import * as React from 'react';
import { useUserStore } from '@/hooks/use-user';
import Loading from '@/app/(main)/loading';

export function Providers({ children }: { children: React.ReactNode }) {
    const { isAuthReady, initializeAuth } = useUserStore();

    React.useEffect(() => {
        const unsubscribe = initializeAuth();
        return () => unsubscribe();
    }, [initializeAuth]);

    if (!isAuthReady) {
        return <div className="flex h-screen items-center justify-center"><Loading /></div>
    }
    
    return <>{children}</>;
}
