
'use client';

import * as React from 'react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useUserStore } from '@/hooks/use-user';
import { stages, leaderboard, newsPosts } from '@/lib/data';
import { ArrowRight, Calendar, MapPin, Newspaper, Trophy, Flag, PlusSquare, PenSquare, Eye } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { getEvents, Event } from '@/lib/events';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { user } = useUserStore();
  const [events, setEvents] = React.useState<Event[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (user.organizerProfile?.id) {
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
  }, [user.organizerProfile?.id]);


  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return names[0].substring(0, 2);
  };
  
  const liveStage = stages.find(s => s.status === 'live');
  const upcomingStages = stages.filter(s => s.status === 'upcoming').slice(0, 3);
  const topCompetitor = leaderboard[0];
  const recentNews = newsPosts.slice(0, 2);
  const isOrganizer = user.currentRole === 'organizer';

  return (
    <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
             <Card className={cn(isOrganizer ? "lg:col-span-2" : "lg:col-span-1")}>
                <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-3xl font-bold font-headline">Welcome, {user.name.split(' ')[0]}!</h1>
                        <CardDescription>
                            Your role: <span className="font-semibold capitalize text-foreground">{user.currentRole.replace(/_/g, ' ')}</span>
                        </CardDescription>
                    </div>
                </CardHeader>
            </Card>

            {isOrganizer && (
                 <Card className="lg:col-span-1 p-0 relative overflow-hidden transition-all text-white bg-[length:200%_auto] bg-[linear-gradient(90deg,hsl(var(--accent))_0%,hsl(var(--orange))_50%,hsl(var(--accent))_100%)] hover:bg-[position:200%_0] animate-gradient-slide">
                    <Link href="/organizer/create-event" className="h-full w-full flex flex-col items-center justify-center p-6">
                        <PlusSquare className="h-12 w-12 mb-2" />
                        <h2 className="text-xl font-headline">Create Event</h2>
                    </Link>
                </Card>
            )}


            {!isOrganizer && liveStage && (
                 <Card className="lg:col-span-2 bg-accent/20 border-accent/50">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-accent">
                                <div className="w-3 h-3 rounded-full bg-accent animate-pulse" />
                                Live Event
                            </CardTitle>
                            <Badge variant="destructive">LIVE</Badge>
                        </div>
                        <CardDescription className="pt-2 text-2xl font-headline text-foreground">{liveStage.name}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between text-muted-foreground">
                        <div className="flex items-center gap-2">
                           <MapPin className="h-5 w-5"/>
                           <span>{liveStage.location}</span>
                        </div>
                         <div className="flex items-center gap-2">
                           <Flag className="h-5 w-5"/>
                           <span>{liveStage.distance.toFixed(2)} km</span>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/stages">Go to Stage <ArrowRight className="ml-2 h-4 w-4" /></Link>
                        </Button>
                    </CardContent>
                </Card>
            )}

            {!isOrganizer && !liveStage && topCompetitor && (
                 <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Trophy className="text-primary"/> Current Leader</CardTitle>
                        <CardDescription>Overall standings after the last stage.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={topCompetitor.competitor.avatar} alt={topCompetitor.competitor.name} />
                                <AvatarFallback>{getInitials(topCompetitor.competitor.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="text-lg font-semibold font-headline">{topCompetitor.competitor.name}</div>
                                <div className="text-sm text-muted-foreground">{topCompetitor.competitor.team}</div>
                            </div>
                        </div>
                         <div className="text-right">
                            <div className="text-sm text-muted-foreground">Total Time</div>
                            <div className="text-xl font-bold font-mono text-primary">{topCompetitor.totalTime}</div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
        
        {isOrganizer && (
            <Card>
                <CardHeader>
                    <CardTitle className="font-bold flex items-center gap-2"><Calendar /> My Events</CardTitle>
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
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle className="font-bold flex items-center gap-2"><Calendar /> Upcoming Stages</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Stage</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead className="text-right">Distance</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {upcomingStages.map(stage => (
                                <TableRow key={stage.id}>
                                    <TableCell className="font-medium">{stage.name}</TableCell>
                                    <TableCell className="text-muted-foreground">{stage.location}</TableCell>
                                    <TableCell className="text-right font-mono">{stage.distance.toFixed(2)} km</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-bold flex items-center gap-2"><Newspaper /> Recent News</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {recentNews.map(post => (
                        <div key={post.id} className="p-3 rounded-md bg-muted/50">
                            <h4 className="font-semibold">{post.title}</h4>
                            <p className="text-xs text-muted-foreground">{post.content}</p>
                        </div>
                    ))}
                     <Button variant="outline" className="w-full" asChild>
                        <Link href="/news">View All News</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
