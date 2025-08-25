'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { MainNav } from '@/components/main-nav';
import { PageHeader } from '@/components/page-header';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const getTitle = (path: string) => {
    if (path.startsWith('/dashboard')) return 'Dashboard';
    if (path.startsWith('/stages')) return 'Stages';
    if (path.startsWith('/competitors')) return 'Competitors';
    if (path.startsWith('/leaderboard')) return 'Leaderboard';
    if (path.startsWith('/admin')) return 'Admin';
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
