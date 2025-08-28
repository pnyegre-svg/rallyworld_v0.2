
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import tz from 'dayjs/plugin/timezone.js';
import { db, FieldValue } from './admin';


dayjs.extend(utc); dayjs.extend(tz);


export async function getTodayRangeForUser(uid: string) {
const u = await db.doc(`users/${uid}`).get();
const timezone: string = (u.exists && u.get('timezone')) || 'UTC';
const start = dayjs().tz(timezone).startOf('day').toDate();
const end = dayjs().tz(timezone).endOf('day').toDate();
return { timezone, start, end };
}


export async function recomputeSummaryFor(uid: string) {
  const { start, end } = await getTodayRangeForUser(uid);

  // 🔧 HOTFIX: fetch organizer's events, then filter by date in memory
  const evSnap = await db.collection('events')
    .where('organizerId', '==', uid)
    .get();

  // support either schema: dates.{from,to} or startDate/endDate
  const events = evSnap.docs.filter((d) => {
    const dates = d.get('dates') || {};
    const toVal = dates.to ?? d.get('endDate');
    const toDate =
      toVal?.toDate ? toVal.toDate() :
      toVal ? new Date(toVal) : null;
    return !!toDate && toDate >= start; // overlap today
  });

  const todayStages: Array<any> = [];
  let pendingEntries = 0; let unpaidEntries = 0;
  const latestAnnouncements: Array<any> = [];

  for (const ev of events) {
    const e = ev.data();

    // stages today
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

    // counters
    pendingEntries += (await ev.ref.collection('entries').where('status', '==', 'new').get()).size;
    unpaidEntries  += (await ev.ref.collection('entries').where('paymentStatus', '==', 'unpaid').get()).size;

    // latest announcement
    const ann = await ev.ref.collection('announcements')
      .orderBy('publishedAt','desc').limit(1).get();
    ann.forEach(a => latestAnnouncements.push({
      eventId: ev.id, annId: a.id, title: a.get('title'), publishedAt: a.get('publishedAt')
    }));
  }

  todayStages.sort((a, b) =>
    (a.startAt?.toMillis?.() ?? new Date(a.startAt).getTime()) -
    (b.startAt?.toMillis?.() ?? new Date(b.startAt).getTime())
  );

  await db.doc(`dashboard_summary/${uid}`).set({
    todayStages,
    counters: { pendingEntries, unpaidEntries },
    latestAnnouncements: latestAnnouncements.slice(0, 3),
    updatedAt: FieldValue.serverTimestamp()
  }, { merge: true });
}
