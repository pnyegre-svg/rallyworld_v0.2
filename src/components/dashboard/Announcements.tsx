
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Megaphone, Pin, Eye, PenSquare } from 'lucide-react';
import type { DashboardAnnouncement } from '@/lib/dashboard';
import Link from 'next/link';

function toMillis(ts:any){
  try{
    const d = ts?.toDate ? ts.toDate() : ts ? new Date(ts) : null;
    return d ? d.getTime() : 0;
  }catch{ return 0; }
}

function fmt(ts:any){
  try{ const d = ts?.toDate ? ts.toDate() : new Date(ts); return d.toLocaleString(); }
  catch{ return ''; }
}

type AnnouncementsProps = {
    items: DashboardAnnouncement[] | undefined;
}

export function Announcements({ items = [] }: AnnouncementsProps) {
    const ordered = [...items]
        .sort((a,b)=> Number(!!(b as any).pinned) - Number(!!(a as any).pinned) || (toMillis(b.publishedAt) - toMillis(a.publishedAt)))
        .slice(0,3);

    return (
        <Card className="lg:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5"/>Latest Announcements</CardTitle>
                    <CardDescription>Key updates and bulletins.</CardDescription>
                </div>
                 <Button asChild>
                    <Link href="/announcements">View All</Link>
                </Button>
            </CardHeader>
            <CardContent>
                 {ordered.length === 0 ? (
                    <div className="text-center text-muted-foreground h-24 flex items-center justify-center">No announcements yet.</div>
                ) : (
                    <ul className="space-y-3">
                    {ordered.map((a) => (
                        <li key={a.annId || (a as any).id} className="rounded-lg border bg-card text-card-foreground p-3 shadow-sm flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                     {(a as any).pinned && <Pin className="h-4 w-4 text-yellow-500 shrink-0" />}
                                     <p className="font-medium pr-4">{a.title}</p>
                                </div>
                                <div className="text-xs text-muted-foreground pt-1">
                                    {a.eventTitle} &middot; {fmt(a.publishedAt)}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button asChild variant="outline" size="sm">
                                    <Link href={`/events/${a.eventId}?tab=announcements`}>
                                        <Eye className="mr-2 h-4 w-4"/> View
                                    </Link>
                                </Button>
                                <Button asChild variant="secondary" size="sm">
                                     <Link href={`/announcements/edit/${a.eventId}/${a.annId}`}>
                                        <PenSquare className="mr-2 h-4 w-4"/> Edit
                                    </Link>
                                </Button>
                            </div>
                        </li>
                    ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    )
}
