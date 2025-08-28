'use client';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getFirebaseApp } from './firebase';

let dbInstance: Firestore | null = null;

export function db() {
  if (!dbInstance) {
    dbInstance = getFirestore(getFirebaseApp());
  }
  return dbInstance;
}
