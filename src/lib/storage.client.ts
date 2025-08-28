'use client';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getFirebaseApp } from './firebase';

let storageInstance: FirebaseStorage | null = null;

export function storage() {
  if (!storageInstance) {
    storageInstance = getStorage(getFirebaseApp());
  }
  return storageInstance;
}
