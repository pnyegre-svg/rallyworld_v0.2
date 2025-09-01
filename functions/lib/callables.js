"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.recomputeDashboard = exports.deleteEvent = exports.deleteAnnouncement = exports.pinAnnouncement = exports.publishAnnouncement = exports.updateAnnouncement = exports.createAnnouncement = exports.markEntryPaid = exports.approveEntry = void 0;
const functions = __importStar(require("firebase-functions"));
const firestore_1 = require("firebase-admin/firestore");
const storage_1 = require("firebase-admin/storage");
const admin_1 = require("./admin");
const recompute_1 = require("./recompute");
// if you have your own authz helpers, keep using them;
// for now, minimal assert:
function assertAuthed(ctx) {
    if (!ctx.auth?.uid)
        throw new functions.https.HttpsError('unauthenticated', 'Sign in first');
    return ctx.auth.uid;
}
async function assertEventOwner(eventId, uid) {
    const snap = await admin_1.db.doc(`events/${eventId}`).get();
    if (!snap.exists)
        throw new functions.https.HttpsError('not-found', 'Event not found');
    if (snap.get('organizerId') !== uid)
        throw new functions.https.HttpsError('permission-denied', 'Not your event');
}
const region = 'europe-central2'; // pick your region; matches your Storage ext region
const clean = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== null));
const asString = (v, def = '') => (typeof v === 'string' ? v : def);
const asBool = (v) => v === true;
const parseWhen = (v) => {
    if (!v)
        return null;
    try {
        const d = v instanceof Date ? v : new Date(String(v));
        return isNaN(d.getTime()) ? null : d;
    }
    catch {
        return null;
    }
};
// --- Entries (samples kept minimal) ---
exports.approveEntry = functions.region(region).https.onCall(async (data, context) => {
    const uid = assertAuthed(context);
    const { eventId, entryId } = data || {};
    await assertEventOwner(asString(eventId), uid);
    await admin_1.db.doc(`events/${eventId}/entries/${entryId}`).update({ status: 'approved' });
    await (0, recompute_1.recomputeSummaryFor)(uid);
    return { ok: true };
});
exports.markEntryPaid = functions.region(region).https.onCall(async (data, context) => {
    const uid = assertAuthed(context);
    const { eventId, entryId } = data || {};
    await assertEventOwner(asString(eventId), uid);
    await admin_1.db.doc(`events/${eventId}/entries/${entryId}`).update({ paymentStatus: 'paid' });
    await (0, recompute_1.recomputeSummaryFor)(uid);
    return { ok: true };
});
// --- Announcements ---
exports.createAnnouncement = functions.region(region).https.onCall(async (data, context) => {
    const uid = assertAuthed(context);
    try {
        const eventId = asString(data?.eventId).trim();
        const title = asString(data?.title).trim();
        const body = asString(data?.body, '');
        const audience = ['competitors', 'officials', 'public'].includes(data?.audience)
            ? data.audience
            : 'competitors';
        const pinned = asBool(data?.pinned);
        const when = parseWhen(data?.publishAt);
        if (!eventId || !title)
            throw new functions.https.HttpsError('invalid-argument', 'eventId and title required');
        await assertEventOwner(eventId, uid);
        let status = 'draft';
        const base = {
            title, body, audience, pinned,
            createdBy: uid, createdAt: admin_1.FieldValue.serverTimestamp(),
        };
        if (when) {
            base.publishAt = when;
            status = when.getTime() <= Date.now() ? 'published' : 'scheduled';
            base.status = status;
            if (status === 'published')
                base.publishedAt = admin_1.FieldValue.serverTimestamp();
        }
        if (!base.status)
            base.status = status;
        const ref = await admin_1.db.collection('events').doc(eventId)
            .collection('announcements').add(clean(base));
        await ref.collection('revisions').add(clean({
            title, body, audience, pinned, updatedAt: admin_1.FieldValue.serverTimestamp(), updatedBy: uid
        }));
        await admin_1.db.collection('audit_logs').add(clean({
            at: admin_1.FieldValue.serverTimestamp(), action: 'createAnnouncement', by: uid, eventId, annId: ref.id
        }));
        await (0, recompute_1.recomputeSummaryFor)(uid);
        return { ok: true, annId: ref.id, status: base.status };
    }
    catch (err) {
        functions.logger.error('createAnnouncement failed', { uid, data, code: err?.code, message: err?.message, stack: err?.stack });
        if (err instanceof functions.https.HttpsError)
            throw err;
        throw new functions.https.HttpsError('internal', err?.message || 'Create failed');
    }
});
exports.updateAnnouncement = functions.region(region).https.onCall(async (data, context) => {
    const uid = assertAuthed(context);
    const { eventId, annId, title, body, audience, pinned } = data || {};
    await assertEventOwner(asString(eventId), uid);
    const patch = clean({
        title: asString(title, undefined),
        body: asString(body, undefined),
        audience,
        pinned: pinned === true ? true : (pinned === false ? false : undefined),
        updatedAt: admin_1.FieldValue.serverTimestamp()
    });
    await admin_1.db.doc(`events/${eventId}/announcements/${annId}`).update(patch);
    await (0, recompute_1.recomputeSummaryFor)(uid);
    return { ok: true };
});
exports.publishAnnouncement = functions.region(region).https.onCall(async (data, context) => {
    const uid = assertAuthed(context);
    const { eventId, annId } = data || {};
    await assertEventOwner(asString(eventId), uid);
    await admin_1.db.doc(`events/${eventId}/announcements/${annId}`).update({
        status: 'published',
        publishedAt: admin_1.FieldValue.serverTimestamp(),
        publishAt: admin_1.FieldValue.delete()
    });
    await (0, recompute_1.recomputeSummaryFor)(uid);
    return { ok: true };
});
exports.pinAnnouncement = functions.region(region).https.onCall(async (data, context) => {
    const uid = assertAuthed(context);
    const { eventId, annId, pinned } = data || {};
    await assertEventOwner(asString(eventId), uid);
    await admin_1.db.doc(`events/${eventId}/announcements/${annId}`).update({
        pinned: pinned === true,
        updatedAt: admin_1.FieldValue.serverTimestamp()
    });
    await (0, recompute_1.recomputeSummaryFor)(uid);
    return { ok: true };
});
exports.deleteAnnouncement = functions.region(region).https.onCall(async (data, context) => {
    const uid = assertAuthed(context);
    const { eventId, annId } = data || {};
    await assertEventOwner(asString(eventId), uid);
    await admin_1.db.doc(`events/${eventId}/announcements/${annId}`).delete();
    await (0, recompute_1.recomputeSummaryFor)(uid);
    return { ok: true };
});
// --- Events ---
/** Depth-first recursive delete using batched writes (no BulkWriter, works everywhere). */
async function deleteDocTree(docRef, pageSize = 200) {
    const adminDb = (0, firestore_1.getFirestore)();
    // Delete all subcollections first (depth-first)
    const subcols = await docRef.listCollections();
    for (const col of subcols) {
        await deleteCollectionDeep(col, pageSize);
    }
    // Finally delete the document itself
    await docRef.delete();
}
async function deleteCollectionDeep(colRef, pageSize = 200) {
    let last = undefined;
    while (true) {
        let q = colRef.orderBy('__name__').limit(pageSize);
        if (last)
            q = q.startAfter(last);
        const snap = await q.get();
        if (snap.empty)
            break;
        // Depth-first: delete subtrees for each doc in this page
        for (const d of snap.docs) {
            await deleteDocTree(d.ref, pageSize);
        }
        // Advance the cursor based on the original snapshot
        last = snap.docs[snap.docs.length - 1];
        if (snap.size < pageSize)
            break;
    }
}
exports.deleteEvent = functions
    .region(region)
    .runWith({ timeoutSeconds: 540, memory: '1GB' })
    .https.onCall(async (data, ctx) => {
    const uid = assertAuthed(ctx);
    const eventId = String(data?.eventId || '').trim();
    if (!eventId)
        throw new functions.https.HttpsError('invalid-argument', 'eventId required');
    await assertEventOwner(eventId, uid);
    const adminDb = (0, firestore_1.getFirestore)();
    const docRef = adminDb.doc(`events/${eventId}`);
    const bucket = (0, storage_1.getStorage)().bucket();
    try {
        functions.logger.info('deleteEvent: start', { uid, eventId });
        // 1) Firestore: walk & delete everything under /events/{eventId}
        await deleteDocTree(docRef, 200);
        functions.logger.info('deleteEvent: firestore tree deleted', { eventId });
        // 2) Storage: best-effort cleanup under events/{eventId}/
        try {
            await bucket.deleteFiles({ prefix: `events/${eventId}/` });
            functions.logger.info('deleteEvent: storage cleaned', { bucket: bucket.name });
        }
        catch (e) {
            functions.logger.warn('deleteEvent: storage cleanup failed (ignored)', { msg: e?.message, code: e?.code });
        }
        // 3) Audit + dashboard refresh
        await admin_1.db.collection('audit_logs').add({
            at: admin_1.FieldValue.serverTimestamp(),
            action: 'deleteEvent',
            by: uid,
            eventId
        });
        await (0, recompute_1.recomputeSummaryFor)(uid);
        functions.logger.info('deleteEvent: success', { uid, eventId });
        return { ok: true };
    }
    catch (err) {
        functions.logger.error('deleteEvent failed', {
            uid, eventId, code: err?.code || err?.name, message: err?.message, stack: err?.stack
        });
        if (err instanceof functions.https.HttpsError)
            throw err;
        throw new functions.https.HttpsError('internal', err?.message || 'Delete failed', { step: 'deleteEvent' });
    }
});
exports.recomputeDashboard = functions.region(region).https.onCall(async (data, context) => {
    const uid = assertAuthed(context);
    await (0, recompute_1.recomputeSummaryFor)(uid);
    return { ok: true };
});
