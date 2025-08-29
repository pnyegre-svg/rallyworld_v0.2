
'use client';

import * as React from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import type { Metadata } from 'next';
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
import { getResizedImageUrl } from '@/lib/utils';
import { doc, getDoc } from 'firebase/firestore';


export async function generateMetadata({ params }: { params: { eventId: string } }): Promise<Metadata> {
  const eventId = params.eventId;
  
  try {
    // This runs on the server, so we can't use the client-side `getEvent` directly
    // which uses the client db instance. We'll fetch directly.
    const eventDoc = await getDoc(doc(db, 'events', eventId));

    if (!eventDoc.exists()) {
        return {
            title: 'Event Not Found',
            description: 'The event you are looking for does not exist.',
        };
    }
    const event = eventDoc.data() as Event;
    const from = event.dates.from.toDate ? event.dates.from.toDate() : new Date(event.dates.from);
    
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const coverImage = getResizedImageUrl(event.coverImage, '1200x630') || `${siteUrl}/og-event.png`;

    const description = `${event.hqLocation} • ${from.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`;

    return {
        title: `${event.title} | Rally World`,
        description: description,
        openGraph: {
            title: event.title,
            description: description,
            url: `${siteUrl}/events/${eventId}`,
            siteName: 'Rally World',
            images: [
                {
                    url: coverImage,
                    width: 1200,
                    height: 630,
                    alt: event.title,
                },
            ],
            locale: 'en_US',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: event.title,
            description: description,
            images: [coverImage],
        },
    };
  } catch (error) {
      console.error("Error generating metadata:", error);
      return {
          title: 'Rally World Event',
          description: 'Join the excitement at a rally event near you.'
      }
  }
}


export default function ViewEventPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const eventId = params.eventId as string;
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
            const announcementsData = await listAnnouncements(eventId);
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
  }, [eventId, router, toast, searchParams]);


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
