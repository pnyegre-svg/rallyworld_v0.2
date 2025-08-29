'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams, useRouter } from 'next/navigation';
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
import { getAnnouncement, updateAnnouncementFn, publishAnnouncementFn, deleteAnnouncementFn, type Announcement } from '@/lib/announcements.client';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarIcon, PinIcon, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
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


const announcementFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  body: z.string().optional(),
  audience: z.enum(['competitors', 'officials', 'public']),
  pinned: z.boolean(),
  publishAt: z.date().optional(),
});

type AnnouncementFormValues = z.infer<typeof announcementFormSchema>;
type SubmitAction = 'save' | 'publish' | 'delete';

export default function EditAnnouncementPage() {
  const router = useRouter();
  const params = useParams();
  const { eventId, annId } = params;
  const { push: toast } = useToast();
  const [announcement, setAnnouncement] = React.useState<Announcement | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitAction, setSubmitAction] = React.useState<SubmitAction>('save');

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
    if (eventId && annId) {
      getAnnouncement(eventId as string, annId as string).then(ann => {
        if (ann) {
          setAnnouncement(ann);
          form.reset({
            title: ann.title,
            body: ann.body,
            audience: ann.audience,
            pinned: ann.pinned,
            publishAt: ann.publishAt ? (ann.publishAt.toDate ? ann.publishAt.toDate() : new Date(ann.publishAt)) : undefined,
          });
        } else {
          toast({ kind: 'error', text: 'Announcement not found.' });
          router.push('/announcements');
        }
        setIsLoading(false);
      });
    }
  }, [eventId, annId, form, router, toast]);

  const onSubmit = async (data: AnnouncementFormValues) => {
    setIsSubmitting(true);
    const payload = { eventId: eventId as string, annId: annId as string };

    try {
        if (submitAction === 'publish') {
            await publishAnnouncementFn(payload);
            toast({ kind: 'success', text: 'Announcement published successfully.' });
        } else {
            await updateAnnouncementFn({ ...payload, ...data });
            toast({ kind: 'success', text: 'Announcement updated successfully.' });
        }
      router.push(`/announcements?event=${eventId}`);
    } catch (e: any) {
      toast({ kind: 'error', text: e.message || `Failed to ${submitAction} announcement.` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
     try {
      await deleteAnnouncementFn({ eventId: eventId as string, annId: annId as string });
      toast({ kind: 'success', text: 'Announcement deleted.' });
      router.push(`/announcements?event=${eventId}`);
    } catch (e: any) {
      toast({ kind: 'error', text: e.message || 'Failed to delete announcement.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleButtonClick = (action: SubmitAction) => {
    setSubmitAction(action);
    form.handleSubmit(onSubmit)();
  };


  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Announcement</CardTitle>
        <CardDescription>Make changes to your announcement below. Current status: <span className="font-bold capitalize">{announcement?.status}</span></CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
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
            <div className="flex justify-between items-center">
                <div className="flex gap-2">
                    {announcement?.status !== 'published' && (
                        <Button type="button" onClick={() => handleButtonClick('publish')} disabled={isSubmitting} className="bg-accent hover:bg-accent/90">
                            {isSubmitting && submitAction === 'publish' ? 'Publishing...' : 'Publish'}
                        </Button>
                    )}
                    <Button type="button" onClick={() => handleButtonClick('save')} disabled={isSubmitting} variant="outline">
                        {isSubmitting && submitAction === 'save' ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
                </div>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button type="button" variant="destructive" disabled={isSubmitting}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete this announcement. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                                {isSubmitting ? 'Deleting...' : 'Yes, delete'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
