'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const stageFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  order: z.coerce.number().int().optional(),
  startAt: z.string().optional(), // Using string for datetime-local input
  location: z.string().optional(),
  distanceKm: z.coerce.number().optional(),
  notes: z.string().optional(),
});

type StageFormValues = z.infer<typeof stageFormSchema>;

interface StageFormProps {
  initial?: Partial<StageFormValues>;
  onSubmit: (values: StageFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function StageForm({ initial, onSubmit, onCancel, isSubmitting }: StageFormProps) {
  const form = useForm<StageFormValues>({
    resolver: zodResolver(stageFormSchema),
    defaultValues: initial || {
      name: '',
      order: 0,
      startAt: '',
      location: '',
      distanceKm: undefined,
      notes: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Stage Name</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., SS1 Poiana" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="order"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Order</FormLabel>
                <FormControl>
                    <Input type="number" placeholder="1" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <FormField
          control={form.control}
          name="startAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Time</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., Brașov" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="distanceKm"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Distance (km)</FormLabel>
                <FormControl>
                    <Input type="number" step="0.01" placeholder="12.5" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Any additional notes about the stage..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="bg-accent hover:bg-accent/90">
            {isSubmitting ? 'Saving...' : 'Save Stage'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
