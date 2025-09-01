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
exports.delayStage = exports.cancelStage = exports.completeStage = exports.startStage = exports.deleteStage = exports.updateStage = exports.createStage = void 0;
const functions = __importStar(require("firebase-functions"));
const admin_1 = require("./admin");
const recompute_1 = require("./recompute");
const region = 'europe-central2';
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
function clean(o) {
    return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== null));
}
async function announce(eventId, title, body = '') {
    // Post to both competitors & officials (schema is single audience → write two docs)
    const col = admin_1.db.collection('events').doc(eventId).collection('announcements');
    const payload = (audience) => clean({
        title, body, audience, pinned: false, status: 'published',
        createdAt: admin_1.FieldValue.serverTimestamp(),
        publishedAt: admin_1.FieldValue.serverTimestamp(),
    });
    const [a, b] = await Promise.all([col.add(payload('competitors')), col.add(payload('officials'))]);
    await a.collection('revisions').add({ title, body, audience: 'competitors', updatedAt: admin_1.FieldValue.serverTimestamp() });
    await b.collection('revisions').add({ title, body, audience: 'officials', updatedAt: admin_1.FieldValue.serverTimestamp() });
}
exports.createStage = functions.region(region).https.onCall(async (data, ctx) => {
    const uid = assertAuthed(ctx);
    const eventId = String(data?.eventId || '').trim();
    if (!eventId)
        throw new functions.https.HttpsError('invalid-argument', 'eventId required');
    await assertEventOwner(eventId, uid);
    const doc = clean({
        name: String(data?.name || '').trim(),
        order: Number(data?.order ?? 0),
        startAt: data?.startAt ? new Date(String(data.startAt)) : null,
        location: String(data?.location || '').trim() || null,
        distanceKm: data?.distanceKm != null ? Number(data.distanceKm) : null,
        status: (['scheduled', 'ongoing', 'completed', 'delayed', 'cancelled'].includes(data?.status)) ? data.status : 'scheduled',
        delayMinutes: Number(data?.delayMinutes ?? 0),
        notes: String(data?.notes || ''),
        createdAt: admin_1.FieldValue.serverTimestamp(),
        updatedAt: admin_1.FieldValue.serverTimestamp(),
        updatedBy: uid,
    });
    const ref = await admin_1.db.collection('events').doc(eventId).collection('stages').add(doc);
    await admin_1.db.collection('audit_logs').add({ at: admin_1.FieldValue.serverTimestamp(), action: 'createStage', by: uid, eventId, stageId: ref.id });
    await (0, recompute_1.recomputeSummaryFor)(uid);
    return { ok: true, stageId: ref.id };
});
exports.updateStage = functions.region(region).https.onCall(async (data, ctx) => {
    const uid = assertAuthed(ctx);
    const eventId = String(data?.eventId || '').trim();
    const stageId = String(data?.stageId || '').trim();
    if (!eventId || !stageId)
        throw new functions.https.HttpsError('invalid-argument', 'eventId and stageId required');
    await assertEventOwner(eventId, uid);
    const patch = clean({
        name: data?.name !== undefined ? String(data.name).trim() : undefined,
        order: data?.order !== undefined ? Number(data.order) : undefined,
        startAt: data?.startAt !== undefined ? (data.startAt ? new Date(String(data.startAt)) : null) : undefined,
        location: data?.location !== undefined ? (String(data.location).trim() || null) : undefined,
        distanceKm: data?.distanceKm !== undefined ? (data.distanceKm != null ? Number(data.distanceKm) : null) : undefined,
        status: data?.status && ['scheduled', 'ongoing', 'completed', 'delayed', 'cancelled'].includes(data.status) ? data.status : undefined,
        delayMinutes: data?.delayMinutes !== undefined ? Number(data.delayMinutes) : undefined,
        notes: data?.notes !== undefined ? String(data.notes) : undefined,
        updatedAt: admin_1.FieldValue.serverTimestamp(),
        updatedBy: uid,
    });
    await admin_1.db.doc(`events/${eventId}/stages/${stageId}`).update(patch);
    await admin_1.db.collection('audit_logs').add({ at: admin_1.FieldValue.serverTimestamp(), action: 'updateStage', by: uid, eventId, stageId });
    await (0, recompute_1.recomputeSummaryFor)(uid);
    return { ok: true };
});
exports.deleteStage = functions.region(region).https.onCall(async (data, ctx) => {
    const uid = assertAuthed(ctx);
    const eventId = String(data?.eventId || '').trim();
    const stageId = String(data?.stageId || '').trim();
    if (!eventId || !stageId)
        throw new functions.https.HttpsError('invalid-argument', 'eventId and stageId required');
    await assertEventOwner(eventId, uid);
    await admin_1.db.doc(`events/${eventId}/stages/${stageId}`).delete();
    await admin_1.db.collection('audit_logs').add({ at: admin_1.FieldValue.serverTimestamp(), action: 'deleteStage', by: uid, eventId, stageId });
    await (0, recompute_1.recomputeSummaryFor)(uid);
    return { ok: true };
});
// --- Actions (also auto-announces)
exports.startStage = functions.region(region).https.onCall(async (data, ctx) => {
    const uid = assertAuthed(ctx);
    const { eventId, stageId } = data || {};
    await assertEventOwner(String(eventId), uid);
    const ref = admin_1.db.doc(`events/${eventId}/stages/${stageId}`);
    await ref.update({ status: 'ongoing', startedAt: admin_1.FieldValue.serverTimestamp(), updatedAt: admin_1.FieldValue.serverTimestamp(), updatedBy: uid });
    await announce(eventId, `Stage started`, `Stage ${stageId} is now ongoing.`);
    await (0, recompute_1.recomputeSummaryFor)(uid);
    return { ok: true };
});
exports.completeStage = functions.region(region).https.onCall(async (data, ctx) => {
    const uid = assertAuthed(ctx);
    const { eventId, stageId } = data || {};
    await assertEventOwner(String(eventId), uid);
    const ref = admin_1.db.doc(`events/${eventId}/stages/${stageId}`);
    await ref.update({ status: 'completed', completedAt: admin_1.FieldValue.serverTimestamp(), updatedAt: admin_1.FieldValue.serverTimestamp(), updatedBy: uid });
    await announce(eventId, `Stage completed`, `Stage ${stageId} has finished.`);
    await (0, recompute_1.recomputeSummaryFor)(uid);
    return { ok: true };
});
exports.cancelStage = functions.region(region).https.onCall(async (data, ctx) => {
    const uid = assertAuthed(ctx);
    const { eventId, stageId } = data || {};
    await assertEventOwner(String(eventId), uid);
    await admin_1.db.doc(`events/${eventId}/stages/${stageId}`).update({ status: 'cancelled', updatedAt: admin_1.FieldValue.serverTimestamp(), updatedBy: uid });
    await announce(eventId, `Stage cancelled`, `Stage ${stageId} has been cancelled.`);
    await (0, recompute_1.recomputeSummaryFor)(uid);
    return { ok: true };
});
exports.delayStage = functions.region(region).https.onCall(async (data, ctx) => {
    const uid = assertAuthed(ctx);
    const { eventId, stageId, minutes } = data || {};
    const m = Number(minutes || 0);
    if (!Number.isFinite(m) || m <= 0)
        throw new functions.https.HttpsError('invalid-argument', 'minutes > 0 required');
    await assertEventOwner(String(eventId), uid);
    const ref = admin_1.db.doc(`events/${eventId}/stages/${stageId}`);
    const doc = await ref.get();
    if (!doc.exists)
        throw new functions.https.HttpsError('not-found', 'Stage not found');
    const curStart = doc.get('startAt');
    const curDelay = Number(doc.get('delayMinutes') || 0);
    const base = curStart?.toDate ? curStart.toDate() : (curStart ? new Date(curStart) : null);
    const newStart = base ? new Date(base.getTime() + m * 60000) : null;
    await ref.update(clean({
        status: 'delayed',
        delayMinutes: curDelay + m,
        startAt: newStart ?? undefined,
        updatedAt: admin_1.FieldValue.serverTimestamp(),
        updatedBy: uid,
    }));
    await announce(eventId, `Stage delayed +${m}m`, `Stage ${stageId} delayed by ${m} minutes.`);
    await (0, recompute_1.recomputeSummaryFor)(uid);
    return { ok: true };
});
