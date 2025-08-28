
import * as functions from 'firebase-functions';
import { db, FieldValue } from './admin';
import { recomputeSummaryFor } from './recompute';


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

// --- Announcements ---
export const createAnnouncement = functions.https.onCall(async (data, context) => {
    const uid = assertAuthed(context);
    const { eventId, title, body, audience = 'competitors', pinned = false, publishAt } = data as any;
    if (!eventId || !title) throw new functions.https.HttpsError('invalid-argument', 'eventId and title required');
    await assertEventOwner(eventId, uid);

    const now = new Date();
    let status: 'draft'|'scheduled'|'published' = 'draft';
    const doc: any = { 
        title, 
        body: body || '', 
        audience, 
        pinned, 
        createdBy: uid, 
        createdAt: FieldValue.serverTimestamp(), 
        status 
    };

    if (publishAt) {
        const when = new Date(publishAt);
        if (!isNaN(when.getTime())) {
            doc.publishAt = when;
            status = when.getTime() <= now.getTime() ? 'published' : 'scheduled';
            doc.status = status;
            if (status === 'published') {
                doc.publishedAt = FieldValue.serverTimestamp();
            }
        }
    }
    const ref = await db.collection('events').doc(eventId).collection('announcements').add(doc);
    // store first revision for audit
    await ref.collection('revisions').add({ title, body: body || '', audience, pinned, updatedAt: FieldValue.serverTimestamp(), updatedBy: uid });
    await db.collection('audit_logs').add({ at: FieldValue.serverTimestamp(), action:'createAnnouncement', by: uid, eventId, annId: ref.id });
    return { ok:true, annId: ref.id, status };
});


export const updateAnnouncement = functions.https.onCall(async (data, context) => {
const uid = assertAuthed(context);
const { eventId, annId, title, body, audience, pinned } = data as any;
if (!eventId || !annId) throw new functions.https.HttpsError('invalid-argument', 'eventId and annId required');
await assertEventOwner(eventId, uid);
const ref = db.doc(`events/${eventId}/announcements/${annId}`);
const patch:any = { updatedAt: FieldValue.serverTimestamp() };
const revision:any = { updatedAt: FieldValue.serverTimestamp(), updatedBy: uid };

if (title !== undefined) {
    patch.title = title;
    revision.title = title;
}
if (body !== undefined) {
    patch.body = body;
    revision.body = body;
}
if (audience !== undefined) {
    patch.audience = audience;
    revision.audience = audience;
}
if (pinned !== undefined) {
    patch.pinned = pinned;
    revision.pinned = pinned;
}

await ref.update(patch);
await ref.collection('revisions').add(revision);
await db.collection('audit_logs').add({ at: FieldValue.serverTimestamp(), action:'updateAnnouncement', by: uid, eventId, annId });
return { ok:true };
});


export const publishAnnouncement = functions.https.onCall(async (data, context) => {
const uid = assertAuthed(context);
const { eventId, annId } = data as any;
if (!eventId || !annId) throw new functions.https.HttpsError('invalid-argument', 'eventId and annId required');
await assertEventOwner(eventId, uid);
const ref = db.doc(`events/${eventId}/announcements/${annId}`);
await ref.update({ status:'published', publishedAt: FieldValue.serverTimestamp(), publishAt: FieldValue.delete() });
await db.collection('audit_logs').add({ at: FieldValue.serverTimestamp(), action:'publishAnnouncement', by: uid, eventId, annId });
return { ok:true };
});


export const pinAnnouncement = functions.https.onCall(async (data, context) => {
const uid = assertAuthed(context);
const { eventId, annId, pinned } = data as any;
if (!eventId || !annId) throw new functions.https.HttpsError('invalid-argument', 'eventId and annId required');
await assertEventOwner(eventId, uid);
await db.doc(`events/${eventId}/announcements/${annId}`).update({ pinned: !!pinned, updatedAt: FieldValue.serverTimestamp() });
await db.collection('audit_logs').add({ at: FieldValue.serverTimestamp(), action:'pinAnnouncement', by: uid, eventId, annId, pinned: !!pinned });
return { ok:true };
});

export const recomputeDashboard = functions.https.onCall(async (_data, ctx) => {
  const uid = assertAuthed(ctx);
  await recomputeSummaryFor(uid);
  return { ok: true };
});
