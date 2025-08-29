'use client';
import { useEffect, useMemo, useState } from 'react';
import { useUserStore } from '@/hooks/use-user';
import { listOrganizerEvents } from '@/lib/events';
import { Announcement, listAnnouncements, deleteAnnouncementFn } from '@/lib/announcements.client';
import Link from 'next/link';
import { useToast } from '@/components/ui/toaster';
import { publishAnnouncementFn, pinAnnouncementFn } from '@/lib/announcements.client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { db } from '@/lib/firebase.client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const LS_KEY = 'announcements:lastEvent';

export default function AnnouncementsList(){
  const { user, isAuthReady } = useUserStore();
  const { push } = useToast();
  const [events,setEvents] = useState<{id:string; title:string}[]>([]);
  const [eventId,setEventId] = useState('');
  const [items,setItems] = useState<Announcement[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load events and restore last-used event from localStorage if valid
  useEffect(()=>{ 
    if(!user?.id) return; 
    setIsLoadingEvents(true);
    (async()=>{
      const evs = await listOrganizerEvents(db, user.id); 
      setEvents(evs as any);
      if (!eventId) {
        const stored = typeof window !== 'undefined' ? localStorage.getItem(LS_KEY) : null;
        const candidate = (stored && evs.find(e=>e.id===stored)) ? stored : evs[0]?.id;
        if (candidate) setEventId(candidate);
      }
      setIsLoadingEvents(false);
    })(); 
  },[user?.id, eventId]);

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
      if(!eventId) {
        setItems([]);
        return;
      }; 
      setIsLoadingAnnouncements(true);
      listAnnouncements(eventId).then(newItems => {
        setItems(newItems);
        setIsLoadingAnnouncements(false);
        setSelected([]); // Clear selection when event changes
      });
    },
    [eventId]
);

  const canView = useMemo(()=> user && (user.currentRole==='organizer' || user.email==='admin@rally.world'), [user]);
  
  if (!isAuthReady || isLoadingEvents) return (
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

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await Promise.all(
        selected.map(annId => deleteAnnouncementFn({ eventId, annId }))
      );
      push({ kind: 'success', text: `Deleted ${selected.length} announcement(s).`});
      setItems(await listAnnouncements(eventId));
      setSelected([]);
    } catch(e: any) {
      push({ kind: 'error', text: e?.message || 'Delete failed' });
    } finally {
      setIsDeleting(false);
    }
  }

  // Sort: pinned first, then drafts, then by created at desc
  const display = [...items].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    if (a.status === 'draft' && b.status !== 'draft') return -1;
    if (a.status !== 'draft' && b.status === 'draft') return 1;

    const ad = a.createdAt?.toDate ? a.createdAt.toDate() : a.createdAt ? new Date(a.createdAt) : null;
    const bd = b.createdAt?.toDate ? b.createdAt.toDate() : b.createdAt ? new Date(b.createdAt) : null;
    return (bd?.getTime() || 0) - (ad?.getTime() || 0);
  });
  
  const statusBadge = (v:string) => {
    const variant: "default" | "secondary" | "destructive" = 
        v === 'published' ? 'default' :
        v === 'scheduled' ? 'secondary' :
        'destructive'; // Draft will use destructive
    return <Badge variant={variant} className="capitalize">{v}</Badge>;
  }

  const handleSelectAll = (checked: boolean) => {
    setSelected(checked ? display.map(item => item.id) : []);
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    setSelected(prev => checked ? [...prev, id] : prev.filter(item => item !== id));
  };
  
  const numSelected = selected.length;

  return (
    <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <CardTitle>Announcements</CardTitle>
                  {numSelected > 0 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                         <Button variant="destructive" size="sm" disabled={isDeleting}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete ({numSelected})
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete {numSelected} announcement(s). This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                            {isDeleting ? 'Deleting...' : 'Yes, delete'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
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
                <TableHeader><TableRow>
                    <TableHead className="w-[50px]">
                         <Checkbox 
                            checked={numSelected > 0 && numSelected === display.length}
                            indeterminate={numSelected > 0 && numSelected < display.length}
                            onCheckedChange={handleSelectAll}
                         />
                    </TableHead>
                    <TableHead>Title</TableHead><TableHead>Status</TableHead><TableHead>Pinned</TableHead><TableHead>Published</TableHead><TableHead className="w-[1%]"></TableHead></TableRow></TableHeader>
                <TableBody>
                    {isLoadingAnnouncements ? (
                        Array.from({length: 3}).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell colSpan={6}><Skeleton className="h-8 w-full"/></TableCell>
                            </TableRow>
                        ))
                    ) : display.length === 0 ? (
                        <TableRow><TableCell colSpan={6} className="h-24 text-center">No announcements for this event.</TableCell></TableRow>
                    ) : display.map(a=> (
                    <TableRow key={a.id} data-state={selected.includes(a.id) ? "selected" : ""}>
                        <TableCell>
                            <Checkbox 
                                checked={selected.includes(a.id)}
                                onCheckedChange={(checked) => handleSelectOne(a.id, !!checked)}
                            />
                        </TableCell>
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
