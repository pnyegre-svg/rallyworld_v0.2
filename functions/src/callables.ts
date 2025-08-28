import './admin';
import * as functions from 'firebase-functions';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { recomputeSummaryFor } from './recompute';


const db = getFirestore();


function assertAuthed(context: functions.https.CallableContext) {
if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Sign-in required');
return context.auth.uid;
}


async function assertEventOwner(eventId: string, uid: string) {
const ev = await db.doc(`events/${eventId}`).get();
if (!ev.exists) throw new functions.https.HttpsError('not-found', 'Event not found');
if (ev.get('organizerId') !== uid) throw new functions.https.HttpsError('permission-denied', 'Not event owner');
}


export const approveEntry = functions.https.onCall(async (data, context) => {
const uid = assertAuthed(context);
const { eventId, entryId } = data as { eventId: string; entryId: string };
if (!eventId || !entryId) throw new functions.https.HttpsError('invalid-argument', 'eventId and entryId required');
await assertEventOwner(eventId, uid);
await db.doc(`events/${eventId}/entries/${entryId}`).update({ status: 'approved' });
await db.collection('audit_logs').add({ at: FieldValue.serverTimestamp(), action: 'approveEntry', by: uid, eventId, entryId });
await recomputeSummaryFor(uid);
return { ok: true };
});


export const markEntryPaid = functions.https.onCall(async (data, context) => {
const uid = assertAuthed(context);
const { eventId, entryId } = data as { eventId: string; entryId: string };
if (!eventId || !entryId) throw new functions.https.HttpsError('invalid-argument', 'eventId and entryId required');
await assertEventOwner(eventId, uid);
await db.doc(`events/${eventId}/entries/${entryId}`).update({ paymentStatus: 'paid' });
await db.collection('audit_logs').add({ at: FieldValue.serverTimestamp(), action: 'markEntryPaid', by: uid, eventId, entryId });
await recomputeSummaryFor(uid);
return { ok: true };
});
