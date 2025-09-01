
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

async function assertCanUpload(file: File, type: 'user' | 'organizer' | 'event', eventId?: string) {
  const uid = getAuth().currentUser?.uid;
  if (!uid) throw new Error('Please sign in first.');

  if (type === 'event') {
    if (!eventId) throw new Error('Event ID is required for event uploads.');
    const ev = await getDoc(doc(db, 'events', eventId));
    if (!ev.exists()) throw new Error('Selected event no longer exists.');
    if (ev.data()?.organizerId !== uid) throw new Error('You are not the organizer for this event.');
  }
  
  if (file.size > 20 * 1024 * 1024) throw new Error('File too large (20 MB limit).');
}

export async function uploadFile(type: 'user' | 'organizer' | 'event', file: File, eventId?: string) {
  await assertCanUpload(file, type, eventId);

  const safeName = file.name.replace(/[^\w.\-]+/g, '_');
  
  let path = '';
  if (type === 'event') {
    if (!eventId) throw new Error("Event ID is required for 'event' type uploads.");
    path = `events/${eventId}/${Date.now()}-${safeName}`;
  } else if (type === 'organizer') {
    const uid = getAuth().currentUser!.uid;
    path = `public/organizers/${uid}/${Date.now()}-${safeName}`;
  } else {
    const uid = getAuth().currentUser!.uid;
    path = `public/users/${uid}/${Date.now()}-${safeName}`;
  }

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
    return downloadURL;
  } catch (err: any) {
    console.error('upload error:', { code: err?.code, message: err?.message, raw: err });

    if (err?.code === 'storage/unauthorized' || err?.code === 'storage/unauthenticated') {
      const hint = err?.message?.toLowerCase().includes('app check')
        ? 'App Check token invalid or origin not allowed.'
        : 'Rule denied: not organizer, file type/size, or event missing.';
      throw new Error(`Not allowed to upload: ${hint}`);
    }
    throw err;
  }
}
