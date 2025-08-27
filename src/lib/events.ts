
import { db } from './firebase';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, Timestamp, query, where } from 'firebase/firestore';
import { z } from 'zod';

const stageSchema = z.object({
  name: z.string().min(1, { message: 'Stage name is required.' }),
  location: z.string().min(1, { message: 'Location is required.' }),
  distance: z.coerce.number().min(0.1, { message: 'Distance must be positive.' }),
});

const linkSchema = z.object({
  value: z.string().url({ message: "Please enter a valid URL." }).or(z.literal('')),
});

export const eventFormSchema = z.object({
  title: z.string().min(3, { message: 'Event title must be at least 3 characters.' }),
  dates: z.object({
    from: z.date({ required_error: 'A start date is required.' }),
    to: z.date({ required_error: 'An end date is required.' }),
  }),
  hqLocation: z.string().min(3, { message: 'HQ Location is required.' }),
  coverImage: z.any().optional(),
  logoImage: z.any().optional(),
  whatsappLink: z.string().url().optional().or(z.literal('')),
  livestreamLink: z.string().url().optional().or(z.literal('')),
  itineraryLinks: z.array(linkSchema).optional(),
  itineraryFiles: z.any().optional(),
  docsLinks: z.array(linkSchema).optional(),
  docsFiles: z.any().optional(),
  stages: z.array(stageSchema).optional().default([]),
  organizerId: z.string(),
});

export type EventFormValues = z.infer<typeof eventFormSchema>;

export interface Event extends Omit<EventFormValues, 'coverImage' | 'logoImage'> {
    id: string;
    coverImage?: string; // URL as string
    logoImage?: string; // URL as string
}

// Firestore converter
const eventConverter = {
  toFirestore: (event: EventFormValues) => {
    // Dates are converted to Timestamps when creating the document
    const { dates, ...remaiingEventData } = event;
    return {
      ...remaiingEventData,
      dates: {
        from: Timestamp.fromDate(dates.from),
        to: Timestamp.fromDate(dates.to),
      }
    };
  },
  fromFirestore: (snapshot: any, options: any): Event => {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      title: data.title,
      hqLocation: data.hqLocation,
      organizerId: data.organizerId,
      dates: {
        from: data.dates.from.toDate(),
        to: data.dates.to.toDate(),
      },
      coverImage: data.coverImage,
      logoImage: data.logoImage,
      whatsappLink: data.whatsappLink || '',
      livestreamLink: data.livestreamLink || '',
      itineraryLinks: data.itineraryLinks || [],
      docsLinks: data.docsLinks || [],
      stages: data.stages || [],
    };
  }
};


const eventsCollection = collection(db, 'events').withConverter(eventConverter);

export const addEvent = async (eventData: EventFormValues) => {
  try {
    const docRef = await addDoc(eventsCollection, eventData);
    return docRef.id;
  } catch (error) {
    console.error("Error adding event: ", error);
    throw new Error("Could not create event.");
  }
};

export const getEvents = async (organizerId: string): Promise<Event[]> => {
    try {
      const q = query(eventsCollection, where("organizerId", "==", organizerId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error("Error getting events: ", error);
      return [];
    }
};

export const getEvent = async (eventId: string): Promise<Event | null> => {
    try {
        const docRef = doc(db, 'events', eventId).withConverter(eventConverter);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data();
        }
        return null;
    } catch (error) {
        console.error("Error getting event: ", error);
        return null;
    }
};

export const updateEvent = async (eventId: string, eventData: Partial<EventFormValues>) => {
    try {
        const docRef = doc(db, 'events', eventId);
        
        // Handle Date to Timestamp conversion for partial updates
        const dataToUpdate: any = { ...eventData };
        if (eventData.dates) {
            dataToUpdate.dates = {
                from: Timestamp.fromDate(eventData.dates.from),
                to: Timestamp.fromDate(eventData.dates.to)
            };
        }

        await updateDoc(docRef, dataToUpdate);
    } catch (error) {
        console.error("Error updating event: ", error);
        throw new Error("Could not update event.");
    }
};
