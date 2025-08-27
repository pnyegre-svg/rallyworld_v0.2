
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { app } from './firebase';

export const uploadFile = async (file: File, path: string): Promise<string> => {
  try {
    const auth = getAuth(app);
    const user = auth.currentUser;
    if (!user) throw new Error('AUTH_REQUIRED');

    const storage = getStorage(app);
    const fileRef = ref(storage, path);
    const snap = await uploadBytes(fileRef, file, {
      contentType: file.type,
      customMetadata: { uid: user.uid }
    });
    return await getDownloadURL(snap.ref);
  } catch (error) {
    console.error('Error uploading file:', error);
    // Bubble a clearer cause to the caller
    if ((error as Error).message === 'AUTH_REQUIRED') {
      throw new Error('You must be signed in to upload.');
    }
    throw new Error('Could not upload file.');
  }
};
