import { db } from './firebase';
import { collection, addDoc, getDocs, doc, setDoc, updateDoc, query, where, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import type { User, Organizer, UserRole } from './data';

// Firestore converter for the User object
const userConverter = {
  toFirestore: (user: Partial<User>): DocumentData => {
    // Only include fields that are not undefined
    const data: DocumentData = {};
    if (user.name) data.name = user.name;
    if (user.email) data.email = user.email;
    if (user.avatar) data.avatar = user.avatar;
    if (user.roles) data.roles = user.roles;
    if (user.currentRole) data.currentRole = user.currentRole;
    if (user.organizerProfile) data.organizerProfile = user.organizerProfile;
    return data;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot): User => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      name: data.name,
      email: data.email,
      avatar: data.avatar,
      roles: data.roles,
      currentRole: data.currentRole,
      organizerProfile: data.organizerProfile,
    };
  }
};


const usersCollection = collection(db, 'users').withConverter(userConverter);

// Get a single user by email
export const getUser = async (email: string): Promise<User | null> => {
  try {
    const q = query(usersCollection, where("email", "==", email.toLowerCase()));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    return querySnapshot.docs[0].data();
  } catch (error) {
    console.error("Error getting user: ", error);
    return null;
  }
};

// Create a new user
export const createUser = async (userData: Omit<User, 'id'>): Promise<string> => {
    try {
        const docRef = await addDoc(usersCollection, userData);
        return docRef.id;
    } catch (error) {
        console.error("Error creating user: ", error);
        throw new Error("Could not create user.");
    }
};

// Update an existing user
export const updateUser = async (userId: string, userData: Partial<User>): Promise<void> => {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, userConverter.toFirestore(userData));
    } catch (error) {
        console.error("Error updating user: ", error);
        throw new Error("Could not update user.");
    }
};
