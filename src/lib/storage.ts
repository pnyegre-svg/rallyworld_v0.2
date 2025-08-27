
'use client';

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase'; // Import the initialized storage instance

/**
 * Uploads a file to a specified path in Firebase Storage.
 *
 * @param file The file to upload.
 * @param userId The authenticated user's ID.
 * @param type The type of upload, determines the folder path.
 * @param fileName The name of the file to be saved.
 * @returns A promise that resolves with the public download URL of the uploaded file.
 */
export const uploadFile = async (file: File, userId: string, type: 'organizer' | 'user', fileName: string): Promise<string> => {
  const path = type === 'organizer' 
    ? `public/organizers/${userId}/club-profile-picture/${fileName}`
    : `public/users/${userId}/profile-picture/${fileName}`;
  
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
