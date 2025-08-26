'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { MainNav } from '@/components/main-nav';
import { PageHeader } from '@/components/page-header';
import { getRedirectResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  React.useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          // User signed in successfully.
          // You can access user info from result.user
          // Redirect to the dashboard or the desired page.
          router.push('/dashboard');
        }
      } catch (error: any) {
        toast({
          title: 'Sign in failed',
          description: error.message,
          variant: 'destructive',
        });
      }
    };

    checkRedirectResult();
  }, [router, toast]);


  const getTitle = (path: string) => {
    if (path.startsWith('/dashboard')) return 'Dashboard';
    if (path.startsWith('/stages')) return 'Stages';
    if (path.startsWith('/competitors')) return 'Competitors';
    if (path.startsWith('/leaderboard')) return 'Leaderboard';
    if (path.startsWith('/admin')) return 'Admin';
    if (path.startsWith('/community')) return 'Community';
    if (path.startsWith('/marketplace')) return 'Marketplace';
    if (path.startsWith('/shop')) return 'Shop';
    if (path.startsWith('/news')) return 'News';
    return 'Rally World';
  };
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <MainNav />
        <SidebarInset className="flex flex-col">
          <PageHeader title={getTitle(pathname)} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
