
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getRedirectResult, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
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
        } else if (isSignInWithEmailLink(auth, window.location.href)) {
            // This was an email link sign-in redirect
            let email = window.localStorage.getItem('emailForSignIn');
            if (!email) {
                // This can happen if the user opens the link on a different device.
                // Ask the user to provide their email.
                email = window.prompt('Please provide your email for confirmation');
            }
            if(email) {
                const result = await signInWithEmailLink(auth, email, window.location.href);
                window.localStorage.removeItem('emailForSignIn');
                if (result) {
                    router.push('/dashboard');
                }
            }
        } else {
            // No redirect result, maybe a direct navigation, send to sign-in
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
        <p>Please wait, authenticating...</p>
    </div>
  );
}
