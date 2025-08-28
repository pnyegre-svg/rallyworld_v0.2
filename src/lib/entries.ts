
import { collection, query, where, getDocs, onSnapshot, Firestore, Timestamp, Unsubscribe, orderBy, doc, updateDoc } from 'firebase/firestore';

export type Entry = {
    id: string;
    eventId: string;
    competitorId: string;
    competitorName: string;
    status: 'new' | 'approved' | 'declined';
    paymentStatus: 'unpaid' | 'paid';
    feeAmount: number;
    currency: string;
    createdAt: Timestamp;
};

const entryConverter = {
  fromFirestore: (snapshot: any, options: any): Entry => {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      eventId: data.eventId,
      competitorId: data.competitorId,
      competitorName: data.competitorName,
      status: data.status,
      paymentStatus: data.paymentStatus,
      feeAmount: data.feeAmount,
      currency: data.currency,
      createdAt: data.createdAt,
    };
  },
  toFirestore: (entry: Entry) => {
    // eslint-disable-next-line no-unused-vars
    const { id, ...data } = entry;
    return data;
  }
};


export const watchEntries = (
    db: Firestore, 
    eventId: string, 
    callback: (entries: Entry[]) => void
): Unsubscribe => {
    const entriesCollection = collection(db, `events/${eventId}/entries`).withConverter(entryConverter as any);
    const q = query(entriesCollection, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const entries = querySnapshot.docs.map(doc => doc.data() as Entry);
        callback(entries);
    }, (error) => {
        console.error("Error watching entries: ", error);
        callback([]);
    });

    return unsubscribe;
};

export async function fetchEntriesForEvent(db: Firestore, eventId: string): Promise<Entry[]> {
    const q = query(collection(db, 'events', eventId, 'entries'), orderBy('createdAt','desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d=> ({ id:d.id, ...(d.data() as any) })) as Entry[];
}

export async function approveEntryLocal(db: Firestore, eventId:string, entryId:string){
    await updateDoc(doc(db,'events',eventId,'entries',entryId), { status:'approved' });
}
export async function markEntryPaidLocal(db: Firestore, eventId:string, entryId:string){
    await updateDoc(doc(db,'events',eventId,'entries',entryId), { paymentStatus:'paid' });
}
