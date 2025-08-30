
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { useUserStore } from '@/hooks/use-user';
import { Eye, MapPin, PenSquare, PlusCircle } from 'lucide-react';
import { getEvents, type Event } from '@/lib/events';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';
import { getResizedImageUrl } from '@/lib/utils';
import { getUser } from '@/lib/users';
import type { User } from '@/lib/data';
import { db } from '@/lib/firebase.client';

export default function MyEventsPage() {
  const { user } = useUserStore();
  const [events, setEvents] = React.useState<Event[]>([]);
  const [organizers, setOrganizers] = React.useState<Record<string, User>>({});
  const [loading, setLoading] = React.useState(true);
  const isOrganizer = user.currentRole === 'organizer';

  React.useEffect(() => {
    async function loadEventsAndOrganizers() {
        setLoading(true);
        // This is where you would fetch all events from your database
        // For now, it will be empty as we don't have a full user list yet.
        const allEvents = await getEvents(db);
        setEvents(allEvents);

        // Fetch unique organizer details
        const organizerIds = [...new Set(allEvents.map(e => e.organizerId))];
        const organizerData: Record<string, User> = {};
        for (const id of organizerIds) {
            const orgUser = await getUser(db, id);
            if (orgUser) {
                organizerData[id] = orgUser;
            }
        }
        setOrganizers(organizerData);
        setLoading(false);
    }
    loadEventsAndOrganizers();
  }, [])

  const LoadingSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4">
                     <div className="flex gap-4 items-start">
                        <div className="flex flex-col items-center">
                            <Skeleton className="h-5 w-8 mb-1" />
                            <Skeleton className="h-8 w-10" />
                        </div>
                        <div className="flex-1 space-y-2">
                             <Skeleton className="h-6 w-3/4" />
                             <Skeleton className="h-4 w-1/2" />
                             <Skeleton className="h-4 w-2/3" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        ))}
    </div>
    );

  const getOrganizerName = (organizerId: string) => {
    return organizers[organizerId]?.organizerProfile?.name || 'Unknown Organizer';
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold font-headline">Upcoming Events</h1>
             {isOrganizer && (
                <Button size="sm" className="gap-1 bg-accent hover:bg-accent/90" asChild>
                    <Link href="/organizer/create-event">
                        <PlusCircle className="h-4 w-4" />
                        Create New Event
                    </Link>
                </Button>
            )}
        </div>
      
      {loading ? (
            <LoadingSkeletons />
        ) : events.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {events.map(event => (
                    <Card key={event.id} className="overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col">
                        <Link href={`/events/${event.id}`} className="block relative h-48 w-full group">
                            <Image
                                src={getResizedImageUrl(event.coverImage, '400x200') || `https://picsum.photos/seed/${event.id}/400/200`}
                                alt={event.title}
                                data-ai-hint="rally racing"
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center p-4">
                                {event.logoImage && (
                                    <Image 
                                        src={getResizedImageUrl(event.logoImage, '512x256')!}
                                        alt={`${event.title} logo`}
                                        width={160}
                                        height={80}
                                        className="object-contain drop-shadow-lg"
                                    />
                                )}
                            </div>
                        </Link>
                        <CardContent className="p-4 flex-grow flex flex-col">
                           <div className="flex gap-4 items-start flex-grow">
                                <div className="flex flex-col items-center text-center">
                                    <p className="font-mono text-sm uppercase text-accent">{format(event.dates.from, 'MMM')}</p>
                                    <p className="font-headline text-3xl font-bold">{format(event.dates.from, 'dd')}</p>
                                </div>
                                <div className="flex flex-col flex-grow">
                                    <h3 className="font-headline text-lg font-bold leading-tight">{event.title}</h3>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1.5"><MapPin className="h-3 w-3"/>{event.hqLocation}</p>
                                    <p className="text-xs text-muted-foreground mt-1">by {getOrganizerName(event.organizerId)}</p>
                                </div>
                           </div>
                            <div className="mt-4 flex gap-2">
                                 <Button asChild variant="outline" size="sm" className="w-full relative z-10">
                                    <Link href={`/events/${event.id}`}>
                                        <Eye className="mr-2 h-4 w-4" /> View
                                    </Link>
                                </Button>
                                {isOrganizer && user.organizerProfile?.id === event.organizerId && (
                                    <Button asChild variant="secondary" size="sm" className="w-full relative z-10">
                                        <Link href={`/organizer/event/edit/${event.id}`}>
                                            <PenSquare className="mr-2 h-4 w-4" /> Edit
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        ) : (
             <Card className="relative flex flex-col items-center justify-center py-20 text-center overflow-hidden bg-muted/30">
                <Image 
                    src="https://images.unsplash.com/photo-1599751495924-e22129413b4e?w=800&q=80"
                    alt="Empty rally stage"
                    data-ai-hint="empty road rally"
                    fill
                    className="object-cover opacity-10"
                />
                <div className="z-10">
                    <CardContent className="space-y-4">
                        <h2 className="text-2xl font-headline">No upcoming events</h2>
                        <p className="text-muted-foreground">Check back later or create your first event if you're an organizer.</p>
                       {isOrganizer && (
                         <Button className="bg-accent hover:bg-accent/90" asChild>
                            <Link href="/organizer/create-event">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Create Your First Event
                            </Link>
                        </Button>
                       )}
                    </CardContent>
                </div>
             </Card>
        )}
    </div>
  );
}
