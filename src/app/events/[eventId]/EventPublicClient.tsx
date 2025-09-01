
'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { EventHeader } from './event-header';
import { Skeleton } from '@/components/ui/skeleton';
import { getEvent, type Event } from '@/lib/events';
import { useUserStore } from '@/hooks/use-user';
import { useToast } from '@/components/ui/toaster';
import { useRouter } from 'next/navigation';
import { getUser } from '@/lib/users';
import type { User } from '@/lib/data';
import { db } from '@/lib/firebase.client';
import { listAnnouncements, type Announcement } from '@/lib/announcements.client';

export default function EventPublicClient({ eventId }: { eventId: string }) {
  const searchParams = useSearchParams();
  const [event, setEvent] = React.useState<Event | null>(null);
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
  const [organizer, setOrganizer] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  
  const initialTab = searchParams.get('tab') || 'results';
  const [activeTab, setActiveTab] = React.useState(initialTab);
  
  const { user } = useUserStore();
  const { push: toast } = useToast();
  const router = useRouter();


  React.useEffect(() => {
    if (eventId) {
      const fetchEventData = async () => {
        setLoading(true);
        const eventData = await getEvent(db, eventId);
         if (eventData) {
            setEvent(eventData);
            if (eventData.livestreamLink && !searchParams.get('tab')) {
                setActiveTab('livestream');
            }

            // Fetch organizer details
            const organizerData = await getUser(db, eventData.organizerId);
            setOrganizer(organizerData);

            // Fetch announcements
            const isOrganizer = user?.id === eventData.organizerId;
            const announcementsData = await listAnnouncements(eventId, !isOrganizer);
            setAnnouncements(announcementsData);

        } else {
            toast({
                text: "The event you are looking for does not exist.",
                kind: "error",
            });
            router.push('/dashboard');
        }
        setLoading(false);
      };
      fetchEventData();
    }
  }, [eventId, router, toast, searchParams, user?.id]);


  if (loading) {
    return (
        <div className="container py-8">
            <div className="space-y-8">
                <Skeleton className="h-[450px] w-full rounded-2xl" />
                <div className="space-y-4">
                    <Skeleton className="h-10 w-1/2" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        </div>
    )
  }

  if (!event) {
    // This will usually be handled by the loading state and redirect, but it's a good fallback.
    return <div className="container py-8">Event not found.</div>;
  }

  return (
    <div className="container w-full py-8">
        <EventHeader 
            event={event} 
            organizerName={organizer?.organizerProfile?.name} 
            setEvent={setEvent} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            announcements={announcements} 
        />
    </div>
  );
}
