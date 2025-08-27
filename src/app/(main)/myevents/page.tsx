
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
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getResizedImageUrl } from '@/lib/utils';

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
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map(event => (
                    <Card key={event.id} className="overflow-hidden flex flex-col">
                        <CardHeader className="p-0 relative h-40">
                             <Image
                                src={getResizedImageUrl(event.coverImage, '1200x630') || `https://picsum.photos/seed/${event.id}/400/200`}
                                alt={event.title}
                                data-ai-hint="rally racing"
                                fill
                                className="object-cover"
                            />
                             <div className="absolute -bottom-10 left-6">
                                <Avatar className="h-20 w-20 border-4 border-card shadow-md">
                                    <AvatarImage src={getResizedImageUrl(event.logoImage, '512x512')} alt={`${event.title} logo`} />
                                    <AvatarFallback><Award /></AvatarFallback>
                                </Avatar>
                             </div>
                        </CardHeader>
                        <CardContent className="pt-16 flex-grow">
                           <CardTitle className="font-headline text-lg">{event.title}</CardTitle>
                           <CardDescription className="text-xs">
                             {format(event.dates.from, 'LLL dd, y')} - {format(event.dates.to, 'LLL dd, y')}
                           </CardDescription>
                        </CardContent>
                        <CardFooter className="bg-muted/50 p-2 gap-2">
                             <Button asChild variant="outline" size="sm" className="w-full">
                                <Link href={`/organizer/event/view/${event.id}`}>
                                    <Eye className="mr-2 h-4 w-4" /> View
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="sm" className="w-full">
                                <Link href={`/organizer/event/edit/${event.id}`}>
                                    <PenSquare className="mr-2 h-4 w-4" /> Edit
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        ) : (
             <Card className="flex flex-col items-center justify-center py-20 text-center">
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
             </Card>
        )}
    </div>
  );
}
