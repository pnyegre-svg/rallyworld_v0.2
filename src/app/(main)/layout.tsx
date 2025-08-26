
'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { MainNav } from '@/components/main-nav';
import { PageHeader } from '@/components/page-header';
import { UserNav } from '@/components/user-nav';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Loading from './loading';
import { useUserStore } from '@/hooks/use-user';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUserStore();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/auth/sign-in');
      } else {
        setLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [router]);

  const getTitle = (path: string) => {
    if (path.startsWith('/dashboard')) return 'Dashboard';
    if (path.startsWith('/stages')) return 'Stages';
    if (path.startsWith('/competitors')) return 'Competitors';
    if (path.startsWith('/leaderboard')) return 'Leaderboard';
    if (path.startsWith('/admin')) return 'Admin';
    if (path.startsWith('/organizer/create-event')) return 'Create Event';
    if (path.startsWith('/organizer/event/edit')) return 'Edit Event';
    if (path.startsWith('/organizer/event/view')) return 'Event Details';
    if (path.startsWith('/organizer')) return 'Club Profile';
    if (path.startsWith('/community')) return 'Community';
    if (path.startsWith('/marketplace')) return 'Marketplace';
    if (path.startsWith('/shop')) return 'Shop';
    if (path.startsWith('/news')) return 'News';
    return 'Rally World';
  };
  
  if (loading) {
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
