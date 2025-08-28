
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/toaster';
import { createAnnouncementFn } from '@/lib/announcements.client';
import { CalendarIcon, PinIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/useAuth';
import { listOrganizerEvents, type EventLite } from '@/lib/events';
import { db } from '@/lib/firebase.client';
import { Skeleton } from '@/components/ui/skeleton';

const announcementFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  body: z.string().optional(),
  audience: z.enum(['competitors', 'officials', 'public']),
  pinned: z.boolean(),
  publishAt: z.date().optional(),
});

type AnnouncementFormValues = z.infer<typeof announcementFormSchema>;

export default function NewAnnouncementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEventId = searchParams.get('eventId');
  const { push: toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [events, setEvents] = React.useState<EventLite[]>([]);
  const [selectedEventId, setSelectedEventId] = React.useState<string | null>(initialEventId);
  const [isLoadingEvents, setIsLoadingEvents] = React.useState(!initialEventId);
  
  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: {
      title: '',
      body: '',
      audience: 'competitors',
      pinned: false,
      publishAt: undefined,
    },
  });

  React.useEffect(() => {
    if (user?.uid) {
      listOrganizerEvents(db, user.uid).then(fetchedEvents => {
        setEvents(fetchedEvents);
        setIsLoadingEvents(false);
      });
    }
  }, [user?.uid]);

  React.useEffect(() => {
      if (!initialEventId && events.length > 0) {
        setSelectedEventId(events[0].id);
      }
  }, [events, initialEventId]);

  const onSubmit = async (data: AnnouncementFormValues) => {
    if (!selectedEventId) {
        toast({kind: 'error', text: 'Please select an event.'});
        return;
    };

    setIsSubmitting(true);
    try {
      const payload: any = {
        eventId: selectedEventId,
        ...data,
        publishAt: data.publishAt ? data.publishAt.toISOString() : undefined,
      };
      await createAnnouncementFn(payload);
      toast({ kind: 'success', text: 'Announcement created successfully.' });
      router.push(`/announcements`);
    } catch (e: any) {
      toast({ kind: 'error', text: e.message || 'Failed to create announcement.' });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  if (!user) return <p>Loading...</p>

  const renderForm = () => (
     <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {!initialEventId && (
            <FormItem>
                <FormLabel>Event</FormLabel>
                 <Select value={selectedEventId || ''} onValueChange={setSelectedEventId} disabled={isLoadingEvents}>
                    <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder={isLoadingEvents ? "Loading events..." : "Select an event"} />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    {events.map(event => (
                        <SelectItem key={event.id} value={event.id}>
                        {event.title}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                <FormMessage />
            </FormItem>
        )}
        <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                <Input {...field} placeholder="e.g. Important Update" />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
        <FormField
            control={form.control}
            name="body"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Body (Markdown supported)</FormLabel>
                <FormControl>
                <Textarea {...field} placeholder="Details about the announcement..." rows={10} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
        <div className="grid md:grid-cols-2 gap-6">
            <FormField
            control={form.control}
            name="audience"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Audience</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                        <SelectTrigger>
                        <SelectValue placeholder="Select audience" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="competitors">Competitors</SelectItem>
                        <SelectItem value="officials">Officials</SelectItem>
                        <SelectItem value="public">Public</SelectItem>
                    </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="publishAt"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                    <FormLabel>Schedule Publish Time (Optional)</FormLabel>
                    <Popover>
                    <PopoverTrigger asChild>
                        <FormControl>
                        <Button
                            variant="outline"
                            className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                        >
                            {field.value ? format(field.value, 'PPP p') : <span>Publish immediately</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                        </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        <div className="p-3 border-t border-border">
                            <Input
                                type="time"
                                defaultValue={field.value ? format(field.value, 'HH:mm') : ''}
                                onChange={(e) => {
                                    const [hours, minutes] = e.target.value.split(':').map(Number);
                                    const newDate = field.value ? new Date(field.value) : new Date();
                                    newDate.setHours(hours, minutes);
                                    field.onChange(newDate);
                                }}
                            />
                        </div>
                    </PopoverContent>
                    </Popover>
                    <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
            control={form.control}
            name="pinned"
            render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                <FormLabel className="text-base flex items-center gap-2"><PinIcon/> Pin Announcement</FormLabel>
                <CardDescription>Pinned announcements appear at the top of the feed.</CardDescription>
                </div>
                <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
            </FormItem>
            )}
        />
        <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting} className="bg-accent hover:bg-accent/90">{isSubmitting ? 'Creating...' : 'Create Announcement'}</Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
        </form>
    </Form>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Announcement</CardTitle>
        <CardDescription>Create a new announcement for your event.</CardDescription>
      </CardHeader>
      <CardContent>
        {(isLoadingEvents && !initialEventId) ? (
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        ) : events.length === 0 && !initialEventId ? (
            <div className="text-center text-muted-foreground p-8">
                <p>You must have at least one event to create an announcement.</p>
                <Button asChild variant="link"><a href="/organizer/create-event">Create an event</a></Button>
            </div>
        ) : (
            renderForm()
        )}
      </CardContent>
    </Card>
  );
}
