
'use client';

import * as React from 'react';
import { useUserStore } from '@/hooks/use-user';
import { useToast } from '@/components/ui/toaster';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardSummary } from '@/lib/dashboard';
import { watchSummary } from '@/lib/summary.client';

import { QuickActions } from './QuickActions';
import { TodayStages } from './TodayStages';
import { EntriesAndPayments } from './EntriesAndPayments';
import { UpcomingStages } from './UpcomingStages';
import { Announcements } from './Announcements';

export function OrganizerDashboard() {
  const { user } = useUserStore();
  const { push: toast } = useToast();
  const [summary, setSummary] = React.useState<DashboardSummary | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user?.id || user?.currentRole !== 'organizer') {
        setLoading(false);
        return;
    }

    setLoading(true);
    const unsubscribe = watchSummary(user.id, (data) => {
        setSummary(data as DashboardSummary);
        if (loading) setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.id, user?.currentRole, loading]);


  if (loading) {
      return (
            <div className="space-y-6">
              <Skeleton className="h-10 w-full" />
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <Skeleton className="h-64 w-full lg:col-span-2" />
                  <Skeleton className="h-64 w-full" />
                  <Skeleton className="h-64 w-full lg:col-span-3" />
                  <Skeleton className="h-64 w-full lg:col-span-3" />
              </div>
          </div>
      )
  }
  
  return (
      <div className="space-y-6">
          <QuickActions />

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <TodayStages stages={summary?.todayStages} />
              <EntriesAndPayments counters={summary?.counters} />
              <UpcomingStages />
              <Announcements items={summary?.latestAnnouncements} />
          </div>
      </div>
  );
}
