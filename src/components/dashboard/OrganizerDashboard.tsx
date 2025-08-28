
'use client';

import * as React from 'react';
import { useUserStore } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { getDashboardSummary, DashboardSummary } from '@/lib/dashboard';

import { QuickActions } from './QuickActions';
import { TodayStages } from './TodayStages';
import { EntriesAndPayments } from './EntriesAndPayments';
import { UpcomingStages } from './UpcomingStages';
import { Announcements } from './Announcements';

export function OrganizerDashboard() {
  const { user } = useUserStore();
  const { toast } = useToast();
  const [summary, setSummary] = React.useState<DashboardSummary | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user?.id || user?.currentRole !== 'organizer') {
        setLoading(false);
        return;
    }

    setLoading(true);
    const unsubscribe = getDashboardSummary(user.id, (data) => {
        setSummary(data);
        if (loading) setLoading(false);
    }, (error) => {
        console.error(error);
        toast({
            title: "Error loading dashboard",
            description: "Could not fetch your dashboard summary. Please try again later.",
            variant: "destructive",
        });
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.id, user?.currentRole, toast]);


  if (loading) {
      return (
            <div className="space-y-6">
              <Skeleton className="h-24 w-full" />
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
              <TodayStages summary={summary} />
              <EntriesAndPayments summary={summary} />
              <UpcomingStages />
              <Announcements summary={summary} />
          </div>
      </div>
  );
}
