
'use client';

import { doc, onSnapshot, getDoc, enableIndexedDbPersistence } from 'firebase/firestore';
import { httpsCallable, getFunctions } from 'firebase/functions';
import { db } from './firestore.client';
import { app } from './firebase';

const fns = getFunctions(app);

// A flag to ensure this runs only once
let persistenceInitialized = false;

if (typeof window !== 'undefined' && !persistenceInitialized) {
    try {
        enableIndexedDbPersistence(db())
            .then(() => {
                persistenceInitialized = true;
            })
            .catch((error) => {
                 if (error.code == 'failed-precondition') {
                    console.warn('Firestore persistence failed to initialize. Multiple tabs open?');
                } else {
                    console.error('Error initializing Firestore persistence:', error);
                }
            });
    } catch (error) {
        console.error('An error occurred during persistence setup:', error);
    }
}


export function watchSummary(uid:string, cb:(d:any)=>void){
    return onSnapshot(doc(db(),'dashboard_summary',uid), snap => cb(snap.data()));
}


export async function approveEntry(eventId:string, entryId:string){
    await httpsCallable(fns,'approveEntry')({eventId, entryId});
}

export async function markEntryPaid(eventId:string, entryId:string){
    await httpsCallable(fns,'markEntryPaid')({eventId, entryId});
}
