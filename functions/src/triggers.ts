import * as functions from 'firebase-functions';
import { db, FieldValue } from './admin';

const region = 'europe-central2';

export const processScheduledAnnouncements = functions.region(region).pubsub
  .schedule('every 5 minutes')
  .onRun(async () => {
    const now = new Date();
    const q = await db.collectionGroup('announcements')
      .where('status','==','scheduled')
      .where('publishAt','<=', now)
      .get();
    for (const d of q.docs) {
      await d.ref.update({ status:'published', publishedAt: FieldValue.serverTimestamp(), publishAt: FieldValue.delete() });
    }
  });
