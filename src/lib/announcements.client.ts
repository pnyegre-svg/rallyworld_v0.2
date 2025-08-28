'use client';
import { collection, doc, getDoc, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase.client';
import { httpsCallable } from 'firebase/functions';
import { fns } from './functions.region';


export type Announcement = { id:string; title:string; body:string; audience:'competitors'|'officials'|'public'; status:'draft'|'scheduled'|'published'; pinned:boolean; publishedAt?:any; publishAt?:any };


export async function listAnnouncements(eventId: string): Promise<Announcement[]>{
const q = query(collection(db,'events',eventId,'announcements'), orderBy('publishedAt','desc'));
const snap = await getDocs(q);
return snap.docs.map(d=> ({ id:d.id, ...(d.data() as any) }));
}
export async function getAnnouncement(eventId:string, annId:string){
const s = await getDoc(doc(db,'events',eventId,'announcements',annId));
return s.exists() ? { id:s.id, ...(s.data() as any) } : undefined;
}


export async function createAnnouncementFn(input: { eventId:string; title:string; body:string; audience:string; pinned?:boolean; publishAt?:string }){
return (await httpsCallable(fns,'createAnnouncement')(input)).data as any;
}
export async function updateAnnouncementFn(input: { eventId:string; annId:string; title?:string; body?:string; audience?:string; pinned?:boolean }){
return (await httpsCallable(fns,'updateAnnouncement')(input)).data as any;
}
export async function publishAnnouncementFn(input: { eventId:string; annId:string }){
return (await httpsCallable(fns,'publishAnnouncement')(input)).data as any;
}
export async function pinAnnouncementFn(input: { eventId:string; annId:string; pinned:boolean }){
return (await httpsCallable(fns,'pinAnnouncement')(input)).data as any;
}
