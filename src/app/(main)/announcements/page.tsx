'use client';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/lib/useAuth';
import { useUserDoc } from '@/lib/useUserDoc';
import { listOrganizerEvents } from '@/lib/events.client';
import { Announcement, listAnnouncements } from '@/lib/announcements.client';
import Link from 'next/link';
import { useToast } from '@/components/ui/toaster';
import { publishAnnouncementFn, pinAnnouncementFn } from '@/lib/announcements.client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const LS_KEY = 'announcements:lastEvent';

export default function AnnouncementsList(){
  const { user, loading } = useAuth();
  const userDoc = useUserDoc(user?.uid);
  const { push } = useToast();
  const [events,setEvents] = useState<{id:string; title:string}[]>([]);
  const [eventId,setEventId] = useState('');
  const [items,setItems] = useState<Announcement[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(false);

  // Load events and restore last-used event from localStorage if valid
  useEffect(()=>{ 
    if(!user?.uid) return; 
    setIsLoadingEvents(true);
    (async()=>{
      const evs = await listOrganizerEvents(user.uid); 
      setEvents(evs as any);
      if (!eventId) {
        const stored = typeof window !== 'undefined' ? localStorage.getItem(LS_KEY) : null;
        const candidate = (stored && evs.find(e=>e.id===stored)) ? stored : evs[0]?.id;
        if (candidate) setEventId(candidate);
      }
      setIsLoadingEvents(false);
    })(); 
  },[user?.uid]);

  // Persist current selection
  useEffect(()=>{ 
      if(!eventId) return; 
      try { 
          localStorage.setItem(LS_KEY, eventId); 
      } catch {} 
    },
    [eventId]
  );

  // Fetch announcements for selected event
  useEffect(()=>{ 
      if(!eventId) return; 
      setIsLoadingAnnouncements(true);
      (async()=> {
          setItems(await listAnnouncements(eventId));
          setIsLoadingAnnouncements(false);
      })(); 
    },
    [eventId]
);

  const canView = useMemo(()=> user && (userDoc?.role==='organizer' || userDoc?.role==='admin'), [user,userDoc]);
  
  if (loading || isLoadingEvents) return (
    <Card>
        <CardHeader>
            <CardTitle>Announcements</CardTitle>
        </CardHeader>
        <CardContent>
             <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-40 w-full" />
            </div>
        </CardContent>
    </Card>
  );

  if (!user) return <Card><CardHeader><CardTitle>Announcements</CardTitle></CardHeader><CardContent><p>Please sign in.</p></CardContent></Card>;
  if (!canView) return <Card><CardHeader><CardTitle>Announcements</CardTitle></CardHeader><CardContent><p>You don’t have organizer access.</p></CardContent></Card>;

  async function publishNow(id:string){
    try{ 
        await publishAnnouncementFn({ eventId, annId:id }); 
        push({kind:'success', text:'Published'}); 
        setItems(await listAnnouncements(eventId)); 
    }
    catch(e:any){ push({kind:'error', text:e?.message||'Publish failed'}); }
  }
  async function togglePin(id:string, value:boolean){
    try{ 
        await pinAnnouncementFn({ eventId, annId:id, pinned:value }); 
        setItems(await listAnnouncements(eventId)); 
    }
    catch(e:any){ push({kind:'error', text:e?.message||'Pin failed'}); }
  }

  // Sort: pinned first, then by publishedAt desc
  const display = [...items].sort((a,b)=>{
    const pin = Number(!!b.pinned) - Number(!!a.pinned);
    if (pin) return pin;
    const ad = a.publishedAt?.toDate ? a.publishedAt.toDate() : a.publishedAt ? new Date(a.publishedAt) : null;
    const bd = b.publishedAt?.toDate ? b.publishedAt.toDate() : b.publishedAt ? new Date(b.publishedAt) : null;
    return (bd?.getTime()||0) - (ad?.getTime()||0);
  });
  
  const statusBadge = (v:string) => {
    const variant: "default" | "secondary" | "destructive" = 
        v === 'published' ? 'default' :
        v === 'scheduled' ? 'secondary' :
        'destructive';
    return <Badge variant={variant} className="capitalize">{v}</Badge>;
  }

  return (
    <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <CardTitle>Announcements</CardTitle>
                <div className="flex items-center gap-4">
                     <Select value={eventId} onValueChange={setEventId} disabled={events.length === 0}>
                        <SelectTrigger className="w-[280px]">
                            <SelectValue placeholder={events.length > 0 ? "Select an event" : "No events found"} />
                        </SelectTrigger>
                        <SelectContent>
                        {events.map(event => (
                            <SelectItem key={event.id} value={event.id}>
                            {event.title}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <Button asChild className="bg-accent hover:bg-accent/90">
                        <Link href={`/announcements/new?eventId=${eventId}`}>
                            <PlusCircle className="mr-2 h-4 w-4" /> New Announcement
                        </Link>
                    </Button>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <div className="overflow-hidden rounded-md border">
                <Table>
                <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Status</TableHead><TableHead>Pinned</TableHead><TableHead>Published</TableHead><TableHead className="w-[1%]"></TableHead></TableRow></TableHeader>
                <TableBody>
                    {isLoadingAnnouncements ? (
                        Array.from({length: 3}).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell colSpan={5}><Skeleton className="h-8 w-full"/></TableCell>
                            </TableRow>
                        ))
                    ) : display.length === 0 ? (
                        <TableRow><TableCell colSpan={5} className="h-24 text-center">No announcements for this event.</TableCell></TableRow>
                    ) : display.map(a=> (
                    <TableRow key={a.id}>
                        <TableCell className="font-medium">{a.title}</TableCell>
                        <TableCell>{statusBadge(a.status)}</TableCell>
                        <TableCell>
                        <Checkbox checked={!!a.pinned} onCheckedChange={(checked)=>togglePin(a.id, !!checked)} />
                        </TableCell>
                        <TableCell>{a.publishedAt ? new Date(a.publishedAt.toDate? a.publishedAt.toDate(): a.publishedAt).toLocaleString() : '—'}</TableCell>
                        <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                            {(a.status!=='published') && (
                            <Button variant="outline" size="sm" onClick={()=>publishNow(a.id)}>Publish</Button>
                            )}
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/announcements/edit/${eventId}/${a.id}`}>Edit</Link>
                            </Button>
                        </div>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>
      </CardContent>
    </Card>
  );
}