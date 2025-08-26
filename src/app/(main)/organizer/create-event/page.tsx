
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Link as LinkIcon, Upload, Trash2, FileText, Globe, PlusCircle } from 'lucide-react';

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

const linkSchema = z.object({
  value: z.string().url({ message: "Please enter a valid URL." }).or(z.literal('')),
});

const fileSchema = z.object({
  value: z.any().optional(),
});

const formSchema = z.object({
  title: z.string().min(3, { message: 'Event title must be at least 3 characters.' }),
  dates: z.object({
    from: z.date({ required_error: 'A start date is required.' }),
    to: z.date({ required_error: 'An end date is required.' }),
  }),
  hqLocation: z.string().min(3, { message: 'HQ Location is required.' }),
  whatsappLink: z.string().url().optional().or(z.literal('')),
  livestreamLink: z.string().url().optional().or(z.literal('')),
  itineraryLinks: z.array(linkSchema).optional(),
  itineraryFiles: z.array(fileSchema).optional(),
  docsLinks: z.array(linkSchema).optional(),
  docsFiles: z.array(fileSchema).optional(),
  stages: z.array(z.object({
    name: z.string().min(1, { message: 'Stage name is required.' }),
    location: z.string().min(1, { message: 'Location is required.' }),
    distance: z.coerce.number().min(0.1, { message: 'Distance must be positive.' }),
  })).optional().default([]),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateEventPage() {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
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
      itineraryFiles: [],
      docsLinks: [],
      docsFiles: [],
      stages: [],
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


  function onSubmit(values: FormValues) {
    console.log(values);
    toast({
      title: "Event Created Successfully!",
      description: `The event "${values.title}" has been created.`,
    });
    router.push('/dashboard');
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
                            <Popover>
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
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={field.value?.from}
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    numberOfMonths={2}
                                />
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
                <FormDescription>Provide links to the itinerary, upload files, or both.</FormDescription>
                <div className="grid md:grid-cols-[1fr_auto_1fr] items-start gap-4">
                    <div className="space-y-2">
                        <FormLabel className="flex items-center gap-2"><Globe className="h-4 w-4"/>Itinerary Link(s)</FormLabel>
                        {renderLinkInputs(itineraryLinkFields, removeItineraryLink, appendItineraryLink, 'itineraryLinks')}
                    </div>
                    <div className="flex flex-col items-center self-center pt-8">
                        <span className="text-sm text-muted-foreground">OR</span>
                    </div>
                     <div className="space-y-2">
                        <FormLabel className="flex items-center gap-2"><Upload className="h-4 w-4"/>Itinerary Upload(s)</FormLabel>
                        {renderFileInputs(itineraryFileFields, removeItineraryFile, appendItineraryFile, 'itineraryFiles')}
                    </div>
                </div>
            </div>
             <div className="space-y-4 rounded-lg border p-4">
                <FormLabel className="flex items-center gap-2 text-base"><FileText/>Documents (Optional)</FormLabel>
                <FormDescription>Provide links to documents, upload files, or both.</FormDescription>
                <div className="grid md:grid-cols-[1fr_auto_1fr] items-start gap-4">
                     <div className="space-y-2">
                        <FormLabel className="flex items-center gap-2"><Globe className="h-4 w-4"/>Documents Link(s)</FormLabel>
                        {renderLinkInputs(docsLinkFields, removeDocsLink, appendDocsLink, 'docsLinks')}
                    </div>
                     <div className="flex flex-col items-center self-center pt-8">
                        <span className="text-sm text-muted-foreground">OR</span>
                    </div>
                    <div className="space-y-2">
                        <FormLabel className="flex items-center gap-2"><Upload className="h-4 w-4"/>Documents Upload(s)</FormLabel>
                        {renderFileInputs(docsFileFields, removeDocsFile, appendDocsFile, 'docsFiles')}
                    </div>
                </div>
            </div>

            <Button type="submit" className="bg-accent hover:bg-accent/90">Create Event</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
