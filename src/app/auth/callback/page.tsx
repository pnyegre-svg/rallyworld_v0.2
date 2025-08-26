
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getRedirectResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useUserStore } from '@/hooks/use-user';
import { users } from '@/lib/data';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { setUser } = useUserStore();

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
            // This was a Google Sign-in redirect
            const isNewUser = result.user.metadata.creationTime === result.user.metadata.lastSignInTime;

            // Update user state for demo purposes. In a real app, you'd fetch/create a user profile from your DB.
             const demoUser = users.find(u => u.role === 'fan')!;
             setUser({
                ...demoUser,
                name: result.user.displayName || 'New User',
                email: result.user.email || '',
                avatar: result.user.photoURL || demoUser.avatar,
             });

            if (isNewUser) {
                router.push('/auth/choose-role');
            } else {
                router.push('/dashboard');
            }
        } else {
             // If there's no result, it might be a direct navigation.
             // It's safe to just redirect to the main sign-in page.
            router.push('/auth/sign-in');
        }
      } catch (error: any) {
        toast({
          title: 'Authentication failed',
          description: error.message,
          variant: 'destructive',
        });
        router.push('/auth/sign-in');
      }
    };

    handleRedirect();
  }, [router, toast, setUser]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
        <p>Please wait, completing sign-in...</p>
    </div>
  );
}
