
'use client';

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, storage } from './firebase.client';
import { User, onAuthStateChanged } from 'firebase/auth';

// Helper that waits for auth to be ready
export async function requireUser(): Promise<User> {
  const existing = auth.currentUser;
  if (existing) return existing;
  return new Promise((resolve, reject) => {
    const unsub = onAuthStateChanged(auth, (u) => {
      unsub();
      if (u) resolve(u);
      else reject(new Error('Not signed in'));
    });
  });
}


/**
 * Uploads a file to a specified path in Firebase Storage.
 * This function now ensures a user is authenticated before proceeding.
 *
 * @param file The file to upload.
 * @param type The type of upload, determines the folder path.
 * @returns A promise that resolves with the public download URL of the uploaded file.
 */
export const uploadFile = async (file: File, type: 'organizer' | 'user'): Promise<string> => {
  const user = await requireUser(); // <-- Guarantees request.auth != null at rules time
  
  const folder = type === 'organizer' ? `public/organizers/${user.uid}/club-profile-picture` : `public/users/${user.uid}/profile-picture`;
  const path = `${folder}/${Date.now()}-${file.name}`;
  
  const storageRef = ref(storage, path);

  try {
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (err: any) {
    console.error('Firebase Storage upload error:', err);

    // Provide clearer error messages for common issues.
    if (err?.code === 'storage/unauthorized' || err?.code === 'storage/unauthenticated') {
      throw new Error(
        'Firebase Storage permission denied. Please ensure you are logged in and your storage rules are correct.'
      );
    }
    if (err?.code === 'storage/object-not-found') {
        throw new Error(
            'File not found. This can happen if the storage rules are not deployed correctly.'
        )
    }
    
    throw new Error('Could not upload file.');
  }
};
