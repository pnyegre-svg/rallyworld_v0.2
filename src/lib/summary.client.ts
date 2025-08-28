'use client';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from './firebase.client';


export function watchSummary(uid: string, cb: (d: any|undefined) => void) {
return onSnapshot(doc(db, 'dashboard_summary', uid), s => cb(s.data()));
}
