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


export const onFileUpload = functions.region(region).storage.object().onFinalize(async (object) => {
    const { bucket, name, contentType, size, timeCreated, updated } = object;
    if (!name) return;

    // Example path: uploads/{uid}/{eventId}/{category}/{filename}
    const parts = name.split('/');
    if (parts[0] !== 'uploads' || parts.length < 4) {
        console.log(`Object ${name} is not in a tracked uploads path.`);
        return;
    }

    const [, ownerId, eventId, category] = parts;
    const filename = parts.slice(3).join('/');

    const fileMeta = {
        ownerId,
        eventId,
        category,
        path: name,
        filename,
        contentType,
        size: Number(size),
        createdAt: timeCreated,
        updatedAt: updated,
    };
    
    // Use filename as document ID to prevent duplicates on rewrite
    const docId = name.replace(/\//g, '_');
    await db.collection('events').doc(eventId).collection('files').doc(docId).set(fileMeta, { merge: true });
});
