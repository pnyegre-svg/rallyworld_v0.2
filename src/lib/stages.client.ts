'use client';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase.client';
import { httpsCallable } from 'firebase/functions';
import { fns } from './firebase.client';

export type Stage = {
  id: string;
  name: string;
  order: number;
  startAt?: any;
  location?: string;
  distanceKm?: number;
  status: 'scheduled'|'ongoing'|'completed'|'delayed'|'cancelled';
  delayMinutes?: number;
  notes?: string;
};

export async function listStages(eventId: string): Promise<Stage[]> {
  const snap = await getDocs(query(
    collection(db, 'events', eventId, 'stages'),
    orderBy('startAt', 'asc')
  ));
  return snap.docs.map(d => ({ id:d.id, ...(d.data() as any) }));
}

// Callables
export const createStageFn   = (input:any) => httpsCallable(fns,'createStage')(input).then(r=>r.data as any);
export const updateStageFn   = (input:any) => httpsCallable(fns,'updateStage')(input).then(r=>r.data as any);
export const deleteStageFn   = (input:any) => httpsCallable(fns,'deleteStage')(input).then(r=>r.data as any);
export const startStageFn    = (input:any) => httpsCallable(fns,'startStage')(input).then(r=>r.data as any);
export const completeStageFn = (input:any) => httpsCallable(fns,'completeStage')(input).then(r=>r.data as any);
export const cancelStageFn   = (input:any) => httpsCallable(fns,'cancelStage')(input).then(r=>r.data as any);
export const delayStageFn    = (input:any) => httpsCallable(fns,'delayStage')(input).then(r=>r.data as any);
