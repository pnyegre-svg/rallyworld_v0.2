
'use client';
import { collection, addDoc, getDocs, doc, setDoc, updateDoc, query, where, DocumentData, QueryDocumentSnapshot, getDoc, Firestore } from 'firebase/firestore';
import type { User, Organizer, UserRole } from './data';

// Firestore converter for the User object
const userConverter = {
  toFirestore: (user: Partial<User>): DocumentData => {
    // Only include fields that are not undefined
    const data: DocumentData = {};
    if (user.name !== undefined) data.name = user.name;
    if (user.email !== undefined) data.email = user.email;
    if (user.avatar !== undefined) data.avatar = user.avatar;
    if (user.profilePicture !== undefined) data.profilePicture = user.profilePicture;
    if (user.roles !== undefined) data.roles = user.roles;
    if (user.currentRole !== undefined) data.currentRole = user.currentRole;
    if (user.organizerProfile !== undefined) {
        data.organizerProfile = user.organizerProfile;
    }
    return data;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot | DocumentData): User => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      name: data.name,
      email: data.email,
      avatar: data.avatar,
      profilePicture: data.profilePicture,
      roles: data.roles,
      currentRole: data.currentRole,
      organizerProfile: data.organizerProfile,
    };
  }
};


// Get a single user by ID (which is the Firebase Auth UID)
export const getUser = async (db: Firestore, userId: string): Promise<User | null> => {
  const usersCollection = collection(db, 'users').withConverter(userConverter);
  try {
    const docRef = doc(usersCollection, userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error("Error getting user by ID: ", error);
    return null;
  }
};


// Create a new user
export const createUser = async (db: Firestore, userId: string, userData: Omit<User, 'id'>): Promise<string> => {
    try {
        const userDocRef = doc(db, 'users', userId);
        await setDoc(userDocRef, userData);
        return userId;
    } catch (error) {
        console.error("Error creating user: ", error);
        throw new Error("Could not create user.");
    }
};

// Update an existing user and return the updated user object
export const updateUser = async (db: Firestore, userId: string, userData: Partial<User>): Promise<User | null> => {
    try {
        const userRef = doc(db, 'users', userId);
        
        await updateDoc(userRef, userConverter.toFirestore(userData));
        
        // After updating, fetch the document to return the latest state
        const updatedDoc = await getDoc(userRef.withConverter(userConverter));
        if (updatedDoc.exists()) {
            return updatedDoc.data();
        }
        return null;

    } catch (error) {
        console.error("Error updating user: ", error);
        throw new Error("Could not update user.");
    }
};
