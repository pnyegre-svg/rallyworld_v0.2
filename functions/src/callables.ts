
import * as functions from 'firebase-functions';
import { getFirestore } from 'firebase-admin/firestore';
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
export const deleteEvent = functions
  .region(region)
  .runWith({ timeoutSeconds: 540, memory: '1GB' })
  .https.onCall(async (data: any, ctx) => {
    const uid = assertAuthed(ctx);
    const eventId = String(data?.eventId || '').trim();
    if (!eventId) throw new functions.https.HttpsError('invalid-argument', 'eventId required');

    await assertEventOwner(eventId, uid);

    const eventPath = `events/${eventId}`;
    const bucket = getStorage().bucket();

    try {
      functions.logger.info('deleteEvent: start', { uid, eventId });

      // Manually delete subcollections
      const subcollections = ['stages', 'entries', 'announcements', 'files'];
      for (const sub of subcollections) {
        const subPath = `${eventPath}/${sub}`;
        const docs = await db.collection(subPath).listDocuments();
        let batch = db.batch();
        let count = 0;
        for (const doc of docs) {
            batch.delete(doc);
            count++;
            if (count >= 400) { // Batch writes are limited to 500 ops
                await batch.commit();
                batch = db.batch();
                count = 0;
            }
        }
        if (count > 0) {
            await batch.commit();
        }
        functions.logger.info(`deleteEvent: deleted ${docs.length} docs from ${sub}`, { eventId });
      }

      // Delete the main event document
      await db.doc(eventPath).delete();
      functions.logger.info('deleteEvent: firestore document deleted', { eventId });
      
      // Storage cleanup (best-effort)
      try {
        await bucket.deleteFiles({ prefix: `events/${eventId}/` });
        functions.logger.info('deleteEvent: storage deleteFiles done', { bucket: bucket.name });
      } catch (e:any) {
        functions.logger.warn('deleteEvent: storage deleteFiles failed (ignored)', { msg: e?.message, code: e?.code });
      }

      // Audit + dashboard refresh
      await db.collection('audit_logs').add({
        at: FieldValue.serverTimestamp(),
        action: 'deleteEvent',
        by: uid,
        eventId
      });
      await recomputeSummaryFor(uid);

      functions.logger.info('deleteEvent: success', { uid, eventId });
      return { ok: true };
    } catch (err:any) {
      functions.logger.error('deleteEvent failed', {
        uid, eventId, code: err?.code, message: err?.message, stack: err?.stack
      });
      if (err instanceof functions.https.HttpsError) throw err;
      throw new functions.https.HttpsError('internal', err?.message || 'Delete failed', {
        code: err?.code || 'unknown',
        step: 'deleteEvent'
      });
    }
  });


export const recomputeDashboard = functions.region(region).https.onCall(async (data: any, context: functions.https.CallableContext) => {
    const uid = assertAuthed(context);
    await recomputeSummaryFor(uid);
    return { ok: true };
});
