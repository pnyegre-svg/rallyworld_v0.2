
'use client';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject as deleteFile, listAll, type StorageReference, type UploadTask, type UploadTaskSnapshot } from 'firebase/storage';
import { auth, storage } from './firebase.client';

export type ProgressHandler = (p: { loaded: number, total: number, progress: number, snapshot: UploadTaskSnapshot }) => void;

function getRoot(eventId?: string, category?: string): StorageReference {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('User not authenticated');
  
  let path = `events/${eventId}/docs`;
  if (category) path += `/${category}`;

  return ref(storage, path);
}

export function upload(file: File, eventId: string, category: string, onProgress?: ProgressHandler): { task: UploadTask, promise: Promise<any> } {
  const fileRef = ref(getRoot(eventId, category), file.name);
  const task = uploadBytesResumable(fileRef, file);
  
  const promise = new Promise((resolve, reject) => {
    task.on('state_changed',
      (snapshot) => onProgress?.({
        loaded: snapshot.bytesTransferred,
        total: snapshot.totalBytes,
        progress: (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
        snapshot
      }),
      (error) => reject(error),
      () => getDownloadURL(task.snapshot.ref).then(resolve, reject)
    );
  });

  return { task, promise };
}

export async function deleteObject(path: string) {
  const fileRef = ref(storage, path);
  await deleteFile(fileRef);
}
