
'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { useEventStore } from '@/hooks/use-event-store';
import { EventHeader } from './event-header';
import { EventTabs } from './event-tabs';
import { Skeleton } from '@/components/ui/skeleton';

export default function ViewEventPage() {
  const params = useParams();
  const { events } = useEventStore();
  const eventId = params.id as string;
  const event = events.find(e => e.id === eventId);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (event) {
      setLoading(false);
    }
  }, [event]);


  if (loading) {
    return (
        <div className="space-y-4">
            <Skeleton className="h-[400px] w-full" />
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-64 w-full" />
        </div>
    )
  }

  if (!event) {
    return <div>Event not found.</div>;
  }

  return (
    <div className="w-full mx-auto space-y-8">
        <EventHeader event={event} />
        <EventTabs event={event} />
    </div>
  );
}
