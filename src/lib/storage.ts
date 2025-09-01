
import { getStorage, ref as sref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { auth } from './firebase.client';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase.client';

const storage = getStorage();

function guessMime(name: string) {
  const ext = name.split('.').pop()?.toLowerCase();
  const map: Record<string,string> = {
    pdf:'application/pdf',
    jpg:'image/jpeg', jpeg:'image/jpeg', png:'image/png', gif:'image/gif', webp:'image/webp',
    doc:'application/msword', docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls:'application/vnd.ms-excel', xlsx:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt:'application/vnd.ms-powerpoint', pptx:'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    txt:'text/plain'
  };
  return (ext && map[ext]) || '';
}

function toError(e: any): Error {
  if (e instanceof Error) return e;
  if (e && typeof e === 'object') {
    const code = (e as any).code || (e as any).name || 'unknown';
    const msg  = (e as any).message || JSON.stringify(e);
    const err = new Error(msg);
    (err as any).code = code;
    return err;
  }
  if (typeof e === 'string') return new Error(e);
  return new Error('Unknown error');
}

async function assertCanUpload(eventId: string, file: File) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Please sign in first.');
  const ev = await getDoc(doc(db, 'events', eventId));
  if (!ev.exists()) throw new Error('Selected event no longer exists.');
  if (ev.data()?.organizerId !== uid) throw new Error('You are not the organizer for this event.');
  if (file.size > 20 * 1024 * 1024) throw new Error('File too large (20 MB limit).');
}

export async function uploadFile(eventId: string, file: File) {
  await assertCanUpload(eventId, file);

  const safeName = file.name.replace(/[^\w.-]+/g, '_');
  const path = `events/${eventId}/${Date.now()}-${safeName}`;

  // ✅ ensure rules see an allowed contentType (fallback to guessed)
  const contentType = file.type || guessMime(safeName) || 'application/octet-stream';
  const metadata = { contentType };

  try {
    const ref = sref(storage, path);
    const task = uploadBytesResumable(ref, file, metadata);

    // Capture errors explicitly from state_changed to avoid empty {} in catch
    await new Promise<void>((resolve, reject) => {
      task.on(
        'state_changed',
        // progress listener (optional)
        undefined,
        (e) => {
          const err = toError(e);
          console.error('upload state_changed error:', { code: (err as any).code, message: err.message, raw: e });
          reject(err);
        },
        () => resolve()
      );
    });

    const downloadURL = await getDownloadURL(task.snapshot.ref);
    return { path, downloadURL };
  } catch (e: any) {
    const err = toError(e);
    console.error('upload failed:', { code: (err as any).code, message: err.message, raw: e });

    // Helpful, specific messages
    const code = (err as any).code || '';
    if (code === 'storage/unauthorized' || code === 'storage/unauthenticated') {
      // Could be: not organizer, event missing, disallowed MIME/ext, App Check
      throw new Error('Not allowed to upload. Verify you are signed in, organizer of the selected event, file type/size allowed, and App Check origin is authorized.');
    }
    if (code === 'storage/canceled') {
      throw new Error('Upload was canceled.');
    }
    throw err;
  }
}
