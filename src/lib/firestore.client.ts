'use client';
import { getFirestore } from 'firebase/firestore';
import { getFirebaseApp } from './firebase';

export function db() {
  return getFirestore(getFirebaseApp());
}
