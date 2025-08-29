
import * as functions from 'firebase-functions';
import { db, FieldValue } from './admin';
import { recomputeSummaryFor } from './recompute';

const region = 'europe-central2';

function assertAuthed(ctx: functions.https.CallableContext) {
  if (!ctx.auth?.uid) throw new functions.https.HttpsError('unauthenticated', 'Sign in first');
  return ctx.auth.uid;
}
async function assertEventOwner(eventId: string, uid: string) {
  const snap = await db.doc(`events/${eventId}`).get();
  if (!snap.exists) throw new functions.https.HttpsError('not-found', 'Event not found');
  if (snap.get('organizerId') !== uid) throw new functions.https.HttpsError('permission-denied', 'Not your event');
}

function clean(o: any) {
  return Object.fromEntries(Object.entries(o).filter(([,v]) => v !== undefined && v !== null));
}

async function announce(eventId: string, title: string, body = '') {
  // Post to both competitors & officials (schema is single audience → write two docs)
  const col = db.collection('events').doc(eventId).collection('announcements');
  const payload = (audience: 'competitors'|'officials') => clean({
    title, body, audience, pinned: false, status: 'published',
    createdAt: FieldValue.serverTimestamp(),
    publishedAt: FieldValue.serverTimestamp(),
  });
  const [a,b] = await Promise.all([col.add(payload('competitors')), col.add(payload('officials'))]);
  await a.collection('revisions').add({ title, body, audience:'competitors', updatedAt: FieldValue.serverTimestamp() });
  await b.collection('revisions').add({ title, body, audience:'officials',   updatedAt: FieldValue.serverTimestamp() });
}

export const createStage = functions.region(region).https.onCall(async (data: any, ctx) => {
  const uid = assertAuthed(ctx);
  const eventId = String(data?.eventId || '').trim();
  if (!eventId) throw new functions.https.HttpsError('invalid-argument', 'eventId required');

  await assertEventOwner(eventId, uid);

  const doc = clean({
    name: String(data?.name || '').trim(),
    order: Number(data?.order ?? 0),
    startAt: data?.startAt ? new Date(String(data.startAt)) : null,
    location: String(data?.location || '').trim() || null,
    distanceKm: data?.distanceKm != null ? Number(data.distanceKm) : null,
    status: (['scheduled','ongoing','completed','delayed','cancelled'].includes(data?.status)) ? data.status : 'scheduled',
    delayMinutes: Number(data?.delayMinutes ?? 0),
    notes: String(data?.notes || ''),
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: uid,
  });

  const ref = await db.collection('events').doc(eventId).collection('stages').add(doc);
  await db.collection('audit_logs').add({ at: FieldValue.serverTimestamp(), action:'createStage', by: uid, eventId, stageId: ref.id });
  await recomputeSummaryFor(uid);
  return { ok:true, stageId: ref.id };
});

export const updateStage = functions.region(region).https.onCall(async (data: any, ctx) => {
  const uid = assertAuthed(ctx);
  const eventId = String(data?.eventId || '').trim();
  const stageId = String(data?.stageId || '').trim();
  if (!eventId || !stageId) throw new functions.https.HttpsError('invalid-argument', 'eventId and stageId required');

  await assertEventOwner(eventId, uid);

  const patch = clean({
    name: data?.name !== undefined ? String(data.name).trim() : undefined,
    order: data?.order !== undefined ? Number(data.order) : undefined,
    startAt: data?.startAt !== undefined ? (data.startAt ? new Date(String(data.startAt)) : null) : undefined,
    location: data?.location !== undefined ? (String(data.location).trim() || null) : undefined,
    distanceKm: data?.distanceKm !== undefined ? (data.distanceKm != null ? Number(data.distanceKm) : null) : undefined,
    status: data?.status && ['scheduled','ongoing','completed','delayed','cancelled'].includes(data.status) ? data.status : undefined,
    delayMinutes: data?.delayMinutes !== undefined ? Number(data.delayMinutes) : undefined,
    notes: data?.notes !== undefined ? String(data.notes) : undefined,
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: uid,
  });

  await db.doc(`events/${eventId}/stages/${stageId}`).update(patch);
  await db.collection('audit_logs').add({ at: FieldValue.serverTimestamp(), action:'updateStage', by: uid, eventId, stageId });
  await recomputeSummaryFor(uid);
  return { ok:true };
});

export const deleteStage = functions.region(region).https.onCall(async (data: any, ctx) => {
  const uid = assertAuthed(ctx);
  const eventId = String(data?.eventId || '').trim();
  const stageId = String(data?.stageId || '').trim();
  if (!eventId || !stageId) throw new functions.https.HttpsError('invalid-argument', 'eventId and stageId required');

  await assertEventOwner(eventId, uid);
  await db.doc(`events/${eventId}/stages/${stageId}`).delete();
  await db.collection('audit_logs').add({ at: FieldValue.serverTimestamp(), action:'deleteStage', by: uid, eventId, stageId });
  await recomputeSummaryFor(uid);
  return { ok:true };
});

// --- Actions (also auto-announces)
export const startStage = functions.region(region).https.onCall(async (data: any, ctx) => {
  const uid = assertAuthed(ctx);
  const { eventId, stageId } = data || {};
  await assertEventOwner(String(eventId), uid);
  const ref = db.doc(`events/${eventId}/stages/${stageId}`);
  await ref.update({ status:'ongoing', startedAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(), updatedBy: uid });
  await announce(eventId, `Stage started`, `Stage ${stageId} is now ongoing.`);
  await recomputeSummaryFor(uid);
  return { ok:true };
});

export const completeStage = functions.region(region).https.onCall(async (data: any, ctx) => {
  const uid = assertAuthed(ctx);
  const { eventId, stageId } = data || {};
  await assertEventOwner(String(eventId), uid);
  const ref = db.doc(`events/${eventId}/stages/${stageId}`);
  await ref.update({ status:'completed', completedAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(), updatedBy: uid });
  await announce(eventId, `Stage completed`, `Stage ${stageId} has finished.`);
  await recomputeSummaryFor(uid);
  return { ok:true };
});

export const cancelStage = functions.region(region).https.onCall(async (data: any, ctx) => {
  const uid = assertAuthed(ctx);
  const { eventId, stageId } = data || {};
  await assertEventOwner(String(eventId), uid);
  await db.doc(`events/${eventId}/stages/${stageId}`).update({ status:'cancelled', updatedAt: FieldValue.serverTimestamp(), updatedBy: uid });
  await announce(eventId, `Stage cancelled`, `Stage ${stageId} has been cancelled.`);
  await recomputeSummaryFor(uid);
  return { ok:true };
});

export const delayStage = functions.region(region).https.onCall(async (data: any, ctx) => {
  const uid = assertAuthed(ctx);
  const { eventId, stageId, minutes } = data || {};
  const m = Number(minutes || 0);
  if (!Number.isFinite(m) || m <= 0) throw new functions.https.HttpsError('invalid-argument', 'minutes > 0 required');
  await assertEventOwner(String(eventId), uid);

  const ref = db.doc(`events/${eventId}/stages/${stageId}`);
  const doc = await ref.get();
  if (!doc.exists) throw new functions.https.HttpsError('not-found', 'Stage not found');

  const curStart = doc.get('startAt');
  const curDelay = Number(doc.get('delayMinutes') || 0);
  const base = curStart?.toDate ? curStart.toDate() : (curStart ? new Date(curStart) : null);
  const newStart = base ? new Date(base.getTime() + m*60000) : null;

  await ref.update(clean({
    status: 'delayed',
    delayMinutes: curDelay + m,
    startAt: newStart ?? undefined,
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: uid,
  }));

  await announce(eventId, `Stage delayed +${m}m`, `Stage ${stageId} delayed by ${m} minutes.`);
  await recomputeSummaryFor(uid);
  return { ok:true };
});
