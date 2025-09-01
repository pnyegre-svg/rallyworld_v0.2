
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { UserNav } from '@/components/user-nav';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { Bell } from 'lucide-react';
import { getApps, initializeApp } from 'firebase/app';

// This page has its own lightweight firebase initialization
// because it does not use the main app layout (and thus the providers).
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FB_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FB_AUTH_DOMAIN!,
    projectId: process.env.NEXT_PUBLIC_FB_PROJECT_ID!,
    storageBucket: process.env.NEXT_PUBLIC_FB_STORAGE_BUCKET!,
    appId: process.env.NEXT_PUBLIC_FB_APP_ID!,
};
if (getApps().length === 0) {
  initializeApp(firebaseConfig);
}

export default function LandingPage() {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        router.push('/dashboard');
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
        <div className="flex flex-col min-h-[100dvh] bg-background items-center justify-center">
            <Image
              src="/RW_transp.svg"
              alt="Rally World Logo"
              width={80}
              height={80}
              className="animate-pulse"
            />
        </div>
    )
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link href="/" className="flex items-center justify-center" prefetch={false}>
          <Image src="/RW_txt5.svg" alt="Rally World Logo" width={120} height={35} />
          <span className="sr-only">Rally World</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          {user ? (
            <>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
              </Button>
              <UserNav />
              <ThemeToggle />
            </>
          ) : (
              <>
                <Button asChild variant="ghost">
                  <Link href="/auth/sign-in">Sign In</Link>
                </Button>
                <Button asChild className="bg-accent hover:bg-accent/90">
                  <Link href="/auth/sign-up">Sign Up</Link>
                </Button>
              </>
          )}
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <Image
                src="https://images.unsplash.com/photo-1548504240-3dd72f99dc72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxyYWxseXxlbnwwfHx8fDE3NTY1MzI0MTV8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Rally Car"
                data-ai-hint="rally car racing"
                width={1200}
                height={800}
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              />
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    Welcome to Rally World
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    The ultimate platform for managing and following rally sport competitions. Get live updates, track leaderboards, and manage your team.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
                    <Link href="/auth/sign-up" prefetch={false}>
                      Get Started
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 Rally World. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
