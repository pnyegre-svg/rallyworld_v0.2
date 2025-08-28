'use client';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '@/lib/firebase.client';
const fns = getFunctions(app);
export async function approveEntryFn(eventId: string, entryId: string){ return (await httpsCallable(fns,'approveEntry')({ eventId, entryId })).data; }
export async function markEntryPaidFn(eventId: string, entryId: string){ return (await httpsCallable(fns,'markEntryPaid')({ eventId, entryId })).data; }
export async function recomputeDashboardFn(){ 
  return (await httpsCallable(fns,'recomputeDashboard')({})).data; 
}
