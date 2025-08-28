import * as functions from 'firebase-functions';
import { db, FieldValue } from './admin';
import { recomputeSummaryFor } from './recompute';


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

// Process scheduled announcements every 5 minutes
export const processScheduledAnnouncements = functions.pubsub
.schedule('every 5 minutes')
.onRun(async () => {
const now = new Date();
const q = await db.collectionGroup('announcements')
.where('status','==','scheduled')
.where('publishAt','<=', now)
.get();
for (const d of q.docs) {
await d.ref.update({ status:'published', publishedAt: FieldValue.serverTimestamp(), publishAt: FieldValue.delete() });
}
});
