
import { getStorage, ref as sref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getAppCheck, getToken } from 'firebase/app-check';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase.client';

const storage = getStorage();

function splitName(name: string) {
  const idx = name.lastIndexOf('.');
  if (idx <= 0) return { base: name, ext: '' };
  return { base: name.slice(0, idx), ext: name.slice(idx + 1) };
}
function slug(s: string) {
  // keep letters/numbers/_- and collapse runs
  return s.normalize('NFKD').replace(/[^\w-]+/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '') || 'file';
}
function mimeFromExt(ext: string) {
  const m: Record<string,string> = {
    pdf:'application/pdf',
    jpg:'image/jpeg', jpeg:'image/jpeg', png:'image/png', gif:'image/gif', webp:'image/webp',
    heic:'image/heic', heif:'image/heif',
    doc:'application/msword', docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls:'application/vnd.ms-excel', xlsx:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt:'application/vnd.ms-powerpoint', pptx:'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    txt:'text/plain'
  };
  return m[ext.toLowerCase()] || '';
}

async function assertCanUpload(eventId: string, file: File) {
  const uid = getAuth().currentUser?.uid;
  if (!uid) throw new Error('Please sign in first.');
  const ev = await getDoc(doc(db, 'events', eventId));
  if (!ev.exists()) throw new Error('Selected event no longer exists.');
  if (ev.data()?.organizerId !== uid) throw new Error('You are not the organizer for this event.');
}

export async function uploadFile(eventId: string, file: File, folder = 'docs') {
  // Warm App Check token to avoid first-request denial when enforcement is ON
  try { const ac = getAppCheck(); await getToken(ac, true); } catch {}

  await assertCanUpload(eventId, file);

  const { base, ext } = splitName(file.name || 'file');
  const safeBase = slug(base);
  const finalExt = (ext && slug(ext)) || (file.type && file.type.split('/')[1]) || 'bin';
  const fileName = `${safeBase}.${finalExt}`;                 // ✅ always has extension
  const path = `events/${eventId}/${folder}/${Date.now()}-${fileName}`;

  // Ensure rules see an allowed MIME even if browser sends octet-stream
  const contentType = file.type || mimeFromExt(finalExt) || 'application/octet-stream';
  const metadata = { contentType };

  console.log('upload debug', {
    path, fileType: file.type, name: file.name, sizeMB: (file.size/1024/1024).toFixed(1), contentType
  });

  const task = uploadBytesResumable(sref(storage, path), file, metadata);
  await new Promise<void>((resolve, reject) => {
    task.on('state_changed', undefined, reject, () => resolve());
  });
  const url = await getDownloadURL(task.snapshot.ref);
  return { path, url };
}
