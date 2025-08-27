
'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { EventHeader } from './event-header';
import { EventTabs } from './event-tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { getEvent, Event } from '@/lib/events';
import { useUserStore } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { getUser } from '@/lib/users';
import { User } from '@/lib/data';


export default function ViewEventPage() {
  const params = useParams();
  const eventId = params.id as string;
  const [event, setEvent] = React.useState<Event | null>(null);
  const [organizer, setOrganizer] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const { user } = useUserStore();
  const { toast } = useToast();
  const router = useRouter();


  React.useEffect(() => {
    if (eventId) {
      const fetchEventData = async () => {
        setLoading(true);
        const eventData = await getEvent(eventId);
         if (eventData) {
            // Note: In a real app, you'd have security rules to prevent unauthorized access.
            // This is a client-side check for prototyping purposes.
            if (eventData.organizerId !== user.organizerProfile?.id && user.currentRole === 'organizer') {
                 toast({
                    title: "Access Denied",
                    description: "You do not have permission to view this event's details.",
                    variant: "destructive",
                });
                router.push('/dashboard');
                return;
            }
            setEvent(eventData);

            // Fetch organizer details
            const organizerData = await getUser(eventData.organizerId);
            setOrganizer(organizerData);

        } else {
            toast({
                title: "Event Not Found",
                description: "The event you are looking for does not exist.",
                variant: "destructive",
            });
            router.push('/dashboard');
        }
        setLoading(false);
      };
      fetchEventData();
    }
  }, [eventId, user.organizerProfile?.id, router, toast, user.currentRole]);


  if (loading) {
    return (
        <div className="space-y-8">
            <Skeleton className="h-[450px] w-full rounded-2xl" />
            <div className="space-y-4">
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-64 w-full" />
            </div>
        </div>
    )
  }

  if (!event) {
    // This will usually be handled by the loading state and redirect, but it's a good fallback.
    return <div>Event not found.</div>;
  }

  return (
    <div className="w-full mx-auto space-y-8">
        <EventHeader event={event} organizerName={organizer?.organizerProfile?.name} />
        <EventTabs event={event} />
    </div>
  );
}
