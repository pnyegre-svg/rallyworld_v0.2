
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useUserStore } from '@/hooks/use-user';
import { Eye, PenSquare, PlusCircle, Award } from 'lucide-react';
import { getEvents, Event } from '@/lib/events';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';
import { getResizedImageUrl } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function MyEventsPage() {
  const { user } = useUserStore();
  const [events, setEvents] = React.useState<Event[]>([]);
  const [loading, setLoading] = React.useState(true);
  const isOrganizer = user.currentRole === 'organizer';

  React.useEffect(() => {
    if (isOrganizer && user.organizerProfile?.id) {
      const fetchEvents = async () => {
        setLoading(true);
        const organizerEvents = await getEvents(user.organizerProfile.id);
        setEvents(organizerEvents);
        setLoading(false);
      };
      fetchEvents();
    } else {
      setLoading(false);
    }
  }, [isOrganizer, user.organizerProfile?.id]);

  if (!isOrganizer) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>My Events</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-center text-muted-foreground h-24 flex items-center justify-center">
                    Event management is available for organizers.
                </p>
            </CardContent>
        </Card>
    )
  }

  const LoadingSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
                <Skeleton className="h-40 w-full" />
                <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardFooter className="gap-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardFooter>
            </Card>
        ))}
    </div>
    );

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold font-headline">My Events</h1>
             <Button size="sm" className="gap-1 bg-accent hover:bg-accent/90" asChild>
                <Link href="/organizer/create-event">
                    <PlusCircle className="h-4 w-4" />
                    Create New Event
                </Link>
            </Button>
        </div>
      
      {loading ? (
            <LoadingSkeletons />
        ) : events.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {events.map(event => (
                    <Card key={event.id} className="group relative overflow-hidden rounded-xl text-primary-foreground shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105">
                         <Link href={`/organizer/event/view/${event.id}`} className="absolute inset-0 z-10">
                            <span className="sr-only">View Event</span>
                         </Link>
                         <Image
                            src={getResizedImageUrl(event.coverImage, '400x200') || `https://picsum.photos/seed/${event.id}/400/200`}
                            alt={event.title}
                            data-ai-hint="rally racing"
                            width={400}
                            height={400}
                            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                        />
                         <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
                         
                         {event.logoImage && (
                             <div className="absolute top-4 right-4 z-20">
                                <Image
                                    src={getResizedImageUrl(event.logoImage, '200x200')!}
                                    alt={`${event.title} logo`}
                                    width={100}
                                    height={50}
                                    className="object-contain drop-shadow-lg"
                                />
                            </div>
                         )}

                         <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 z-20">
                            <h3 className="text-xl md:text-2xl font-headline font-bold">{event.title}</h3>
                            <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider">
                                {format(new Date(event.dates.from), 'MMM dd')} - {format(new Date(event.dates.to), 'MMM dd, yyyy')}
                            </p>
                            <div className="mt-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                 <Button asChild variant="outline" size="sm" className="bg-background/20 backdrop-blur-sm border-white/20 hover:bg-white/30 z-30 relative">
                                    <Link href={`/organizer/event/view/${event.id}`}>
                                        <Eye className="mr-2 h-4 w-4" /> View
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" size="sm" className="bg-background/20 backdrop-blur-sm border-white/20 hover:bg-white/30 z-30 relative">
                                    <Link href={`/organizer/event/edit/${event.id}`}>
                                        <PenSquare className="mr-2 h-4 w-4" /> Edit
                                    </Link>
                                </Button>
                            </div>
                         </div>
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
                        <h2 className="text-2xl font-headline">You haven't created any events yet</h2>
                        <p className="text-muted-foreground">Get started by creating your first rally event.</p>
                        <Button className="bg-accent hover:bg-accent/90" asChild>
                            <Link href="/organizer/create-event">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Create Your First Event
                            </Link>
                        </Button>
                    </CardContent>
                </div>
             </Card>
        )}
    </div>
  );
}
