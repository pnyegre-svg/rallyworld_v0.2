
'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { MainNav } from '@/components/main-nav';
import { PageHeader } from '@/components/page-header';
import { UserNav } from '@/components/user-nav';
import Loading from './loading';
import { useUserStore } from '@/hooks/use-user';
import { ThemeToggle } from '@/components/theme-toggle';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Bell, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';


export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthReady } = useUserStore();

  React.useEffect(() => {
    if (isAuthReady && !user) {
        router.push('/auth/sign-in');
    }
  }, [isAuthReady, user, router]);


  const getTitle = (path: string) => {
    if (path.startsWith('/dashboard')) return 'Dashboard';
    if (path.startsWith('/myevents')) return 'My Events';
    if (path.startsWith('/entries')) return 'Manage Entries';
    if (path.startsWith('/competitors')) return 'Competitors';
    if (path.startsWith('/leaderboard')) return 'Leaderboard';
    if (path.startsWith('/admin')) return 'Admin';
    if (path.startsWith('/organizer/create-event')) return 'Create Event';
    if (path.startsWith('/organizer/event/edit')) return 'Edit Event';
    if (path.startsWith('/organizer/event/view')) return 'Event Details';
    if (path.match(/^\/organizer\/[a-zA-Z0-9_-]+$/)) return 'Club Profile';
    if (path.startsWith('/organizer')) return 'My Club Profile';
    if (path.startsWith('/profile')) return 'My Profile';
    if (path.startsWith('/feed')) return 'Feed';
    if (path.startsWith('/marketplace')) return 'Marketplace';
    if (path.startsWith('/shop')) return 'MyShop';
    if (path.startsWith('/news')) return 'News';
    if (path.startsWith('/announcements/new')) return 'New Announcement';
    if (path.startsWith('/announcements/edit')) return 'Edit Announcement';
    if (path.startsWith('/announcements')) return 'Announcements';
    return 'Rally World';
  };
  
  if (!isAuthReady || !user) {
    return <div className="flex h-screen items-center justify-center"><Loading /></div>;
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
                <div className="relative ml-auto flex-1 md:grow-0">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search events, competitors..."
                        className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                    />
                </div>
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
