
'use client';

import { getStorage, ref as sref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase.client';
import { getAuth } from 'firebase/auth';

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

async function assertCanUpload(eventId: string, file: File) {
  const uid = getAuth().currentUser?.uid;
  if (!uid) throw new Error('Please sign in first.');
  const ev = await getDoc(doc(db, 'events', eventId));
  if (!ev.exists()) throw new Error('Selected event no longer exists.');
  if (ev.data()?.organizerId !== uid) throw new Error('You are not the organizer for this event.');
  if (file.size > 20 * 1024 * 1024) throw new Error('File too large (20 MB limit).');
}

export async function uploadFile(eventId: string, file: File) {
  await assertCanUpload(eventId, file);

  const safeName = file.name.replace(/[^\w.\-]+/g, '_');
  const path = `events/${eventId}/${Date.now()}-${safeName}`;

  // ✅ Always send a contentType that your rules allow
  const contentType = file.type || guessMime(safeName) || 'application/octet-stream';
  const metadata = { contentType };

  try {
    const task = uploadBytesResumable(sref(storage, path), file, metadata);

    await new Promise<void>((resolve, reject) => {
      task.on(
        'state_changed',
        undefined,
        reject,
        () => resolve()
      );
    });

    const downloadURL = await getDownloadURL(task.snapshot.ref);
    return { path, downloadURL };
  } catch (err: any) {
    // Surface the real reason so we can diagnose quickly
    console.error('upload error:', { code: err?.code, message: err?.message, raw: err });

    if (err?.code === 'storage/unauthorized' || err?.code === 'storage/unauthenticated') {
      // App Check failures also come through as "unauthorized"
      const hint = err?.message?.toLowerCase().includes('app check')
        ? 'App Check token invalid or origin not allowed.'
        : 'Rule denied: not organizer, file type/size, or event missing.';
      throw new Error(`Not allowed to upload: ${hint}`);
    }
    throw err;
  }
}
