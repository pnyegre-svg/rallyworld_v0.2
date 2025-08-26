
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { z } from 'zod';

const stageSchema = z.object({
  name: z.string(),
  location: z.string(),
  distance: z.number(),
});

const eventSchema = z.object({
  id: z.string(),
  title: z.string(),
  dates: z.object({
    from: z.date(),
    to: z.date(),
  }),
  hqLocation: z.string(),
  whatsappLink: z.string().optional(),
  livestreamLink: z.string().optional(),
  itineraryLinks: z.array(z.object({ value: z.string() })).optional(),
  itineraryFiles: z.array(z.object({ value: z.any() })).optional(),
  docsLinks: z.array(z.object({ value: z.string() })).optional(),
  docsFiles: z.array(z.object({ value: z.any() })).optional(),
  stages: z.array(stageSchema),
});

export type Event = z.infer<typeof eventSchema>;

type EventState = {
  events: Event[];
  addEvent: (event: Event) => void;
};

export const useEventStore = create<EventState>()(
  persist(
    (set) => ({
      events: [],
      addEvent: (event) => {
        // Zod validation on dates can be tricky with persistence, so we convert them to strings
        const eventWithSerializableDates = {
            ...event,
            dates: {
                from: event.dates.from.toISOString(),
                to: event.dates.to.toISOString(),
            }
        };

        set((state) => ({
          events: [...state.events, event],
        }));
      },
    }),
    {
      name: 'event-storage',
      storage: createJSONStorage(() => sessionStorage),
       // Custom serializer to handle Date objects
       serialize: (state) => {
        return JSON.stringify({
          ...state,
          state: {
            ...state.state,
            events: state.state.events.map(event => ({
              ...event,
              dates: {
                from: event.dates.from.toISOString(),
                to: event.dates.to.toISOString(),
              },
            })),
          },
        });
      },
      deserialize: (str) => {
        const state = JSON.parse(str);
        return {
          ...state,
          state: {
            ...state.state,
            events: state.state.events.map((event: any) => ({
              ...event,
              dates: {
                from: new Date(event.dates.from),
                to: new Date(event.dates.to),
              },
            })),
          },
        };
      },
    }
  )
);
