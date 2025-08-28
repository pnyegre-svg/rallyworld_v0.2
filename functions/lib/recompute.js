"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recomputeSummaryFor = recomputeSummaryFor;
const dayjs_1 = __importDefault(require("dayjs"));
const utc_1 = __importDefault(require("dayjs/plugin/utc")); // ← no .js suffix
const timezone_1 = __importDefault(require("dayjs/plugin/timezone")); // ← no .js suffix
dayjs_1.default.extend(utc_1.default);
dayjs_1.default.extend(timezone_1.default);
const admin_1 = require("./admin");
async function recomputeSummaryFor(uid) {
    const today = (0, dayjs_1.default)().tz('UTC'); // replace with your per-user tz function if you have it
    const start = today.startOf('day').toDate();
    const end = today.endOf('day').toDate();
    // 🔧 HOTFIX: no composite index required
    const evSnap = await admin_1.db.collection('events')
        .where('organizerId', '==', uid)
        .get();
    const events = evSnap.docs.filter((d) => {
        const dates = d.get('dates') || {};
        const toVal = dates.to ?? d.get('endDate');
        const toDate = toVal?.toDate ? toVal.toDate() : toVal ? new Date(toVal) : null;
        return !!toDate && toDate >= start;
    });
    const todayStages = [];
    let pendingEntries = 0, unpaidEntries = 0;
    const latestAnnouncements = [];
    for (const ev of events) {
        const e = ev.data();
        const stages = await ev.ref.collection('stages')
            .where('startAt', '>=', start)
            .where('startAt', '<', end)
            .get();
        stages.forEach(s => todayStages.push({
            eventId: ev.id,
            eventTitle: e.title,
            stageId: s.id,
            stageName: s.get('name'),
            startAt: s.get('startAt'),
            location: s.get('location'),
            distanceKm: s.get('distanceKm'),
            status: s.get('status') ?? 'scheduled'
        }));
        pendingEntries += (await ev.ref.collection('entries').where('status', '==', 'new').get()).size;
        unpaidEntries += (await ev.ref.collection('entries').where('paymentStatus', '==', 'unpaid').get()).size;
        const ann = await ev.ref.collection('announcements').orderBy('publishedAt', 'desc').limit(1).get();
        ann.forEach(a => latestAnnouncements.push({
            eventId: ev.id, annId: a.id, title: a.get('title'), publishedAt: a.get('publishedAt')
        }));
    }
    todayStages.sort((a, b) => (a.startAt?.toMillis?.() ?? new Date(a.startAt).getTime()) -
        (b.startAt?.toMillis?.() ?? new Date(b.startAt).getTime()));
    await admin_1.db.doc(`dashboard_summary/${uid}`).set({
        todayStages,
        counters: { pendingEntries, unpaidEntries },
        latestAnnouncements: latestAnnouncements.slice(0, 3),
        updatedAt: admin_1.FieldValue.serverTimestamp()
    }, { merge: true });
}
