
'use client';

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, storage } from './firebase.client';
import { type User, onAuthStateChanged } from 'firebase/auth';

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
 * @param eventId Optional event ID for event-specific uploads.
 * @returns A promise that resolves with the public download URL of the uploaded file.
 */
export const uploadFile = async (file: File, type: 'organizer' | 'user' | 'event', eventId?: string): Promise<string> => {
  const user = await requireUser(); // <-- Guarantees request.auth != null at rules time
  
  let folder;
  switch (type) {
    case 'organizer':
        folder = `public/organizers/${user.uid}/club-profile-picture`;
        break;
    case 'user':
        folder = `public/users/${user.uid}/profile-picture`;
        break;
    case 'event':
        if (!eventId) {
            throw new Error("eventId is required for 'event' type uploads.");
        }
        // This path now matches the storage rules for event-related documents.
        folder = `events/${eventId}`;
        break;
    default:
        throw new Error("Invalid upload type specified.");
  }
  
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
