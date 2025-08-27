// src/lib/storage.ts
import { app } from '@/lib/firebase';              // your initializeApp()
import { getAuth } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Upload a file to Firebase Storage and return its download URL.
 * Requires that a user is signed in (enforced here and by Storage rules).
 */
export async function uploadFile(file: File, path: string): Promise<string> {
  try {
    const auth = getAuth(app);
    const user = auth.currentUser;
    if (!user) {
      // This makes the real cause obvious in your UI
      throw new Error('AUTH_REQUIRED');
    }

    const storage = getStorage(app);
    const fileRef = ref(storage, path);

    // Optional: contentType helps with correct serving
    const snap = await uploadBytes(fileRef, file, {
      contentType: file.type || 'application/octet-stream',
      customMetadata: { uid: user.uid }
    });

    const url = await getDownloadURL(snap.ref);
    return url;
  } catch (err: any) {
    console.error('Error uploading file:', err);
    if (err?.message === 'AUTH_REQUIRED') {
      throw new Error('You must be signed in to upload.');
    }
    // Surface Firebase auth error too (helps debugging)
    if (err?.code === 'storage/unauthenticated') {
      throw new Error('Firebase Storage says you are not authenticated.');
    }
    throw new Error('Could not upload file.');
  }
}
