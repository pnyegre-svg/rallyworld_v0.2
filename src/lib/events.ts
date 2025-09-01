
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, Timestamp, query, where, orderBy, Firestore } from 'firebase/firestore';
import { z } from 'zod';
import { httpsCallable } from 'firebase/functions';
import { fns } from './functions.region';

const stageSchema = z.object({
  name: z.string().min(1, { message: 'Stage name is required.' }),
  location: z.string().min(1, { message: 'Location is required.' }),
  distance: z.coerce.number().min(0.1, { message: 'Distance must be positive.' }),
});

const linkSchema = z.object({
  name: z.string().optional(),
  value: z.string().url({ message: "Please enter a valid URL." }).or(z.literal('')),
});

const fileSchema = z.object({
  file: z.any().optional(),
});


export const eventFormSchema = z.object({
  title: z.string().min(3, { message: 'Event title must be at least 3 characters.' }),
  public: z.boolean().default(false),
  dates: z.object({
    from: z.date({ required_error: 'A start date is required.' }),
    to: z.date({ required_error: 'An end date is required.' }),
  }),
  hqLocation: z.string().min(1, { message: 'HQ Location is required.' }),
  coverImage: z.any().optional(),
  logoImage: z.any().optional(),
  whatsappLink: z.string().url().optional().or(z.literal('')),
  livestreamLink: z.string().url().optional().or(z.literal('')),
  itineraryLinks: z.array(linkSchema).optional(),
  itineraryFiles: z.array(fileSchema).optional(),
  docsLinks: z.array(linkSchema).optional(),
  docsFiles: z.array(fileSchema).optional(),
  stages: z.array(stageSchema).optional().default([]),
  organizerId: z.string(),
});

export type EventFormValues = z.infer<typeof eventFormSchema>;

export interface Event extends Omit<EventFormValues, 'coverImage' | 'logoImage' | 'itineraryFiles' | 'docsFiles'> {
    id: string;
    coverImage?: string; // URL as string
    logoImage?: string; // URL as string
    itineraryFiles?: { url: string, name: string, type: string, size: number }[];
    docsFiles?: { url: string, name: string, type: string, size: number }[];
}

// Firestore converter
const eventConverter = {
  toFirestore: (event: Partial<EventFormValues>) => {
    const dataToSave: any = { ...event };
    // Dates are converted to Timestamps when creating the document
    if (event.dates?.from && event.dates?.to) {
        dataToSave.dates = {
            from: Timestamp.fromDate(event.dates.from),
            to: Timestamp.fromDate(event.dates.to),
        };
    }
    // Remove file objects before saving, they are handled separately
    delete dataToSave.coverImage;
    delete dataToSave.logoImage;
    delete dataToSave.itineraryFiles;
    delete dataToSave.docsFiles;
    
    return dataToSave;
  },
  fromFirestore: (snapshot: any, options: any): Event => {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      title: data.title,
      public: data.public ?? false,
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
      itineraryFiles: data.itineraryFiles || [],
      docsLinks: data.docsLinks || [],
      docsFiles: data.docsFiles || [],
      stages: data.stages || [],
    };
  }
};


export const addEvent = async (db: Firestore, eventData: Omit<EventFormValues, 'coverImage' | 'logoImage' | 'itineraryFiles' | 'docsFiles'>) => {
  const eventsCollection = collection(db, 'events');
  try {
    const dataToSave: any = { ...eventData };
    if (eventData.dates?.from && eventData.dates?.to) {
      dataToSave.dates = {
        from: Timestamp.fromDate(eventData.dates.from),
        to: Timestamp.fromDate(eventData.dates.to),
      };
    }
    const docRef = await addDoc(eventsCollection, dataToSave);
    return docRef.id;
  } catch (error) {
    console.error("Error adding event: ", error);
    throw new Error("Could not create event.");
  }
};

export const getEvents = async (db: Firestore, organizerId?: string): Promise<Event[]> => {
    const eventsCollection = collection(db, 'events').withConverter(eventConverter as any);
    try {
      let q;
      if (organizerId) {
        // Hotfix: Query only by organizerId to avoid composite index
        q = query(eventsCollection, where("organizerId", "==", organizerId));
      } else {
        q = query(eventsCollection, orderBy("dates.from", "asc"));
      }
      const querySnapshot = await getDocs(q);
      const events = querySnapshot.docs.map(doc => doc.data() as Event);

      // Hotfix: Sort in code if we queried by organizerId
      if (organizerId) {
        events.sort((a, b) => a.dates.from.getTime() - b.dates.from.getTime());
      }
      
      return events;

    } catch (error: any) {
      console.error("Error getting events: ", error);
      if (error.code === 'failed-precondition') {
        console.warn("Firestore index not found. Please create it in the Firebase console. The query will return an empty list until the index is built.");
        // We throw the error here so the calling code knows about it.
        throw new Error("A required Firestore index is missing. Please check the Firebase console.");
      }
      // Re-throw other errors
      throw error;
    }
};

export const getEvent = async (db: Firestore, eventId: string): Promise<Event | null> => {
    try {
        const docRef = doc(db, 'events', eventId).withConverter(eventConverter as any);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as Event;
        }
        return null;
    } catch (error) {
        console.error("Error getting event: ", error);
        return null;
    }
};

export const updateEvent = async (db: Firestore, eventId: string, eventData: Partial<EventFormValues>) => {
    try {
        const docRef = doc(db, 'events', eventId);
        
        // Handle Date to Timestamp conversion for partial updates
        const dataToUpdate: any = { ...eventData };
        if (eventData.dates?.from && eventData.dates?.to) {
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

export async function deleteEvent(eventId: string){
  return (await httpsCallable(fns, 'deleteEvent')({ eventId })).data as any;
}

export type EventLite = { id:string; title:string; dates: { from: Date, to: Date }, status:string };
export async function listOrganizerEvents(db: Firestore, uid: string): Promise<EventLite[]> {
    const q = query(collection(db,'events'), where('organizerId','==',uid));
    const snap = await getDocs(q);
    const events = snap.docs.map(d=> {
        const data = d.data();
        return { 
            id:d.id, 
            title: data.title,
            dates: {
                from: data.dates.from.toDate(),
                to: data.dates.to.toDate(),
            },
            status: data.status
        }
    });

    // Sort in memory to avoid composite index
    return events.sort((a,b) => b.dates.from.getTime() - a.dates.from.getTime());
}
