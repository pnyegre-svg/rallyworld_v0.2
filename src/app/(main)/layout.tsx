

'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { MainNav } from '@/components/main-nav';
import { PageHeader } from '@/components/page-header';
import { UserNav } from '@/components/user-nav';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Loading from './loading';
import { useUserStore } from '@/hooks/use-user';
import { ThemeToggle } from '@/components/theme-toggle';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';


export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, signInUser, signOutUser, isAuthReady } = useUserStore();

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // If we have a firebase user but no user in the store (e.g. page refresh),
        // or the email doesn't match, we need to fetch their profile.
        if (!user || user.email !== firebaseUser.email) {
            signInUser(firebaseUser.email!);
        }
      } else {
        // User is signed out.
        signOutUser();
        router.push('/auth/sign-in');
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [router, user, signInUser, signOutUser]);

  const getTitle = (path: string) => {
    if (path.startsWith('/dashboard')) return 'Dashboard';
    if (path.startsWith('/myevents')) return 'My Events';
    if (path.startsWith('/competitors')) return 'Competitors';
    if (path.startsWith('/leaderboard')) return 'Leaderboard';
    if (path.startsWith('/admin')) return 'Admin';
    if (path.startsWith('/organizer/create-event')) return 'Create Event';
    if (path.startsWith('/organizer/event/edit')) return 'Edit Event';
    if (path.startsWith('/organizer/event/view')) return 'Event Details';
    if (path.startsWith('/organizer')) return 'Club Profile';
    if (path.startsWith('/profile')) return 'My Profile';
    if (path.startsWith('/feed')) return 'Feed';
    if (path.startsWith('/marketplace')) return 'Marketplace';
    if (path.startsWith('/shop')) return 'MyShop';
    if (path.startsWith('/news')) return 'News';
    return 'Rally World';
  };
  
  // This is the crucial check. We wait for both the initial loading AND the auth/profile readiness.
  if (isLoading || !isAuthReady) {
    return <Loading />;
  }
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <MainNav />
        <SidebarInset className="flex flex-col">
           <PageHeader title={getTitle(pathname)}>
              <div className="flex items-center gap-2">
                 <SidebarTrigger className="md:hidden" />
              </div>
             <div className="ml-auto flex items-center gap-4">
               <Button variant="ghost" size="icon" className="rounded-full hidden md:flex">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
              </Button>
              <UserNav />
              <ThemeToggle />
            </div>
          </PageHeader>
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
