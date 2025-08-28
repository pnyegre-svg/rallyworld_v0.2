
'use client';

import { doc, onSnapshot } from 'firebase/firestore';
import { httpsCallable, getFunctions } from 'firebase/functions';
import { auth, db } from './firebase.client';


const fns = getFunctions(auth.app);

export function watchSummary(uid:string, cb:(d:any)=>void){
    return onSnapshot(doc(db,'dashboard_summary',uid), snap => cb(snap.data()));
}


export async function approveEntry(eventId:string, entryId:string){
    await httpsCallable(fns,'approveEntryFn')({eventId, entryId});
}

export async function markEntryPaid(eventId:string, entryId:string){
    await httpsCallable(fns,'markEntryPaidFn')({eventId, entryId});
}
