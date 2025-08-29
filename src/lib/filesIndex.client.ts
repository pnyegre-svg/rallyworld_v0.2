'use client';
import { collection, getDocs, limit, orderBy, query, startAfter, where, DocumentSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase.client';

export type FileMeta = {
  id: string;
  path: string;
  folder: string;
  name: string;
  size: number;
  contentType: string;
  timeCreated: any; // Firestore Timestamp
  _snap?: DocumentSnapshot;
};

export async function listFileMeta(eventId: string, folder: string, pageSize = 20, cursor?: DocumentSnapshot) {
  const base = collection(db, 'events', eventId, 'files');
  let q = query(
    base,
    where('folder', '==', folder),
    orderBy('timeCreated', 'desc'),
    limit(pageSize)
  );
  if (cursor) q = query(
    base,
    where('folder', '==', folder),
    orderBy('timeCreated', 'desc'),
    startAfter(cursor),
    limit(pageSize)
  );
  const snap = await getDocs(q);
  const items: FileMeta[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as any), _snap: d }));
  const nextCursor = snap.docs.length ? snap.docs[snap.docs.length - 1] : undefined;
  return { items, nextCursor };
}
