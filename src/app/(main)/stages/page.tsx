
'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserStore } from '@/hooks/use-user';
import { useToast } from '@/components/ui/toaster';
import { listOrganizerEvents, type EventLite } from '@/lib/events';
import {
  listStages, createStageFn, updateStageFn, deleteStageFn,
  startStageFn, completeStageFn, cancelStageFn, delayStageFn,
  type Stage
} from '@/lib/stages.client';
import StageForm from '@/components/stages/StageForm';
import { PlusCircle, Upload, MoreHorizontal, Play, StopCircle, Ban, History, Trash2, Pencil, Bot } from 'lucide-react';
import { db } from '@/lib/firebase.client';
import Papa from 'papaparse';
import { cn } from '@/lib/utils';
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
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const LS_EVENT = 'stages:lastEvent';

function toLocalInput(ts:any){
    try{
      const d = ts?.toDate ? ts.toDate() : ts ? new Date(ts) : null;
      if (!d) return '';
      // Format to "YYYY-MM-DDTHH:mm" which is required by datetime-local input
      const year = d.getFullYear();
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      const hours = d.getHours().toString().padStart(2, '0');
      const minutes = d.getMinutes().toString().padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    }catch{ return ''; }
}

function fmt(ts:any){ try{ const d = ts?.toDate ? ts.toDate() : ts ? new Date(ts) : null; return d? d.toLocaleString():''; }catch{ return ''; } }

function statusBadge(v:string){
    const map: Record<string, { className: string, icon?: React.ReactNode }> = {
      scheduled: { className: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
      ongoing:   { className: 'bg-green-500/10 text-green-400 border-green-500/20 animate-pulse', icon: <Play className="h-3 w-3 mr-1" /> },
      completed: { className: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: <StopCircle className="h-3 w-3 mr-1" /> },
      delayed:   { className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', icon: <History className="h-3 w-3 mr-1" /> },
      cancelled: { className: 'bg-red-500/10 text-red-400 border-red-500/20 line-through', icon: <Ban className="h-3 w-3 mr-1" /> },
    };
    const style = map[v] || map.scheduled;
    return <Badge variant="outline" className={cn("capitalize", style.className)}>{style.icon}{v}</Badge>;
}

export default function StagesPage() {
    const { user, isAuthReady } = useUserStore();
    const { push: toast } = useToast();
    const [events, setEvents] = React.useState<EventLite[]>([]);
    const [selectedEventId, setSelectedEventId] = React.useState<string>('');
    const [stages, setStages] = React.useState<Stage[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [loadingStages, setLoadingStages] = React.useState(false);
    const [showNew, setShowNew] = React.useState(false);
    const [editId, setEditId] = React.useState<string | undefined>();
    const fileRef = React.useRef<HTMLInputElement>(null);
    const [busyAction, setBusyAction] = React.useState('');
    const [isPublic, setIsPublic] = React.useState<boolean>(false);
    const [savingPublic, setSavingPublic] = React.useState(false);

    React.useEffect(() => {
        if (!isAuthReady) return;
        if (!user || user.currentRole !== 'organizer') {
            setLoading(false);
            return;
        }

        listOrganizerEvents(db, user.id).then((fetchedEvents) => {
            setEvents(fetchedEvents);
            const stored = localStorage.getItem(LS_EVENT);
            const pick = (stored && fetchedEvents.find(e => e.id === stored)) ? stored : fetchedEvents[0]?.id;
            if (pick) setSelectedEventId(pick);
            setLoading(false);
        });
    }, [user, isAuthReady]);

    const refreshStagesAndPublicStatus = React.useCallback(async () => {
        if (!selectedEventId) return;
        setLoadingStages(true);
        try {
            const [newStages, ev] = await Promise.all([
                listStages(selectedEventId),
                getDoc(doc(db, 'events', selectedEventId))
            ]);
            setStages(newStages);
            const data = ev.data() || {};
            setIsPublic(!!data.public);
        } catch (error) {
            console.error("Error refreshing data:", error);
            toast({ kind: 'error', text: 'Failed to refresh event data.' });
        } finally {
            setLoadingStages(false);
        }
    }, [selectedEventId, toast]);

    React.useEffect(() => {
        if (!selectedEventId) return;
        localStorage.setItem(LS_EVENT, selectedEventId);
        refreshStagesAndPublicStatus();
    }, [selectedEventId, refreshStagesAndPublicStatus]);

    async function togglePublic(value: boolean){
      setSavingPublic(true);
      try{
        const evRef = doc(db, 'events', selectedEventId);
        await updateDoc(evRef, { public: value }).catch(async () => {
          await setDoc(evRef, { public: value }, { merge: true });
        });
        setIsPublic(value);
        toast({ kind:'success', text: `Public page ${value ? 'enabled' : 'disabled'}` });
      }catch(e:any){
        toast({ kind:'error', text: e?.message || 'Failed to update visibility' });
      }finally{
        setSavingPublic(false);
      }
    }

    // --- CRUD ---
    async function createStage(values: any) {
        setBusyAction('create');
        try {
            await createStageFn({ eventId: selectedEventId, ...values });
            setShowNew(false);
            await refreshStagesAndPublicStatus();
            toast({ kind: 'success', text: 'Stage created successfully.' });
        } catch (e: any) {
            toast({ kind: 'error', text: e.message || 'Failed to create stage.' });
        } finally {
            setBusyAction('');
        }
    }

    async function saveStage(id: string, values: any) {
        setBusyAction(`save-${id}`);
        try {
            await updateStageFn({ eventId: selectedEventId, stageId: id, ...values });
            setEditId(undefined);
            await refreshStagesAndPublicStatus();
            toast({ kind: 'success', text: 'Stage updated successfully.' });
        } catch (e: any) {
            toast({ kind: 'error', text: e.message || 'Failed to update stage.' });
        } finally {
            setBusyAction('');
        }
    }

    async function removeStage(id: string) {
        setBusyAction(`delete-${id}`);
        try {
            await deleteStageFn({ eventId: selectedEventId, stageId: id });
            await refreshStagesAndPublicStatus();
            toast({ kind: 'success', text: 'Stage deleted successfully.' });
        } catch (e: any) {
            toast({ kind: 'error', text: e.message || 'Failed to delete stage.' });
        } finally {
            setBusyAction('');
        }
    }
    
    // --- Actions ---
    const handleAction = (fn: Function, successMessage: string, failMessage: string) => async (id: string, ...args: any[]) => {
        setBusyAction(`${fn.name}-${id}`);
        try {
            const payload = { eventId: selectedEventId, stageId: id, ...args[0] };
            await fn(payload);
            await refreshStagesAndPublicStatus();
            toast({ kind: 'success', text: successMessage });
        } catch (e: any) {
            toast({ kind: 'error', text: e.message || failMessage });
        } finally {
            setBusyAction('');
        }
    };
    
    const start = handleAction(startStageFn, 'Stage started', 'Failed to start stage');
    const complete = handleAction(completeStageFn, 'Stage completed', 'Failed to complete stage');
    const cancel = handleAction(cancelStageFn, 'Stage cancelled', 'Failed to cancel stage');
    const delay = handleAction(delayStageFn, 'Stage delayed', 'Failed to delay stage');

    // --- CSV Import ---
    function onCsv(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file || !selectedEventId) return;
    
        setBusyAction('csv-import');
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: async (res: any) => {
            const rows = res.data as Array<any>;
            let ok = 0, fail = 0;
            
            for (const r of rows) {
              try {
                await createStageFn({
                  eventId: selectedEventId,
                  order: r.order ? Number(r.order) : 0,
                  name: String(r.name || '').trim(),
                  startAt: r.startAt ? new Date(r.startAt).toISOString() : null,
                  location: String(r.location || ''),
                  distanceKm: r.distanceKm != null ? Number(r.distanceKm) : null,
                  notes: String(r.notes || ''),
                });
                ok++;
              } catch {
                fail++;
              }
            }
            await refreshStagesAndPublicStatus();
            toast({ kind: fail ? 'info' : 'success', text: `Imported ${ok} stage(s)${fail ? `, ${fail} failed` : ''}` });
            setBusyAction('');
          }
        });
        e.target.value = '';
    }

    if (loading) {
        return (
            <Card>
                <CardHeader><CardTitle>Stages</CardTitle></CardHeader>
                <CardContent><Skeleton className="h-48 w-full" /></CardContent>
            </Card>
        );
    }
    
    if (!user || user.currentRole !== 'organizer') {
        return (
            <Card>
                <CardHeader><CardTitle>Stages</CardTitle></CardHeader>
                <CardContent><p>Stage management is for organizers only.</p></CardContent>
            </Card>
        );
    }

    return (
        <Card>
             <CardHeader>
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <CardTitle>Manage Stages</CardTitle>
                        <CardDescription>Create, edit, and manage the status of your event stages.</CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                        <Select value={selectedEventId} onValueChange={setSelectedEventId} disabled={events.length === 0}>
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
                        <input ref={fileRef} type="file" accept=".csv,text/csv" hidden onChange={onCsv}/>
                        <label className="flex items-center gap-2 text-sm text-nowrap">
                            <input type="checkbox" checked={isPublic} disabled={savingPublic || !selectedEventId} onChange={e=>togglePublic(e.target.checked)} />
                            <span className="text-muted-foreground">Public event page</span>
                        </label>
                        <Button onClick={() => fileRef.current?.click()} variant="outline" disabled={!selectedEventId || busyAction === 'csv-import'}>
                            <Upload className="mr-2 h-4 w-4" />
                            {busyAction === 'csv-import' ? 'Importing...' : 'Import CSV'}
                        </Button>
                        <Button onClick={() => setShowNew(true)} disabled={!selectedEventId} className="bg-accent hover:bg-accent/90">
                           <PlusCircle className="mr-2 h-4 w-4" /> New Stage
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {showNew && (
                    <div className="mb-6 rounded-lg border p-4 bg-muted/40">
                    <h3 className="text-lg font-semibold mb-4">Create New Stage</h3>
                    <StageForm onSubmit={createStage} onCancel={() => setShowNew(false)} isSubmitting={busyAction === 'create'} />
                    </div>
                )}
                 <div className="overflow-hidden rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-16 text-center">#</TableHead>
                                <TableHead>Stage Details</TableHead>
                                <TableHead className="w-48">Start Time</TableHead>
                                <TableHead className="w-40">Status</TableHead>
                                <TableHead className="text-right w-24">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                        {loadingStages ? (
                            Array.from({length: 3}).map((_, i) => (
                                <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-12 w-full"/></TableCell></TableRow>
                            ))
                        ) : stages.length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="h-24 text-center">No stages found for this event.</TableCell></TableRow>
                        ) : stages.map(stage => (
                            <React.Fragment key={stage.id}>
                                <TableRow>
                                    <TableCell className="text-center font-bold text-lg">{stage.order}</TableCell>
                                    <TableCell>
                                        <p className="font-bold">{stage.name}</p>
                                        <p className="text-xs text-muted-foreground">{stage.location} {stage.distanceKm ? `• ${stage.distanceKm} km` : ''}</p>
                                        {stage.notes && <p className="text-xs mt-1 italic text-muted-foreground/80">“{stage.notes}”</p>}
                                    </TableCell>
                                    <TableCell className="font-mono text-sm">{fmt(stage.startAt)}</TableCell>
                                    <TableCell>{statusBadge(stage.status)}</TableCell>
                                    <TableCell className="text-right">
                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" disabled={!!busyAction}>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => setEditId(stage.id)}><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => start(stage.id)}><Play className="mr-2 h-4 w-4" />Start</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => complete(stage.id)}><StopCircle className="mr-2 h-4 w-4" />Complete</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => cancel(stage.id)}><Ban className="mr-2 h-4 w-4" />Cancel</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => delay({stageId: stage.id, minutes: 5 })}><History className="mr-2 h-4 w-4" />Delay +5m</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => delay({stageId: stage.id, minutes: 10 })}><History className="mr-2 h-4 w-4" />Delay +10m</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => delay({stageId: stage.id, minutes: 30 })}><History className="mr-2 h-4 w-4" />Delay +30m</DropdownMenuItem>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-500 focus:bg-red-500/10 focus:text-red-500"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>This will permanently delete the stage "{stage.name}". This action cannot be undone.</AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => removeStage(stage.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                                {editId === stage.id && (
                                     <TableRow>
                                        <TableCell colSpan={5} className="p-0">
                                            <div className="p-4 bg-muted/40">
                                                <h3 className="text-md font-semibold mb-4 ml-2">Editing: {stage.name}</h3>
                                                <StageForm
                                                    initial={{ ...stage, startAt: toLocalInput(stage.startAt) }}
                                                    onSubmit={(v) => saveStage(stage.id, v)}
                                                    onCancel={() => setEditId(undefined)}
                                                    isSubmitting={busyAction === `save-${stage.id}`}
                                                />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </React.Fragment>
                        ))}
                        </TableBody>
                    </Table>
                 </div>
            </CardContent>
        </Card>
    );
}

    