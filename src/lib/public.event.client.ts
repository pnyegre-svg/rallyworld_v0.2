'use client';
import { collection, doc, getDoc, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase.client';

export async function getEventPublic(eventId: string) {
  const snap = await getDoc(doc(db, 'events', eventId));
  if (!snap.exists()) return null;
  const d = snap.data() as any;
  if (d.public !== true) return null; // guard
  return { id: snap.id, ...d };
}

export async function getStagesPublic(eventId: string) {
  const q = query(
    collection(db, 'events', eventId, 'stages'),
    orderBy('startAt', 'asc'),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
}

export async function getAnnouncementsPublic(eventId: string) {
  // Single query: published only, newest first – then sort pinned first in JS
  const q = query(
    collection(db, 'events', eventId, 'announcements'),
    where('status', '==', 'published'),
    orderBy('publishedAt', 'desc'),
    limit(50)
  );
  const snap = await getDocs(q);
  const items = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
  // pinned first without extra composite
  items.sort((a,b) => Number(!!b.pinned) - Number(!!a.pinned));
  return items;
}
