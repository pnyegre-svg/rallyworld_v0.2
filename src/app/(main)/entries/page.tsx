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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserStore } from '@/hooks/use-user';
import { useToast } from '@/components/ui/toaster';
import { listOrganizerEvents, type EventLite } from '@/lib/events';
import { fetchEntriesForEvent, type Entry } from '@/lib/entries';
import { approveEntryFn, markEntryPaidFn } from '@/lib/functions.client';
import { format } from 'date-fns';
import { Download, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { db } from '@/lib/firebase.client';
import { downloadCsv } from '@/lib/csv';

type OptimisticUpdate = {
  entryId: string;
  type: 'status' | 'paymentStatus';
  value: 'approved' | 'paid';
};

export default function EntriesPage() {
  const { user } = useUserStore();
  const { push: toast } = useToast();
  const [events, setEvents] = React.useState<EventLite[]>([]);
  const [selectedEventId, setSelectedEventId] = React.useState<string | null>(null);
  const [entries, setEntries] = React.useState<Entry[]>([]);
  const [optimisticUpdates, setOptimisticUpdates] = React.useState<OptimisticUpdate[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadingEntries, setLoadingEntries] = React.useState(false);
  const [filters, setFilters] = React.useState({ showPending: false, showUnpaid: false });
  const [busy, setBusy] = React.useState<string>('');


  // Fetch organizer's events
  React.useEffect(() => {
    if (user?.organizerProfile?.id) {
      setLoading(true);
      listOrganizerEvents(db, user.organizerProfile.id).then(fetchedEvents => {
        setEvents(fetchedEvents);
        if (fetchedEvents.length > 0) {
            const firstEventId = fetchedEvents[0].id;
            setSelectedEventId(firstEventId);
            fetchEntriesForEvent(db, firstEventId).then((newEntries) => {
                setEntries(newEntries);
            });
        }
        setLoading(false);
      });
    }
  }, [user?.organizerProfile?.id]);

  // Watch for entries for the selected event
  React.useEffect(() => {
    if (!selectedEventId) {
        setEntries([]);
        return;
    };

    setLoadingEntries(true);
    fetchEntriesForEvent(db, selectedEventId).then((newEntries) => {
        setEntries(newEntries);
        setLoadingEntries(false);
    });

  }, [selectedEventId]);


  const handleApprove = async (entry: Entry) => {
    if (!selectedEventId) return;
    setBusy(entry.id);
    const originalStatus = entry.status;
    setEntries(items => items.map(it => it.id === entry.id ? { ...it, status: 'approved' } : it));

    try {
      await approveEntryFn(selectedEventId, entry.id);
      toast({ text: 'Entry approved successfully.', kind: 'success' });
    } catch (error: any) {
      console.error(error);
      setEntries(items => items.map(it => it.id === entry.id ? { ...it, status: originalStatus } : it));
      toast({ text: error.message || 'Failed to approve entry.', kind: 'error' });
    } finally {
        setBusy('');
    }
  };

  const handleMarkPaid = async (entry: Entry) => {
    if (!selectedEventId) return;
    setBusy(entry.id);
    const originalPaymentStatus = entry.paymentStatus;
    setEntries(items => items.map(it => it.id === entry.id ? { ...it, paymentStatus: 'paid' } : it));

    try {
      await markEntryPaidFn(selectedEventId, entry.id);
      toast({ text: 'Entry marked as paid.', kind: 'success' });
    } catch (error: any) {
      console.error(error);
      setEntries(items => items.map(it => it.id === entry.id ? { ...it, paymentStatus: originalPaymentStatus } : it));
      toast({ text: error.message || 'Failed to mark as paid.', kind: 'error' });
    } finally {
        setBusy('');
    }
  };

  const getDisplayEntries = () => {
    let displayed = [...entries];

    if (filters.showPending) {
        displayed = displayed.filter(e => e.status === 'new');
    }
    if (filters.showUnpaid) {
        displayed = displayed.filter(e => e.paymentStatus === 'unpaid');
    }

    return displayed;
  };

  const exportToCSV = () => {
    const dataToExport = getDisplayEntries();
    if (dataToExport.length === 0) {
        toast({text: 'No data to export.', kind: 'info'});
        return;
    }
    
    const headers = ['Competitor Name', 'Status', 'Payment Status', 'Fee', 'Date Submitted'];
    const rows = dataToExport.map(entry => ({
        'Competitor Name': entry.competitorName,
        'Status': entry.status,
        'Payment Status': entry.paymentStatus,
        'Fee': `${entry.feeAmount} ${entry.currency}`,
        'Date Submitted': entry.createdAt ? format(entry.createdAt.toDate(), 'yyyy-MM-dd HH:mm') : 'N/A',
    }));

    downloadCsv('entries.csv', rows, headers);
  }

  const displayedEntries = getDisplayEntries();

  if (loading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Entries</CardTitle>
                <CardDescription>Review and manage competitor registrations for your events.</CardDescription>
            </CardHeader>
            <CardContent>
                <Skeleton className="h-10 w-full" />
                <div className="mt-4 space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
            <div>
                <CardTitle>Manage Entries</CardTitle>
                <CardDescription>Review and manage competitor registrations for your events.</CardDescription>
            </div>
            <div className="flex items-center gap-4">
                <Select value={selectedEventId || ''} onValueChange={setSelectedEventId} disabled={events.length === 0}>
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
                 <Button onClick={exportToCSV} variant="outline" size="sm" className="shrink-0">
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
         <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center space-x-2">
                <Checkbox id="show-pending" checked={filters.showPending} onCheckedChange={(checked) => setFilters(f => ({ ...f, showPending: !!checked }))} />
                <label htmlFor="show-pending" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Show Pending Only
                </label>
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox id="show-unpaid" checked={filters.showUnpaid} onCheckedChange={(checked) => setFilters(f => ({ ...f, showUnpaid: !!checked }))} />
                <label htmlFor="show-unpaid" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Show Unpaid Only
                </label>
            </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Competitor</TableHead>
              <TableHead>Date Submitted</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingEntries ? (
                Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-40 ml-auto" /></TableCell>
                    </TableRow>
                ))
            ) : displayedEntries.length > 0 ? displayedEntries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="font-medium">{entry.competitorName}</TableCell>
                <TableCell className="text-muted-foreground">{entry.createdAt ? format(entry.createdAt.toDate(), 'PPp') : 'N/A'}</TableCell>
                <TableCell>
                  <Badge variant={entry.status === 'approved' ? 'default' : entry.status === 'new' ? 'secondary' : 'destructive'} className="capitalize">
                     {entry.status === 'new' && <AlertTriangle className="h-3 w-3 mr-1" />}
                     {entry.status === 'approved' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                     {entry.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={entry.paymentStatus === 'paid' ? 'default' : 'destructive'} className="capitalize">
                    {entry.paymentStatus === 'unpaid' && <Clock className="h-3 w-3 mr-1" />}
                    {entry.paymentStatus === 'paid' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                    {entry.paymentStatus}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleApprove(entry)} disabled={entry.status === 'approved' || busy === entry.id}>
                    {busy === entry.id && entry.status !== 'approved' ? 'Approving...': 'Approve'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleMarkPaid(entry)} disabled={entry.paymentStatus === 'paid' || busy === entry.id}>
                     {busy === entry.id && entry.paymentStatus !== 'paid' ? 'Paying...': 'Mark as Paid'}
                  </Button>
                </TableCell>
              </TableRow>
            )) : (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                       {selectedEventId ? 'No entries found for this event.' : 'Please select an event to view entries.'}
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
