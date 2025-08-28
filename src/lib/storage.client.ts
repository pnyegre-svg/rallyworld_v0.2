'use client';
import { getStorage } from 'firebase/storage';
import { getFirebaseApp } from './firebase';

export function storage() {
  return getStorage(getFirebaseApp());
}
