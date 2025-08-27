
'use client';

import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth } from './firebase';

const storage = getStorage();

/**
 * Uploads a file to a specified path in Firebase Storage.
 *
 * @param file The file to upload.
 * @param path The destination path in the storage bucket (e.g., 'public/users/user123/profile.jpg').
 * @returns A promise that resolves with the public download URL of the uploaded file.
 */
export const uploadFile = async (file: File, path: string): Promise<string> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('You must be logged in to upload files.');
  }

  const storageRef = ref(storage, path);

  try {
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (err: any) {
    console.error('Firebase Storage upload error:', err);

    // Provide clearer error messages for common issues.
    if (err?.code === 'storage/unauthorized') {
      throw new Error(
        'Firebase Storage permission denied. Please ensure you are logged in.'
      );
    }
    if (err?.code === 'storage/object-not-found') {
        throw new Error(
            'File not found. This can happen if the storage rules are not deployed correctly.'
        )
    }
     if (err?.code === 'storage/unauthenticated') {
      throw new Error(
        'Firebase Storage permission denied. Please ensure you are logged in and your storage rules are correct.'
      );
    }
    
    throw new Error('Could not upload file.');
  }
};

    