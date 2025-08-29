
import * as functions from 'firebase-functions';
import { db, FieldValue } from './admin';

// Helper: base64url doc id from full path
function encodePath(p: string) {
  return Buffer.from(p).toString('base64url');
}

// Extract eventId and first-level folder from: events/{eventId}/docs/{folder}/{file...}
function parsePath(p?: string) {
  if (!p) return null;
  const m = p.match(/^events\/([^/]+)\/docs\/(.+)$/);
  if (!m) return null;
  const eventId = m[1];
  const rest = m[2];
  const folder = rest.split('/')[0] || 'root';
  const name = p.split('/').pop() || '';
  return { eventId, folder, name, fullPath: p };
}

export const fileIndexed = functions.storage.object().onFinalize(async (obj) => {
  const meta = parsePath(obj.name || '');
  if (!meta) return;

  const { eventId, folder, name, fullPath } = meta;
  const timeCreated =
    obj.timeCreated ? new Date(obj.timeCreated) : new Date();

  const doc = {
    eventId,
    path: fullPath,
    folder,                  // "maps" | "bulletins" | "regulations" | ...
    name,
    size: obj.size ? Number(obj.size) : 0,
    contentType: obj.contentType || 'application/octet-stream',
    timeCreated,             // Firestore Timestamp (from Admin) when stored
    updatedAt: FieldValue.serverTimestamp(),
  };

  await db.collection('events').doc(eventId)
    .collection('files').doc(encodePath(fullPath))
    .set(doc, { merge: true });
});

export const fileDeleted = functions.storage.object().onDelete(async (obj) => {
  const meta = parsePath(obj.name || '');
  if (!meta) return;
  const { eventId, fullPath } = meta;
  await db.collection('events').doc(eventId)
    .collection('files').doc(encodePath(fullPath))
    .delete().catch(() => {});
});
