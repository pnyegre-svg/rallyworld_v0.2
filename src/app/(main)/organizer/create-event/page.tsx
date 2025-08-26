
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { format, subMonths, startOfYear, endOfYear, subYears, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { Calendar as CalendarIcon, Link as LinkIcon, Upload, Trash2, FileText, Globe, PlusCircle } from 'lucide-react';
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
import { useRouter } from 'next/navigation';
import { addEvent, eventFormSchema, EventFormValues } from '@/lib/events';
import { useUserStore } from '@/hooks/use-user';


export default function CreateEventPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useUserStore();
  const [datePopoverOpen, setDatePopoverOpen] = React.useState(false);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: '',
      dates: {
        from: undefined,
        to: undefined,
      },
      hqLocation: '',
      whatsappLink: '',
      livestreamLink: '',
      itineraryLinks: [],
      docsLinks: [],
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

  const { fields: docsLinkFields, append: appendDocsLink, remove: removeDocsLink } = useFieldArray({
    control: form.control,
    name: "docsLinks"
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

    try {
      await addEvent({ ...values, organizerId: user.organizerProfile.id });
      toast({
        title: "Event Created Successfully!",
        description: `The event "${values.title}" has been created.`,
      });
      router.push('/dashboard');
    } catch (error) {
        toast({
            title: "Failed to create event",
            description: "An error occurred while creating the event. Please try again.",
            variant: "destructive"
        })
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
          name={`${namePrefix}.${index}.value`}
          render={({ field: formField }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormControl>
                  <Input 
                    type="file" 
                    onChange={(e) => formField.onChange(e.target.files?.[0] || null)}
                    // This is a placeholder, actual file upload needs to be implemented
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
      <Button type="button" variant="outline" size="sm" onClick={() => append({ value: null })}>
        <PlusCircle className="mr-2 h-4 w-4" /> Add File
      </Button>
    </div>
  );

  const DatePresetButton = ({ label, range, setRange }: { label: string, range: DateRange, setRange: (range: DateRange | undefined) => void }) => (
    <Button
      variant="ghost"
      className="w-full justify-start px-2 py-1.5"
      onClick={() => setRange(range)}
    >
      {label}
    </Button>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Rally Event</CardTitle>
        <CardDescription>Fill in the details below to set up your next event.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
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
                                    <div className="flex-col space-y-2 border-r p-3">
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
                        <div key={item.id} className="grid grid-cols-[1fr_1fr_auto_auto] items-start gap-2 p-2 rounded-md border">
                            <FormField
                                control={form.control}
                                name={`stages.${index}.name`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={cn(index !== 0 && "sr-only")}>Stage Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="e.g. Col de Turini" />
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
                                        <FormLabel className={cn(index !== 0 && "sr-only")}>Location</FormLabel>
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
                                        <FormLabel className={cn(index !== 0 && "sr-only")}>Distance (km)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} placeholder="15.31" className="w-28"/>
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
                                className={cn(index !== 0 ? "mt-8" : "self-center")}
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


            <div className="space-y-4 rounded-lg border p-4">
                <FormLabel className="flex items-center gap-2 text-base"><FileText/>Itinerary (Optional)</FormLabel>
                <FormDescription>Provide links to the itinerary. File uploads are not yet supported.</FormDescription>
                <div className="space-y-2">
                    <FormLabel className="flex items-center gap-2"><Globe className="h-4 w-4"/>Itinerary Link(s)</FormLabel>
                    {renderLinkInputs(itineraryLinkFields, removeItineraryLink, appendItineraryLink, 'itineraryLinks')}
                </div>
            </div>
             <div className="space-y-4 rounded-lg border p-4">
                <FormLabel className="flex items-center gap-2 text-base"><FileText/>Documents (Optional)</FormLabel>
                <FormDescription>Provide links to documents. File uploads are not yet supported.</FormDescription>
                <div className="space-y-2">
                    <FormLabel className="flex items-center gap-2"><Globe className="h-4 w-4"/>Documents Link(s)</FormLabel>
                    {renderLinkInputs(docsLinkFields, removeDocsLink, appendDocsLink, 'docsLinks')}
                </div>
            </div>

            <Button type="submit" className="bg-accent hover:bg-accent/90" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creating..." : "Create Event"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
