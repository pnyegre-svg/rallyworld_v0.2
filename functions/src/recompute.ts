
import * as functions from "firebase-functions";
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const db = getFirestore();

/**
 * Recomputes the dashboard summary for a given organizer.
 * Fetches today's stages, entry counts, and latest announcements based on the organizer's timezone.
 * @param {string} uid The UID of the organizer.
 */
export async function recomputeSummaryFor(uid: string) {
    const userSnap = await db.doc(`users/${uid}`).get();
    if (!userSnap.exists) {
        console.log(`User ${uid} not found. Skipping summary recomputation.`);
        return;
    }
    const timezone = userSnap.data()?.timezone || 'UTC';

    const startOfDay = dayjs().tz(timezone).startOf('day').toDate();
    const endOfDay = dayjs().tz(timezone).endOf('day').toDate();

    const eventsSnap = await db.collection('events')
        .where('organizerId', '==', uid)
        .where('dates.to', '>=', startOfDay) // Check against event end date
        .get();

    const todayStages: any[] = [];
    let pending = 0;
    let unpaid = 0;
    const latestAnnouncements: any[] = [];

    for (const eventDoc of eventsSnap.docs) {
        const eventData = eventDoc.data();

        // Find stages happening today
        const stagesSnap = await eventDoc.ref.collection('stages')
            .where('startAt', '>=', startOfDay)
            .where('startAt', '<=', endOfDay)
            .get();
        
        stagesSnap.forEach(stageDoc => {
            todayStages.push({
                eventId: eventDoc.id,
                stageId: stageDoc.id,
                eventTitle: eventData.title,
                ...stageDoc.data()
            });
        });

        // Count entries
        const pendingSnap = await eventDoc.ref.collection('entries').where('status', '==', 'new').get();
        pending += pendingSnap.size;
        
        const unpaidSnap = await eventDoc.ref.collection('entries').where('paymentStatus', '==', 'unpaid').get();
        unpaid += unpaidSnap.size;

        // Get latest announcement
        const annSnap = await eventDoc.ref.collection('announcements').orderBy('publishedAt', 'desc').limit(1).get();
        annSnap.forEach(annDoc => {
            latestAnnouncements.push({
                eventId: eventDoc.id,
                annId: annDoc.id,
                title: annDoc.get('title'),
                eventTitle: eventData.title,
                publishedAt: annDoc.get('publishedAt')
            });
        });
    }

    // Sort stages by start time and announcements by publish time
    todayStages.sort((a, b) => a.startAt.toMillis() - b.startAt.toMillis());
    latestAnnouncements.sort((a,b) => b.publishedAt.toMillis() - a.publishedAt.toMillis());

    await db.doc(`dashboard_summary/${uid}`).set({
        todayStages,
        counters: { pendingEntries: pending, unpaidEntries: unpaid },
        latestAnnouncements: latestAnnouncements.slice(0, 3), // Get top 3 overall
        updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });
}


/**
 * Triggered when a competitor's entry is written. Recomputes summary for the event organizer.
 */
export const onEntryWrite = async (change: functions.Change<functions.firestore.DocumentSnapshot>, context: functions.EventContext) => {
    const db = getFirestore();
    const eventRef = db.doc(`events/${context.params.eventId}`);
    const eventSnap = await eventRef.get();
    const organizerId = eventSnap.get('organizerId');
    if (organizerId) {
        await recomputeSummaryFor(organizerId);
    }
};

// Re-using the same logic for stage and announcement writes
export const onStageWrite = onEntryWrite;
export const onAnnouncementWrite = onEntryWrite;

/**
 * Scheduled function to refresh all active organizers' summaries.
 */
export const refreshAllForToday = async (context: functions.EventContext) => {
    console.log('Running scheduled summary refresh for all organizers.');
    // In a real implementation, this would query for all organizers with recent/upcoming events
    // and call recomputeSummaryFor(uid) for each of them.
    // For this example, we'll keep it simple.
    return null;
};
