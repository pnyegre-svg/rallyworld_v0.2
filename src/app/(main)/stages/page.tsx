
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useUserStore } from '@/hooks/use-user';
import { Eye, PenSquare, PlusCircle } from 'lucide-react';
import { getEvents, Event } from '@/lib/events';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import Link from 'next/link';

export default function StagesPage() {
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>My Events</CardTitle>
        <Button size="sm" className="gap-1 bg-accent hover:bg-accent/90" asChild>
            <Link href="/organizer/create-event">
                <PlusCircle className="h-4 w-4" />
                Create New Event
            </Link>
        </Button>
      </CardHeader>
      <CardContent>
      {loading ? (
            <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event Title</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead className="text-center">Stages</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
          {events.length > 0 ? events.map(event => (
                <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell className="text-muted-foreground">
                        {format(event.dates.from, 'LLL dd, y')} - {format(event.dates.to, 'LLL dd, y')}
                    </TableCell>
                    <TableCell className="text-center font-mono">{event.stages.length}</TableCell>
                    <TableCell className="text-right space-x-2">
                        <Button asChild variant="outline" size="sm">
                            <Link href={`/organizer/event/view/${event.id}`}>
                                <Eye className="mr-2 h-4 w-4" /> View
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                            <Link href={`/organizer/event/edit/${event.id}`}>
                                <PenSquare className="mr-2 h-4 w-4" /> Edit
                            </Link>
                        </Button>
                    </TableCell>
                </TableRow>
            )) : (
                <TableRow>
                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                        You haven't created any events yet.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
        )}
      </CardContent>
    </Card>
  );
}
