
'use client';

import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { httpsCallable, getFunctions } from 'firebase/functions';
import { db } from './firestore.client';
import { app } from './firebase';

const fns = getFunctions(app);

export function watchSummary(uid:string, cb:(d:any)=>void){
    return onSnapshot(doc(db(),'dashboard_summary',uid), snap => cb(snap.data()));
}


export async function approveEntry(eventId:string, entryId:string){
    await httpsCallable(fns,'approveEntry')({eventId, entryId});
}

export async function markEntryPaid(eventId:string, entryId:string){
    await httpsCallable(fns,'markEntryPaid')({eventId, entryId});
}
