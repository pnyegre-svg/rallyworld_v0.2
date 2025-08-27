
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  projectId: 'rally-world',
  appId: '1:67027100425:web:832f96f8228d9346e4a9d8',
  storageBucket: 'rally-world.appspot.com',
  apiKey: 'AIzaSyD1SDoZo2M84Lqy6w6zbK3ZhWKtQcGQf-g',
  authDomain: '6000-firebase-studio-1756165267754.cluster-l6vkdperq5ebaqo3qy4ksvoqom.cloudworkstations.dev',
  measurementId: '',
  messagingSenderId: '67027100425',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
