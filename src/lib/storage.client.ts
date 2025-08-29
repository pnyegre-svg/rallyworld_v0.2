
'use client';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject as deleteFile, listAll, type StorageReference, type UploadTask, type UploadTaskSnapshot } from 'firebase/storage';
import { getFirebaseApp } from './firebase.client';
import { auth } from './firebase.client';

export type ProgressHandler = (p: { loaded: number, total: number, progress: number, snapshot: UploadTaskSnapshot }) => void;

function getRoot(): StorageReference {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('User not authenticated');
  return ref(getStorage(getFirebaseApp()), `uploads/${uid}`);
}

export function upload(file: File, onProgress?: ProgressHandler): { task: UploadTask, promise: Promise<any> } {
  const fileRef = ref(getRoot(), file.name);
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

export async function listAllFiles() {
  const root = getRoot();
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
