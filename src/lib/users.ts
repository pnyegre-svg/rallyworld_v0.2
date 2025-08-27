
import { db } from './firebase';
import { collection, addDoc, getDocs, doc, setDoc, updateDoc, query, where, DocumentData, QueryDocumentSnapshot, getDoc } from 'firebase/firestore';
import type { User, Organizer, UserRole } from './data';

// Firestore converter for the User object
const userConverter = {
  toFirestore: (user: Partial<User>): DocumentData => {
    // Only include fields that are not undefined
    const data: DocumentData = {};
    if (user.name !== undefined) data.name = user.name;
    if (user.email !== undefined) data.email = user.email;
    if (user.avatar !== undefined) data.avatar = user.avatar;
    if (user.roles !== undefined) data.roles = user.roles;
    if (user.currentRole !== undefined) data.currentRole = user.currentRole;
    if (user.organizerProfile !== undefined) {
        // Ensure organizer profile has an ID. If it's new, it won't have one from the client.
        // Firestore will generate one for the document, but we're dealing with a sub-object here.
        const profile = user.organizerProfile;
        if (!profile.id.startsWith('org_')) {
            profile.id = doc(collection(db, 'users')).id; // Temporary, just to have a unique ID if needed, though this is a subcollection.
        }
        data.organizerProfile = profile;
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

// Update an existing user and return the updated user object
export const updateUser = async (userId: string, userData: Partial<User>): Promise<User | null> => {
    try {
        const userRef = doc(db, 'users', userId);

        // If updating organizerProfile and it's new, assign a stable ID
        if (userData.organizerProfile && userData.organizerProfile.id.startsWith('org_')) {
            const newOrganizerId = doc(collection(db, 'dummy_ids')).id;
            userData.organizerProfile.id = newOrganizerId;
        }
        
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
