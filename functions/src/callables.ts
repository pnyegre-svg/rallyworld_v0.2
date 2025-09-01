
import * as functions from 'firebase-functions';
import { getFirestore, BulkWriter, DocumentReference, CollectionReference } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { db, FieldValue } from './admin';
import { recomputeSummaryFor } from './recompute';

// if you have your own authz helpers, keep using them;
// for now, minimal assert:
function assertAuthed(ctx: functions.https.CallableContext) {
  if (!ctx.auth?.uid) throw new functions.https.HttpsError('unauthenticated', 'Sign in first');
  return ctx.auth.uid;
}
async function assertEventOwner(eventId: string, uid: string) {
  const snap = await db.doc(`events/${eventId}`).get();
  if (!snap.exists) throw new functions.https.HttpsError('not-found', 'Event not found');
  if (snap.get('organizerId') !== uid) throw new functions.https.HttpsError('permission-denied', 'Not your event');
}

const region = 'europe-central2'; // pick your region; matches your Storage ext region

const clean = (o: any) => Object.fromEntries(Object.entries(o).filter(([,v]) => v !== undefined && v !== null));
const asString = (v: any, def = '') => (typeof v === 'string' ? v : def);
const asBool   = (v: any) => v === true;
const parseWhen = (v: any): Date | null => {
  if (!v) return null;
  try { const d = v instanceof Date ? v : new Date(String(v)); return isNaN(d.getTime()) ? null : d; }
  catch { return null; }
};

// --- Entries (samples kept minimal) ---
export const approveEntry = functions.region(region).https.onCall(async (data: any, context: functions.https.CallableContext) => {
  const uid = assertAuthed(context);
  const { eventId, entryId } = data || {};
  await assertEventOwner(asString(eventId), uid);
  await db.doc(`events/${eventId}/entries/${entryId}`).update({ status: 'approved' });
  await recomputeSummaryFor(uid);
  return { ok: true };
});

export const markEntryPaid = functions.region(region).https.onCall(async (data: any, context: functions.https.CallableContext) => {
  const uid = assertAuthed(context);
  const { eventId, entryId } = data || {};
  await assertEventOwner(asString(eventId), uid);
  await db.doc(`events/${eventId}/entries/${entryId}`).update({ paymentStatus: 'paid' });
  await recomputeSummaryFor(uid);
  return { ok: true };
});

// --- Announcements ---
export const createAnnouncement = functions.region(region).https.onCall(async (data: any, context: functions.https.CallableContext) => {
  const uid = assertAuthed(context);
  try {
    const eventId  = asString(data?.eventId).trim();
    const title    = asString(data?.title).trim();
    const body     = asString(data?.body, '');
    const audience = (['competitors','officials','public'] as const).includes(data?.audience)
      ? (data.audience as 'competitors'|'officials'|'public')
      : 'competitors';
    const pinned   = asBool(data?.pinned);
    const when     = parseWhen(data?.publishAt);

    if (!eventId || !title) throw new functions.https.HttpsError('invalid-argument', 'eventId and title required');

    await assertEventOwner(eventId, uid);

    let status: 'draft'|'scheduled'|'published' = 'draft';
    const base: any = {
      title, body, audience, pinned,
      createdBy: uid, createdAt: FieldValue.serverTimestamp(),
    };
    if (when) {
      base.publishAt = when;
      status = when.getTime() <= Date.now() ? 'published' : 'scheduled';
      base.status = status;
      if (status === 'published')
          base.publishedAt = FieldValue.serverTimestamp();
    }
    
    if (!base.status) base.status = status;

    const ref = await db.collection('events').doc(eventId)
      .collection('announcements').add(clean(base));

    await ref.collection('revisions').add(clean({
      title, body, audience, pinned, updatedAt: FieldValue.serverTimestamp(), updatedBy: uid
    }));

    await db.collection('audit_logs').add(clean({
      at: FieldValue.serverTimestamp(), action: 'createAnnouncement', by: uid, eventId, annId: ref.id
    }));

    await recomputeSummaryFor(uid);
    return { ok: true, annId: ref.id, status: base.status };
  } catch (err: any) {
    functions.logger.error('createAnnouncement failed', { uid, data, code: err?.code, message: err?.message, stack: err?.stack });
    if (err instanceof functions.https.HttpsError) throw err;
    throw new functions.https.HttpsError('internal', err?.message || 'Create failed');
  }
});

export const updateAnnouncement = functions.region(region).https.onCall(async (data: any, context: functions.https.CallableContext) => {
  const uid = assertAuthed(context);
  const { eventId, annId, title, body, audience, pinned } = data || {};
  await assertEventOwner(asString(eventId), uid);
  const patch: any = clean({
    title: asString(title, undefined as any),
    body:  asString(body, undefined as any),
    audience,
    pinned: pinned === true ? true : (pinned === false ? false : undefined),
    updatedAt: FieldValue.serverTimestamp()
  });
  await db.doc(`events/${eventId}/announcements/${annId}`).update(patch);
  await recomputeSummaryFor(uid);
  return { ok: true };
});

export const publishAnnouncement = functions.region(region).https.onCall(async (data: any, context: functions.https.CallableContext) => {
  const uid = assertAuthed(context);
  const { eventId, annId } = data || {};
  await assertEventOwner(asString(eventId), uid);
  await db.doc(`events/${eventId}/announcements/${annId}`).update({
    status: 'published',
    publishedAt: FieldValue.serverTimestamp(),
    publishAt: FieldValue.delete()
  });
  await recomputeSummaryFor(uid);
  return { ok: true };
});

export const pinAnnouncement = functions.region(region).https.onCall(async (data: any, context: functions.https.CallableContext) => {
  const uid = assertAuthed(context);
  const { eventId, annId, pinned } = data || {};
  await assertEventOwner(asString(eventId), uid);
  await db.doc(`events/${eventId}/announcements/${annId}`).update({
    pinned: pinned === true,
    updatedAt: FieldValue.serverTimestamp()
  });
  await recomputeSummaryFor(uid);
  return { ok: true };
});

export const deleteAnnouncement = functions.region(region).https.onCall(async (data: any, context: functions.https.CallableContext) => {
    const uid = assertAuthed(context);
    const { eventId, annId } = data || {};
    await assertEventOwner(asString(eventId), uid);
    await db.doc(`events/${eventId}/announcements/${annId}`).delete();
    await recomputeSummaryFor(uid);
    return { ok: true };
});

// --- Events ---
/** Depth-first recursive delete using batched writes (no BulkWriter, works everywhere). */
async function deleteDocTree(docRef: FirebaseFirestore.DocumentReference, pageSize = 200) {
  const adminDb = getFirestore();

  // Delete all subcollections first (depth-first)
  const subcols = await docRef.listCollections();
  for (const col of subcols) {
    await deleteCollectionDeep(col, pageSize);
  }

  // Finally delete the document itself
  await docRef.delete();
}

async function deleteCollectionDeep(
  colRef: FirebaseFirestore.CollectionReference,
  pageSize = 200
) {
  let last: FirebaseFirestore.QueryDocumentSnapshot | undefined = undefined;

  while (true) {
    let q: FirebaseFirestore.Query = colRef.orderBy('__name__').limit(pageSize);
    if (last) q = q.startAfter(last);

    const snap = await q.get();
    if (snap.empty) break;

    // Depth-first: delete subtrees for each doc in this page
    for (const d of snap.docs) {
      await deleteDocTree(d.ref, pageSize);
    }

    // Advance the cursor based on the original snapshot
    last = snap.docs[snap.docs.length - 1];
    if (snap.size < pageSize) break;
  }
}

export const deleteEvent = functions
  .region(region)
  .runWith({ timeoutSeconds: 540, memory: '1GB' })
  .https.onCall(async (data: any, ctx) => {
    const uid = assertAuthed(ctx);
    const eventId = String(data?.eventId || '').trim();
    if (!eventId) throw new functions.https.HttpsError('invalid-argument', 'eventId required');

    await assertEventOwner(eventId, uid);

    const adminDb = getFirestore();
    const docRef = adminDb.doc(`events/${eventId}`);
    const bucket = getStorage().bucket();

    try {
      functions.logger.info('deleteEvent: start', { uid, eventId });

      // 1) Firestore: walk & delete everything under /events/{eventId}
      await deleteDocTree(docRef, 200);
      functions.logger.info('deleteEvent: firestore tree deleted', { eventId });

      // 2) Storage: best-effort cleanup under events/{eventId}/
      try {
        await bucket.deleteFiles({ prefix: `events/${eventId}/` });
        functions.logger.info('deleteEvent: storage cleaned', { bucket: bucket.name });
      } catch (e: any) {
        functions.logger.warn('deleteEvent: storage cleanup failed (ignored)', { msg: e?.message, code: e?.code });
      }

      // 3) Audit + dashboard refresh
      await db.collection('audit_logs').add({
        at: FieldValue.serverTimestamp(),
        action: 'deleteEvent',
        by: uid,
        eventId
      });
      await recomputeSummaryFor(uid);

      functions.logger.info('deleteEvent: success', { uid, eventId });
      return { ok: true };
    } catch (err: any) {
      functions.logger.error('deleteEvent failed', {
        uid, eventId, code: err?.code || err?.name, message: err?.message, stack: err?.stack
      });
      if (err instanceof functions.https.HttpsError) throw err;
      throw new functions.https.HttpsError('internal', err?.message || 'Delete failed', { step: 'deleteEvent' });
    }
  });


export const recomputeDashboard = functions.region(region).https.onCall(async (data: any, context: functions.https.CallableContext) => {
    const uid = assertAuthed(context);
    await recomputeSummaryFor(uid);
    return { ok: true };
});
