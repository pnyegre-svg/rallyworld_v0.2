
'use client';

import { getFirestore, doc, onSnapshot, getDoc, enableIndexedDbPersistence } from 'firebase/firestore';
import { app } from './firebase';
const db = getFirestore(app);
// call once on app start for offline cache
try {
    enableIndexedDbPersistence(db)
} catch (error) {
    if (error instanceof Error && error.name === 'failed-precondition') {
        console.warn('Firestore persistence failed to initialize. Multiple tabs open?');
    } else {
        console.error('Error initializing Firestore persistence:', error);
    }
}

export function watchSummary(uid:string, cb:(d:any)=>void){
    return onSnapshot(doc(db,'dashboard_summary',uid), snap => cb(snap.data()));
}
