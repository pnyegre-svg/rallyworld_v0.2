
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useUserStore } from '@/hooks/use-user';
import { stages, leaderboard, newsPosts } from '@/lib/data';
import { ArrowRight, Calendar, MapPin, Newspaper, Trophy, Flag, PlusSquare, PenSquare, Eye, Users, FileUp, Megaphone, CheckCircle, Clock, AlertTriangle, FileText, Download, MoreVertical } from 'lucide-react';
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
    // In a real app, this would fetch the pre-computed dashboard_summary/{organizerId} doc.
    // For now, we'll just simulate a loading state.
    if (user.currentRole === 'organizer') {
        const timer = setTimeout(() => setLoading(false), 500); // Simulate network delay
        return () => clearTimeout(timer);
    } else {
        setLoading(false);
    }
  }, [user.currentRole]);


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

  if (isOrganizer) {
    if (loading) {
        return (
             <div className="space-y-6">
                <Skeleton className="h-24 w-full" />
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Skeleton className="h-64 w-full lg:col-span-2" />
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full lg:col-span-3" />
                     <Skeleton className="h-64 w-full lg:col-span-3" />
                </div>
            </div>
        )
    }
    return (
        <div className="space-y-6">
            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Button asChild className="h-20 text-lg bg-accent hover:bg-accent/90" size="lg">
                    <Link href="/organizer/create-event"><PlusSquare className="mr-4 h-6 w-6"/> Create Event</Link>
                </Button>
                 <Button asChild className="h-20 text-lg" size="lg" variant="outline">
                    <Link href="#"><Users className="mr-4 h-6 w-6"/> Manage Entries</Link>
                </Button>
                 <Button asChild className="h-20 text-lg" size="lg" variant="outline">
                    <Link href="#"><FileUp className="mr-4 h-6 w-6"/> Upload Docs</Link>
                </Button>
                 <Button asChild className="h-20 text-lg" size="lg" variant="outline">
                    <Link href="#"><Megaphone className="mr-4 h-6 w-6"/> Post Announcement</Link>
                </Button>
            </div>

            {/* Main Cockpit Grid */}
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Today's Stages */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5"/>Today's Stages</CardTitle>
                         <CardDescription>What's happening right now.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Time</TableHead>
                                    <TableHead>Stage</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-mono">09:00</TableCell>
                                    <TableCell className="font-medium">SS1 - Col de Turini</TableCell>
                                    <TableCell><Badge variant="outline" className="text-green-500 border-green-500">Ready</Badge></TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="destructive" size="sm">Start</Button>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-mono">14:30</TableCell>
                                    <TableCell className="font-medium">SS2 - Ouninpohja</TableCell>
                                    <TableCell><Badge variant="outline">Not Started</Badge></TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="secondary" size="sm" disabled>Start</Button>
                                    </TableCell>
                                </TableRow>
                                 <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                        No more stages scheduled for today.
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Entries & Payments */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5"/>Entries & Payments</CardTitle>
                        <CardDescription>Status of competitor registrations.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-around text-center">
                            <div>
                                <p className="text-3xl font-bold">12</p>
                                <p className="text-sm text-muted-foreground flex items-center gap-1"><AlertTriangle className="h-4 w-4 text-orange-400"/>Pending</p>
                            </div>
                             <div>
                                <p className="text-3xl font-bold">4</p>
                                <p className="text-sm text-muted-foreground flex items-center gap-1"><Clock className="h-4 w-4 text-red-500"/>Unpaid</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold">48</p>
                                <p className="text-sm text-muted-foreground flex items-center gap-1"><CheckCircle className="h-4 w-4 text-green-500"/>Confirmed</p>
                            </div>
                        </div>
                         <div className="flex flex-col gap-2">
                             <Button variant="outline">Bulk Approve</Button>
                             <Button variant="outline">Message Pending</Button>
                             <Button variant="ghost" size="sm" className="text-muted-foreground"><Download className="mr-2 h-4 w-4"/>Export CSV</Button>
                         </div>
                    </CardContent>
                </Card>
                
                 {/* Upcoming Stages */}
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5"/>Upcoming Stages (Next 7 Days)</CardTitle>
                        <CardDescription>Prepare for what's next on the calendar.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Stage</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Distance</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-mono">Jul 28</TableCell>
                                    <TableCell className="font-medium">SS3 - Myherin</TableCell>
                                    <TableCell>Wales</TableCell>
                                    <TableCell>29.13 km</TableCell>
                                    <TableCell><Badge>Ready</Badge></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-mono">Jul 29</TableCell>
                                    <TableCell className="font-medium">SS4 - Fafe</TableCell>
                                    <TableCell>Portugal</TableCell>
                                    <TableCell>11.18 km</TableCell>
                                    <TableCell><Badge variant="outline">Docs Missing</Badge></TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>


                 {/* Announcements */}
                 <Card className="lg:col-span-3">
                    <CardHeader className="flex flex-row items-center justify-between">
                       <div>
                         <CardTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5"/>Announcements</CardTitle>
                         <CardDescription>Latest bulletins and information for all participants.</CardDescription>
                       </div>
                       <div className="flex items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">Target: All</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem>All</DropdownMenuItem>
                                    <DropdownMenuItem>Competitors</DropdownMenuItem>
                                    <DropdownMenuItem>Officials</DropdownMenuItem>
                                     <DropdownMenuItem>Public</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                           <Button>New Announcement</Button>
                       </div>

                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Audience</TableHead>
                                    <TableHead>Published</TableHead>
                                    <TableHead>Version</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-medium">Bulletin #3 - Schedule Change SS2</TableCell>
                                     <TableCell><Badge variant="destructive">Competitors</Badge></TableCell>
                                    <TableCell className="text-muted-foreground">2024-07-20 08:30</TableCell>
                                    <TableCell className="font-mono">3</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Safety Briefing Location</TableCell>
                                    <TableCell><Badge>Officials</Badge></TableCell>
                                    <TableCell className="text-muted-foreground">2024-07-19 17:00</TableCell>
                                    <TableCell className="font-mono">1</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

             </div>
        </div>
    );
  }

  return (
    <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
             <Card className="lg:col-span-2">
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
                            <Link href="/myevents">Go to Stage <ArrowRight className="ml-2 h-4 w-4" /></Link>
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
        
        {!isOrganizer && (
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
        )}
    </div>
  );
}
