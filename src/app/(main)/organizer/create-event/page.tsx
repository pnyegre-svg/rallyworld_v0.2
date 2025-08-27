
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { format, subMonths, startOfYear, endOfYear, subYears, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { Calendar as CalendarIcon, Link as LinkIcon, Upload, Trash2, FileText, Globe, PlusCircle, Flag, MapPin, Route, Image as ImageIcon, Award, ArrowRight } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import Link from 'next/link';

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
import { useRouter } from 'next/navigation';
import { addEvent, eventFormSchema, EventFormValues } from '@/lib/events';
import { useUserStore } from '@/hooks/use-user';
import { Separator } from '@/components/ui/separator';
import { uploadFile } from '@/lib/storage';
import { ActionCard } from '@/components/ui/action-card';


export default function CreateEventPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useUserStore();
  const [datePopoverOpen, setDatePopoverOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: '',
      dates: {
        from: undefined,
        to: undefined,
      },
      hqLocation: '',
      coverImage: undefined,
      logoImage: undefined,
      whatsappLink: '',
      livestreamLink: '',
      itineraryLinks: [],
      itineraryFiles: [],
      docsLinks: [],
      docsFiles: [],
      stages: [],
      organizerId: user.organizerProfile?.id || '',
    },
  });

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
    if (!user.organizerProfile?.id) {
        toast({
            title: "Error",
            description: "You must have an organizer profile to create an event.",
            variant: "destructive",
        });
        return;
    }
    
    setIsSubmitting(true);
    
    try {
      const eventId = `evt_${Date.now()}`;
      
      const dataToSave: Omit<EventFormValues, 'coverImage' | 'logoImage' | 'itineraryFiles' | 'docsFiles'> & { coverImage?: string, logoImage?: string, itineraryFiles?: any[], docsFiles?: any[]} = { 
        ...values,
        organizerId: user.organizerProfile.id,
      };

      if (values.coverImage instanceof File) {
        const coverImageUrl = await uploadFile(values.coverImage, `events/${eventId}/cover_${values.coverImage.name}`);
        dataToSave.coverImage = coverImageUrl;
      }
      if (values.logoImage instanceof File) {
        const logoImageUrl = await uploadFile(values.logoImage, `events/${eventId}/logo_${values.logoImage.name}`);
        dataToSave.logoImage = logoImageUrl;
      }
      
      const uploadAndGetURL = async (fileObj: { file?: File }, path: string) => {
        if (fileObj.file instanceof File) {
          const url = await uploadFile(fileObj.file, path);
          return { url, name: fileObj.file.name, type: fileObj.file.type, size: fileObj.file.size };
        }
        return undefined; // If it's not a file, ignore it
      };

      if (values.itineraryFiles && values.itineraryFiles.length > 0) {
          const uploadedFiles = await Promise.all(
              values.itineraryFiles.map(async (fileObj) => 
                  uploadAndGetURL(fileObj, `events/${eventId}/itinerary/${fileObj.file?.name}`)
              )
          );
          dataToSave.itineraryFiles = uploadedFiles.filter(Boolean); // Filter out undefined results
      } else {
        dataToSave.itineraryFiles = [];
      }

      if (values.docsFiles && values.docsFiles.length > 0) {
          const uploadedFiles = await Promise.all(
              values.docsFiles.map(async (fileObj) => 
                  uploadAndGetURL(fileObj, `events/${eventId}/docs/${fileObj.file?.name}`)
              )
          );
          dataToSave.docsFiles = uploadedFiles.filter(Boolean); // Filter out undefined results
      } else {
        dataToSave.docsFiles = [];
      }

      await addEvent(dataToSave as any);
      
      toast({
        title: "Event Created Successfully!",
        description: `The event "${values.title}" has been created.`,
      });
      router.push('/dashboard');
    } catch (error) {
        console.error("Error creating event:", error);
        toast({
            title: "Failed to create event",
            description: "An error occurred while creating the event. Please try again.",
            variant: "destructive"
        })
    } finally {
        setIsSubmitting(false);
    }
  }

  const renderLinkInputs = (fields: any, remove: any, append: any, namePrefix: 'itineraryLinks' | 'docsLinks') => (
    <div className="space-y-2">
      {fields.map((field: any, index: number) => (
         <FormField
            key={field.id}
            control={form.control}
            name={`${namePrefix}.${index}.value`}
            render={({ field: formField }) => (
                <FormItem>
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
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => append({ value: "" })}>
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
            render={({ field: { onChange, value, ...rest }}) => (
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
                     <FormMessage />
                </FormItem>
            )}
        />
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => append({ file: undefined })}>
        <PlusCircle className="mr-2 h-4 w-4"/> Add File
      </Button>
    </div>
  );

  const DatePresetButton = ({ label, range, setRange }: { label: string, range: DateRange, setRange: (range: DateRange | undefined) => void }) => (
    <Button
      variant="ghost"
      className="w-full justify-start px-2 py-1.5 text-left h-auto font-normal"
      onClick={() => setRange(range)}
    >
      {label}
    </Button>
  );

  if (!user.organizerProfile?.id) {
    return (
        <ActionCard
            title="Complete Your Club Profile"
            description="You need to set up your club profile before you can create an event. This allows competitors to identify who is organizing the event."
            buttonText="Go to Club Profile"
            buttonIcon={<ArrowRight />}
            href="/organizer"
        />
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Rally Event</CardTitle>
        <CardDescription>Fill in the details below to set up your next event.</CardDescription>
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
                                        {format(field.value.from, 'LLL dd, y')} -{' '}
                                        {format(field.value.to, 'LLL dd, y')}
                                      </>
                                    ) : (
                                      format(field.value.from, 'LLL dd, y')
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
                                        <DatePresetButton label="Today" range={{ from: new Date(), to: new Date() }} setRange={field.onChange} />
                                        <DatePresetButton label="This Week" range={{ from: startOfWeek(new Date()), to: endOfWeek(new Date()) }} setRange={field.onChange} />
                                        <DatePresetButton label="This Month" range={{ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }} setRange={field.onChange} />
                                        <DatePresetButton label="Last Month" range={{ from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) }} setRange={field.onChange} />
                                        <DatePresetButton label="This Year" range={{ from: startOfYear(new Date()), to: endOfYear(new Date()) }} setRange={field.onChange} />
                                        <DatePresetButton label="Last Year" range={{ from: startOfYear(subYears(new Date(), 1)), to: endOfYear(subYears(new Date(), 1)) }} setRange={field.onChange} />
                                    </div>
                                    <div className="flex flex-col">
                                        <Calendar
                                            initialFocus
                                            mode="range"
                                            defaultMonth={field.value?.from}
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            numberOfMonths={2}
                                        />
                                        <div className="flex justify-end gap-2 p-3 border-t">
                                            <Button variant="ghost" onClick={() => setDatePopoverOpen(false)}>Cancel</Button>
                                            <Button className="bg-accent hover:bg-accent/90" onClick={() => setDatePopoverOpen(false)}>Apply</Button>
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
                            <FormLabel className="flex items-center gap-2"><ImageIcon className="h-4 w-4"/> Event Cover Image (Optional)</FormLabel>
                            <FormControl>
                                <Input type="file" accept="image/*" onChange={(e) => onChange(e.target.files?.[0])} {...rest}/>
                            </FormControl>
                            <FormDescription>Recommended: 1200x630px.</FormDescription>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="logoImage"
                        render={({ field: { onChange, value, ...rest }}) => (
                        <FormItem>
                            <FormLabel className="flex items-center gap-2"><Award className="h-4 w-4"/> Event Logo (Optional)</FormLabel>
                            <FormControl>
                                <Input type="file" accept="image/*" onChange={(e) => onChange(e.target.files?.[0])} {...rest}/>
                            </FormControl>
                            <FormDescription>Recommended: 512x512px.</FormDescription>
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
                            <FormLabel>Live Stream Link (YouTube/Facebook) (Optional)</FormLabel>
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
                {isSubmitting ? "Creating..." : "Create Event"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
