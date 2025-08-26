
'use client';

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
import { useEventStore } from '@/hooks/use-event-store';
import { stages, leaderboard, newsPosts } from '@/lib/data';
import { ArrowRight, Calendar, MapPin, Newspaper, Trophy, Flag, PlusSquare, PenSquare } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { user } = useUserStore();
  const { events } = useEventStore();

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
  const organizerEvents = events.slice(0, 3); // Show latest 3 events

  return (
    <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
             <Card className="lg:col-span-1">
                <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle>Welcome, {user.name.split(' ')[0]}!</CardTitle>
                        <CardDescription>
                            Your role: <span className="font-semibold capitalize text-foreground">{user.currentRole.replace(/_/g, ' ')}</span>
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <Button asChild className="w-full bg-accent hover:bg-accent/90">
                        <Link href="/leaderboard">View Full Leaderboard <Trophy className="ml-2 h-4 w-4" /></Link>
                    </Button>
                </CardContent>
            </Card>

            {isOrganizer && (
                 <Card className="lg:col-span-2 bg-accent/20 border-accent/50 hover:bg-accent/30 transition-colors">
                    <Link href="/organizer/create-event" className="h-full flex flex-col">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-accent">
                                    <PlusSquare />
                                    Organizer Action
                                </CardTitle>
                                <ArrowRight className="text-accent"/>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col justify-center">
                            <h2 className="text-2xl font-headline text-foreground">Create New Rally Event</h2>
                            <p className="text-muted-foreground mt-2">Define stages, manage competitors, and kick off your next competition.</p>
                        </CardContent>
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
        
        {isOrganizer && events.length > 0 && (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Calendar /> My Events</CardTitle>
                </CardHeader>
                <CardContent>
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
                            {organizerEvents.map(event => (
                                <TableRow key={event.id}>
                                    <TableCell className="font-medium">{event.title}</TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {format(event.dates.from, 'LLL dd, y')} - {format(event.dates.to, 'LLL dd, y')}
                                    </TableCell>
                                    <TableCell className="text-center font-mono">{event.stages.length}</TableCell>
                                    <TableCell className="text-right">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/organizer/event/edit/${event.id}`}>
                                                <PenSquare className="mr-2 h-4 w-4" /> Edit
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Calendar /> Upcoming Stages</CardTitle>
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
                    <CardTitle className="flex items-center gap-2"><Newspaper /> Recent News</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {recentNews.map(post => (
                        <div key={post.id} className="p-3 rounded-md bg-muted/50">
                            <h4 className="font-semibold">{post.title}</h4>
                            <p className="text-xs text-muted-foreground">{post.content}</p>
                        </div>
                    ))}
                     <Button variant="outline" className="w-full">
                        <Link href="/news">View All News</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
