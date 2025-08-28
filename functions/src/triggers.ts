import './admin';
import { getFirestore } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions';
import { recomputeSummaryFor } from './recompute';


const db = getFirestore();


async function organizerForEvent(eventId: string): Promise<string | null> {
const ev = await db.doc(`events/${eventId}`).get();
return ev.exists ? (ev.get('organizerId') as string) : null;
}


export const onEntryWrite = async (_: functions.Change<functions.firestore.DocumentSnapshot>, ctx: functions.EventContext) => {
const uid = await organizerForEvent(ctx.params.eventId);
if (uid) await recomputeSummaryFor(uid);
};


export const onStageWrite = onEntryWrite; // same recompute by event


export const onAnnouncementWrite = onEntryWrite; // same recompute by event


export const onEventWrite = async (change: functions.Change<functions.firestore.DocumentSnapshot>, ctx: functions.EventContext) => {
const beforeOwner = change.before.exists ? change.before.get('organizerId') as string : null;
const afterOwner = change.after.exists ? change.after.get('organizerId') as string : null;
const owners = new Set([beforeOwner, afterOwner].filter(Boolean) as string[]);
for (const uid of owners) await recomputeSummaryFor(uid);
};


export async function refreshAllForToday() {
// Simple & safe: recompute for all organizers in `users` with role='organizer'
const users = await db.collection('users').where('role','==','organizer').get();
for (const u of users.docs) {
await recomputeSummaryFor(u.id);
}
}
