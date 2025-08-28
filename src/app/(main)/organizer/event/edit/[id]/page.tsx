
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { format, subMonths, startOfYear, endOfYear, subYears, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { Calendar as CalendarIcon, Link as LinkIcon, Upload, Trash2, FileText, Globe, PlusCircle, Flag, MapPin, Route, Image as ImageIcon, Award, Text } from 'lucide-react';
import { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation';
import { useUserStore } from '@/hooks/use-user';
import { getEvent, updateEvent, eventFormSchema, EventFormValues } from '@/lib/events';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { uploadFile } from '@/lib/storage';
import { db } from '@/lib/firebase.client';

export default function EditEventPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const { user } = useUserStore();
  const [loading, setLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [datePopoverOpen, setDatePopoverOpen] = React.useState(false);
  const eventId = params.id as string;
  
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: '',
      hqLocation: '',
      whatsappLink: '',
      livestreamLink: '',
      coverImage: undefined,
      logoImage: undefined,
      itineraryLinks: [],
      itineraryFiles: [],
      docsLinks: [],
      docsFiles: [],
      stages: [],
      organizerId: user.organizerProfile?.id || '',
    },
  });

  React.useEffect(() => {
    if (eventId) {
      const fetchEventData = async () => {
        setLoading(true);
        try {
            const eventToEdit = await getEvent(db, eventId);
            if (eventToEdit) {
                // Ensure the current user is the owner of the event
                if (eventToEdit.organizerId !== user.organizerProfile?.id) {
                     toast({
                        title: "Permission Denied",
                        description: "You are not authorized to edit this event.",
                        variant: "destructive",
                    });
                    router.push('/dashboard');
                    return;
                }
              form.reset({
                ...eventToEdit,
                itineraryFiles: (eventToEdit.itineraryFiles || []).map(f => ({file: f})),
                docsFiles: (eventToEdit.docsFiles || []).map(f => ({file: f})),
              });
            } else {
               toast({
                    title: "Event Not Found",
                    description: "Could not find the event you are trying to edit.",
                    variant: "destructive",
                });
               router.push('/dashboard');
            }
        } catch (error) {
             toast({
                title: "Error loading event",
                description: "There was a problem fetching the event data.",
                variant: "destructive",
            });
            router.push('/dashboard');
        } finally {
            setLoading(false);
        }
      };
      fetchEventData();
    }
  }, [eventId, form, router, user.organizerProfile?.id, toast]);

  const { fields: stageFields, append: appendStage, remove: removeStage } = useFieldArray({
    control: form.control,
    name: "stages"
  });

  const { fields: itineraryLinkFields, append: appendItineraryLink, remove: removeItineraryLink } = useFieldArray({
    control: form.control,
    name: "itineraryLinks"
  });
  const { fields: itineraryFileFields, append: appendItineraryFile, remove: removeItineraryFile } = useFieldArray({
    control: form.control,
    name: "itineraryFiles"
  });

  const { fields: docsLinkFields, append: appendDocsLink, remove: removeDocsLink } = useFieldArray({
    control: form.control,
    name: "docsLinks"
  });
  const { fields: docsFileFields, append: appendDocsFile, remove: removeDocsFile } = useFieldArray({
    control: form.control,
    name: "docsFiles"
  });


  async function onSubmit(values: EventFormValues) {
    setIsSubmitting(true);
    try {
        const dataToUpdate: Partial<EventFormValues> = { ...values };

        if (values.coverImage instanceof File) {
          dataToUpdate.coverImage = await uploadFile(values.coverImage, 'organizer');
        }
        if (values.logoImage instanceof File) {
          dataToUpdate.logoImage = await uploadFile(values.logoImage, 'organizer');
        }

        // Remove undefined properties before saving to Firestore
        Object.keys(dataToUpdate).forEach(key => {
            const K = key as keyof typeof dataToUpdate;
            if (dataToUpdate[K] === undefined) {
              delete dataToUpdate[K];
            }
        });

        await updateEvent(db, eventId, dataToUpdate);

        toast({
            title: "Event Updated Successfully!",
            description: `The event "${values.title}" has been updated.`,
        });
        router.push('/dashboard');
    } catch (error) {
        console.error("Error updating event:", error);
        toast({
            title: "Failed to update event",
            description: "An error occurred while saving the event. Please try again.",
            variant: "destructive"
        })
    } finally {
        setIsSubmitting(false);
    }
  }

  const renderLinkInputs = (fields: any, remove: any, append: any, namePrefix: 'itineraryLinks' | 'docsLinks') => (
    <div className="space-y-4">
      {fields.map((field: any, index: number) => (
         <div key={field.id} className="space-y-2 p-3 rounded-md border bg-muted/30">
             <FormField
                control={form.control}
                name={`${namePrefix}.${index}.name`}
                render={({ field: formField }) => (
                    <FormItem>
                         <FormLabel className="sr-only">Link Name</FormLabel>
                         <div className="relative">
                            <Text className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input {...formField} placeholder="e.g. Official Regulations" className="pl-9" />
                        </div>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                key={field.id}
                control={form.control}
                name={`${namePrefix}.${index}.value`}
                render={({ field: formField }) => (
                    <FormItem>
                        <FormLabel className="sr-only">Link URL</FormLabel>
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input {...formField} placeholder="https://..." className="pl-9" />
                            </div>
                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        <FormMessage />
                    </FormItem>
                )}
            />
         </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => append({ name: "", value: "" })}>
        <PlusCircle className="mr-2 h-4 w-4"/> Add Link
      </Button>
    </div>
  );
  
  const renderFileInputs = (fields: any, remove: any, append: any, namePrefix: 'itineraryFiles' | 'docsFiles') => (
    <div className="space-y-2">
      {fields.map((field: any, index: number) => (
         <FormField
            key={field.id}
            control={form.control}
            name={`${namePrefix}.${index}.file`}
            render={({ field: { onChange, value, ...rest }}) => {
                const currentFile = value;
                return (
                <FormItem>
                    <div className="flex items-center gap-2">
                         <FormControl>
                            <Input 
                                type="file" 
                                onChange={(e) => onChange(e.target.files?.[0])} 
                                {...rest}
                                className="flex-1"
                            />
                        </FormControl>
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                    {typeof currentFile === 'object' && currentFile?.url && (
                        <FormDescription>
                           Current file: <a href={currentFile.url} target="_blank" rel="noreferrer" className="text-primary underline">{currentFile.name}</a>
                        </FormDescription>
                    )}
                     <FormMessage />
                </FormItem>
            )}}
        />
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => append({ file: undefined })}>
        <PlusCircle className="mr-2 h-4 w-4"/> Add File
      </Button>
    </div>
  );


  const DatePresetButton = ({ label, range, setRange }: { label: string, range: DateRange, setRange: (range: DateRange | undefined) => void }) => (
    <Button
      type="button"
      variant="ghost"
      className="w-full justify-start px-2 py-1.5 text-left h-auto font-normal"
      onClick={() => setRange(range)}
    >
      {label}
    </Button>
  );

  if (loading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    <Skeleton className="h-8 w-1/2" />
                </CardTitle>
                <CardDescription>
                     <Skeleton className="h-4 w-3/4" />
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                 <div className="grid md:grid-cols-2 gap-8">
                     <div className="space-y-8">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                     </div>
                      <div className="space-y-8">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                     </div>
                 </div>
                 <Skeleton className="h-40 w-full" />
                 <Skeleton className="h-10 w-32" />
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Rally Event</CardTitle>
        <CardDescription>Update the details for your event below.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-8">
                <div className="space-y-8">
                     <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Event Title</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. Rally România" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <FormField
                      control={form.control}
                      name="dates"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Event Dates</FormLabel>
                          <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={'outline'}
                                  className={cn(
                                    'w-full justify-start text-left font-normal',
                                    !field.value?.from && 'text-muted-foreground'
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {field.value?.from ? (
                                    field.value.to ? (
                                      <>
                                        {format(new Date(field.value.from), 'LLL dd, y')} -{' '}
                                        {format(new Date(field.value.to), 'LLL dd, y')}
                                      </>
                                    ) : (
                                      format(new Date(field.value.from), 'LLL dd, y')
                                    )
                                  ) : (
                                    <span>Pick a date range</span>
                                  )}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <div className="flex">
                                     <div className="flex flex-col space-y-1 p-3 pr-2 border-r">
                                        <DatePresetButton label="Today" range={{ from: new Date(), to: new Date() }} setRange={(range) => field.onChange(range)} />
                                        <DatePresetButton label="This Week" range={{ from: startOfWeek(new Date()), to: endOfWeek(new Date()) }} setRange={(range) => field.onChange(range)} />
                                        <DatePresetButton label="This Month" range={{ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }} setRange={(range) => field.onChange(range)} />
                                        <DatePresetButton label="Last Month" range={{ from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) }} setRange={(range) => field.onChange(range)} />
                                        <DatePresetButton label="This Year" range={{ from: startOfYear(new Date()), to: endOfYear(new Date()) }} setRange={(range) => field.onChange(range)} />
                                        <DatePresetButton label="Last Year" range={{ from: startOfYear(subYears(new Date(), 1)), to: endOfYear(subYears(new Date(), 1)) }} setRange={(range) => field.onChange(range)} />
                                    </div>
                                    <div className="flex flex-col">
                                        <Calendar
                                            initialFocus
                                            mode="range"
                                            defaultMonth={field.value?.from ? new Date(field.value.from) : undefined}
                                            selected={{from: field.value?.from ? new Date(field.value.from) : undefined, to: field.value?.to ? new Date(field.value.to) : undefined}}
                                            onSelect={(range) => field.onChange(range)}
                                            numberOfMonths={2}
                                        />
                                        <div className="flex justify-end gap-2 p-3 border-t">
                                            <Button type="button" variant="ghost" onClick={() => setDatePopoverOpen(false)}>Cancel</Button>
                                            <Button type="button" className="bg-accent hover:bg-accent/90" onClick={() => setDatePopoverOpen(false)}>Apply</Button>
                                        </div>
                                    </div>
                                </div>
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                        control={form.control}
                        name="hqLocation"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>HQ Location</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. Sibiu, Romania" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="coverImage"
                        render={({ field: { onChange, value, ...rest }}) => (
                        <FormItem>
                            <FormLabel className="flex items-center gap-2"><ImageIcon className="h-4 w-4"/> Event Cover Image</FormLabel>
                            <FormControl>
                                <Input type="file" accept="image/*" onChange={(e) => onChange(e.target.files?.[0])} {...rest} />
                            </FormControl>
                            <FormDescription>Recommended: 1200x630px. {typeof value === 'string' && value && <a href={value} target="_blank" rel="noreferrer" className="text-primary underline">Current image</a>}</FormDescription>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="logoImage"
                        render={({ field: { onChange, value, ...rest }}) => (
                        <FormItem>
                            <FormLabel className="flex items-center gap-2"><Award className="h-4 w-4"/> Event Logo</FormLabel>
                            <FormControl>
                                <Input type="file" accept="image/*" onChange={(e) => onChange(e.target.files?.[0])} {...rest} />
                            </FormControl>
                            <FormDescription>Recommended: 1242x525px. {typeof value === 'string' && value && <a href={value} target="_blank" rel="noreferrer" className="text-primary underline">Current image</a>}</FormDescription>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
                <div className="space-y-8">
                     <FormField
                        control={form.control}
                        name="whatsappLink"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>WhatsApp Chat Link (Optional)</FormLabel>
                            <FormControl>
                                <Input placeholder="https://chat.whatsapp.com/..." {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <FormField
                        control={form.control}
                        name="livestreamLink"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Live Stream (YouTube/Facebook) (Optional)</FormLabel>
                            <FormControl>
                                <Input placeholder="https://youtube.com/live/..." {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>
            
             <div className="space-y-6 rounded-lg border p-4">
                 <h3 className="text-lg font-medium">Event Stages</h3>
                <div className="space-y-4">
                    {stageFields.map((item, index) => (
                        <div key={item.id} className="grid grid-cols-[1fr_1fr_auto_auto] items-start gap-4 p-3 rounded-md border bg-muted/30">
                            <FormField
                                control={form.control}
                                name={`stages.${index}.name`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={cn(index !== 0 && "sr-only", "flex items-center gap-2")}>
                                           <Flag className="h-4 w-4"/> Stage Name
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="e.g. SS1 - Col de Turini" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`stages.${index}.location`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={cn(index !== 0 && "sr-only", "flex items-center gap-2")}>
                                            <MapPin className="h-4 w-4"/> Location
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="e.g. Monte Carlo" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name={`stages.${index}.distance`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={cn(index !== 0 && "sr-only", "flex items-center gap-2")}>
                                            <Route className="h-4 w-4"/> Distance (km)
                                        </FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} placeholder="15.31" className="w-32"/>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeStage(index)}
                                className={cn(index !== 0 ? "mt-8" : "mt-8")}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendStage({ name: '', location: '', distance: 0 })}
                >
                   <PlusCircle className="mr-2 h-4 w-4"/> Add Stage
                </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base"><FileText/>Itinerary (Optional)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormDescription>Provide links or upload files for the event itinerary.</FormDescription>
                        <div className="space-y-2">
                            <FormLabel className="flex items-center gap-2"><Globe className="h-4 w-4"/>Itinerary Link(s)</FormLabel>
                            {renderLinkInputs(itineraryLinkFields, removeItineraryLink, appendItineraryLink, 'itineraryLinks')}
                        </div>
                        <Separator />
                        <div className="space-y-2">
                            <FormLabel className="flex items-center gap-2"><Upload className="h-4 w-4"/>Upload File(s)</FormLabel>
                            {renderFileInputs(itineraryFileFields, removeItineraryFile, appendItineraryFile, 'itineraryFiles')}
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base"><FileText/>Documents (Optional)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormDescription>Provide links or upload files for event documents.</FormDescription>
                        <div className="space-y-2">
                            <FormLabel className="flex items-center gap-2"><Globe className="h-4 w-4"/>Documents Link(s)</FormLabel>
                            {renderLinkInputs(docsLinkFields, removeDocsLink, appendDocsLink, 'docsLinks')}
                        </div>
                        <Separator />
                        <div className="space-y-2">
                            <FormLabel className="flex items-center gap-2"><Upload className="h-4 w-4"/>Upload File(s)</FormLabel>
                            {renderFileInputs(docsFileFields, removeDocsFile, appendDocsFile, 'docsFiles')}
                        </div>
                    </CardContent>
                </Card>
            </div>


            <Button type="submit" className="bg-accent hover:bg-accent/90" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
