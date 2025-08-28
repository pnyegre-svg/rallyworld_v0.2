import * as functions from 'firebase-functions';
import { db, FieldValue } from './admin';
import { recomputeSummaryFor } from './recompute';
import { assertAuthed, assertEventOwner } from './authz';
const clean = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== null));
const asString = (v, def = '') => (typeof v === 'string' ? v : def);
const asBool = (v) => v === true;
const parseWhen = (v) => {
    if (!v)
        return null;
    try {
        // support string from <input type="datetime-local"> or Date
        const d = v instanceof Date ? v : new Date(String(v));
        return isNaN(d.getTime()) ? null : d;
    }
    catch {
        return null;
    }
};
export const approveEntry = functions.https.onCall(async (data, context) => {
    const uid = assertAuthed(context);
    const { eventId, entryId } = data;
    if (!eventId || !entryId)
        throw new functions.https.HttpsError('invalid-argument', 'eventId and entryId required');
    await assertEventOwner(eventId, uid);
    await db.doc(`events/${eventId}/entries/${entryId}`).update({ status: 'approved' });
    await db.collection('audit_logs').add({ at: FieldValue.serverTimestamp(), action: 'approveEntry', by: uid, eventId, entryId });
    await recomputeSummaryFor(uid);
    return { ok: true };
});
export const markEntryPaid = functions.https.onCall(async (data, context) => {
    const uid = assertAuthed(context);
    const { eventId, entryId } = data;
    if (!eventId || !entryId)
        throw new functions.https.HttpsError('invalid-argument', 'eventId and entryId required');
    await assertEventOwner(eventId, uid);
    await db.doc(`events/${eventId}/entries/${entryId}`).update({ paymentStatus: 'paid' });
    await db.collection('audit_logs').add({ at: FieldValue.serverTimestamp(), action: 'markEntryPaid', by: uid, eventId, entryId });
    await recomputeSummaryFor(uid);
    return { ok: true };
});
// --- Announcements ---
export const createAnnouncement = functions.https.onCall(async (data, context) => {
    const uid = assertAuthed(context);
    try {
        const eventId = asString(data?.eventId).trim();
        const title = asString(data?.title).trim();
        const body = asString(data?.body, ''); // 👈 never undefined
        const audience = ['competitors', 'officials', 'public'].includes(data?.audience)
            ? data.audience
            : 'competitors';
        const pinned = asBool(data?.pinned);
        const when = parseWhen(data?.publishAt);
        if (!eventId || !title) {
            throw new functions.https.HttpsError('invalid-argument', 'eventId and title required');
        }
        await assertEventOwner(eventId, uid);
        let status = 'draft';
        const now = Date.now();
        const base = {
            title,
            body, // 👈 always a string
            audience,
            pinned,
            createdBy: uid,
            createdAt: FieldValue.serverTimestamp(),
        };
        if (when) {
            base.publishAt = when;
            status = when.getTime() <= now ? 'published' : 'scheduled';
            base.status = status;
            if (status === 'published')
                base.publishedAt = FieldValue.serverTimestamp();
        }
        if (!base.status)
            base.status = status;
        const ref = await db.collection('events').doc(eventId)
            .collection('announcements').add(clean(base));
        await ref.collection('revisions').add(clean({
            title, body, audience, pinned,
            updatedAt: FieldValue.serverTimestamp(),
            updatedBy: uid,
        }));
        await db.collection('audit_logs').add(clean({
            at: FieldValue.serverTimestamp(),
            action: 'createAnnouncement',
            by: uid, eventId, annId: ref.id,
        }));
        return { ok: true, annId: ref.id, status: base.status };
    }
    catch (err) {
        functions.logger.error('createAnnouncement failed', {
            uid, data,
            code: err?.code, message: err?.message, stack: err?.stack,
        });
        if (err instanceof functions.https.HttpsError)
            throw err;
        throw new functions.https.HttpsError('internal', err?.message || 'Create failed');
    }
});
export const updateAnnouncement = functions.https.onCall(async (data, context) => {
    const uid = assertAuthed(context);
    const { eventId, annId, title, body, audience, pinned } = data;
    if (!eventId || !annId)
        throw new functions.https.HttpsError('invalid-argument', 'eventId and annId required');
    await assertEventOwner(eventId, uid);
    const ref = db.doc(`events/${eventId}/announcements/${annId}`);
    const patch = { updatedAt: FieldValue.serverTimestamp() };
    const revision = { updatedAt: FieldValue.serverTimestamp(), updatedBy: uid };
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
    await db.collection('audit_logs').add({ at: FieldValue.serverTimestamp(), action: 'updateAnnouncement', by: uid, eventId, annId });
    return { ok: true };
});
export const publishAnnouncement = functions.https.onCall(async (data, context) => {
    const uid = assertAuthed(context);
    const { eventId, annId } = data;
    if (!eventId || !annId)
        throw new functions.https.HttpsError('invalid-argument', 'eventId and annId required');
    await assertEventOwner(eventId, uid);
    const ref = db.doc(`events/${eventId}/announcements/${annId}`);
    await ref.update({ status: 'published', publishedAt: FieldValue.serverTimestamp(), publishAt: FieldValue.delete() });
    await db.collection('audit_logs').add({ at: FieldValue.serverTimestamp(), action: 'publishAnnouncement', by: uid, eventId, annId });
    return { ok: true };
});
export const pinAnnouncement = functions.https.onCall(async (data, context) => {
    const uid = assertAuthed(context);
    const { eventId, annId, pinned } = data;
    if (!eventId || !annId)
        throw new functions.https.HttpsError('invalid-argument', 'eventId and annId required');
    await assertEventOwner(eventId, uid);
    await db.doc(`events/${eventId}/announcements/${annId}`).update({ pinned: !!pinned, updatedAt: FieldValue.serverTimestamp() });
    await db.collection('audit_logs').add({ at: FieldValue.serverTimestamp(), action: 'pinAnnouncement', by: uid, eventId, annId, pinned: !!pinned });
    return { ok: true };
});
export const recomputeDashboard = functions.https.onCall(async (_data, ctx) => {
    const uid = assertAuthed(ctx);
    await recomputeSummaryFor(uid);
    return { ok: true };
});
