
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
import { useUserStore } from '@/hooks/use-user';
import { listOrganizerEvents, type EventLite } from '@/lib/events';
import { db } from '@/lib/firebase.client';
import { Skeleton } from '@/components/ui/skeleton';

const announcementFormSchema = z.object({
  eventId: z.string().min(1, 'You must select an event.'),
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  body: z.string().optional(),
  audience: z.enum(['competitors', 'officials', 'public']),
  pinned: z.boolean(),
  publishAt: z.date().optional(),
});

type AnnouncementFormValues = z.infer<typeof announcementFormSchema>;
type SubmitAction = 'draft' | 'publish';

export default function NewAnnouncementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUserStore();
  const initialEventId = searchParams.get('eventId');
  const { push: toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [events, setEvents] = React.useState<EventLite[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = React.useState(true);
  const [submitAction, setSubmitAction] = React.useState<SubmitAction>('draft');

  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: {
      eventId: initialEventId || '',
      title: '',
      body: '',
      audience: 'competitors',
      pinned: false,
      publishAt: undefined,
    },
  });

  React.useEffect(() => {
    if (user?.id) {
        setIsLoadingEvents(true);
        listOrganizerEvents(db, user.id).then(fetchedEvents => {
            setEvents(fetchedEvents);
            setIsLoadingEvents(false);
            if (!initialEventId && fetchedEvents.length > 0) {
                form.setValue('eventId', fetchedEvents[0].id);
            }
        });
    }
  }, [user?.id, initialEventId, form]);

  const onSubmit = async (data: AnnouncementFormValues) => {
    setIsSubmitting(true);
    
    try {
        const payload: any = {
          eventId: data.eventId,
          title: (data.title || '').trim(),
          body:  data.body ?? '',
          audience: data.audience,
          pinned: data.pinned,
        };
        
        if (submitAction === 'publish') {
            payload.publishAt = new Date().toISOString();
        } else if (data.publishAt) {
            payload.publishAt = data.publishAt.toISOString();
        }


        const res:any = await createAnnouncementFn(payload);
        
        toast({ kind:'success', text: res.status === 'published' ? 'Published' : res.status === 'scheduled' ? 'Scheduled' : 'Saved draft' });
        router.push(`/announcements?event=${data.eventId}`);
    } catch (e: any) {
       const msg = e?.message || e?.code || 'Create failed';
       const details = e?.details ? ` (${JSON.stringify(e.details)})` : '';
       toast({ kind:'error', text: `Create failed: ${msg}${details}` });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleButtonClick = (action: SubmitAction) => {
    setSubmitAction(action);
    form.handleSubmit(onSubmit)();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Announcement</CardTitle>
        <CardDescription>Create a new announcement for your event.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={e => e.preventDefault()} className="space-y-6">
             <FormField
                control={form.control}
                name="eventId"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Event</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={isLoadingEvents}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder={isLoadingEvents ? "Loading events..." : "Select an event"} />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {!isLoadingEvents && events.length === 0 && (
                                <SelectItem value="no-events" disabled>No events found</SelectItem>
                            )}
                            {events.map((event) => (
                                <SelectItem key={event.id} value={event.id}>
                                    {event.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />
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
                 <Button type="button" onClick={() => handleButtonClick('publish')} disabled={isSubmitting || isLoadingEvents} className="bg-accent hover:bg-accent/90">
                    {isSubmitting && submitAction === 'publish' ? 'Publishing...' : 'Publish'}
                </Button>
                <Button type="button" onClick={() => handleButtonClick('draft')} disabled={isSubmitting || isLoadingEvents} variant="outline">
                     {isSubmitting && submitAction === 'draft' ? 'Saving...' : 'Save Draft'}
                </Button>
                 <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
