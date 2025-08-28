'use client';
import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase.client';


export function useUserDoc(uid?: string) {
const [data, setData] = useState<any>();
useEffect(() => {
if (!uid) return;
const unsub = onSnapshot(doc(db, 'users', uid), snap => setData(snap.data()));
return () => unsub();
}, [uid]);
return data;
}
