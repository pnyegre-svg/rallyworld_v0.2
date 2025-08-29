
'use client';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject as deleteFile, listAll, type StorageReference, type UploadTask, type UploadTaskSnapshot } from 'firebase/storage';
import { getFirebaseApp } from './firebase.client';
import { auth } from './firebase.client';

export type ProgressHandler = (p: { loaded: number, total: number, progress: number, snapshot: UploadTaskSnapshot }) => void;

function getRoot(eventId?: string, category?: string): StorageReference {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('User not authenticated');
  
  // New path structure to match the storageIndex.ts trigger
  let path = `events/${eventId}/docs`;
  if (category) path += `/${category}`;

  return ref(getStorage(getFirebaseApp()), path);
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

export async function listAllFiles(eventId: string, category: string) {
  const root = getRoot(eventId, category);
  const res = await listAll(root);
  return Promise.all(res.items.map(async (itemRef) => {
    const [url, meta] = await Promise.all([
        getDownloadURL(itemRef),
        itemRef.fullPath,
    ]);
    return { name: itemRef.name, url, path: meta };
  }));
}

export async function deleteObject(path: string) {
  const fileRef = ref(getStorage(getFirebaseApp()), path);
  await deleteFile(fileRef);
}
