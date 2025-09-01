
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, UserRole, Organizer } from '@/lib/data';
import { getUser, createUser, updateUser } from '@/lib/users';
import { onAuthStateChanged, Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { FirebaseStorage } from 'firebase/storage';
import { FirebaseFunctions } from 'firebase/functions';

// Hold the initialized services in a non-state object
// to avoid serialization issues with Zustand's persistance middleware.
let services: {
    auth: Auth;
    db: Firestore;
    storage: FirebaseStorage;
    functions: FirebaseFunctions;
} | null = null;


type UserState = {
  user: User | null;
  initialize: (deps: typeof services) => () => void; // Returns the unsubscribe function
  signInUser: (email: string, name?: string) => Promise<void>;
  setRole: (role: UserRole) => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
  updateUserProfile: (data: Partial<Omit<User, 'id' | 'email'>>) => Promise<void>;
  signOutUser: () => void;
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      initialize: (deps) => {
        services = deps;
        const { auth, db } = deps;
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
              if (!get().user || get().user?.email !== firebaseUser.email) {
                  console.log("Auth state changed: User is signed in. Fetching profile...");
                  await get().signInUser(firebaseUser.email!, firebaseUser.displayName || undefined);
              }
            } else {
              console.log("Auth state changed: User is signed out.");
              set({ user: null });
            }
        });
        return unsubscribe;
      },
      signOutUser: () => {
        set({ user: null });
      },
      signInUser: async (email, name) => {
        if (!services) throw new Error("Firebase services not initialized.");
        const { auth, db } = services;
        const firebaseUser = auth.currentUser;
        if (!firebaseUser) throw new Error("User not authenticated in Firebase");

        let userProfile = await getUser(db, firebaseUser.uid);

        if (!userProfile) {
            console.log(`No profile found for ${email}. Creating new user...`);
            const newUser: Omit<User, 'id'> = {
                name: name || firebaseUser.displayName || 'New User',
                email: email,
                avatar: firebaseUser.photoURL || `/avatars/${Math.floor(Math.random() * 5) + 1}.png`,
                profilePicture: firebaseUser.photoURL || '',
                roles: ['fan'],
                currentRole: 'fan',
            };
            await createUser(db, firebaseUser.uid, newUser);
            userProfile = { ...newUser, id: firebaseUser.uid };
            console.log(`New user created for ${email}.`);
        } else {
             console.log(`Profile found for ${email}.`);
        }
        
        if (userProfile.email === 'admin@rally.world' && !(userProfile.roles || []).includes('organizer')) {
            userProfile.roles = [...(userProfile.roles || []), 'organizer'];
            userProfile.currentRole = 'organizer';
            await updateUser(db, userProfile.id, { roles: userProfile.roles, currentRole: userProfile.currentRole });
        }
        set({ user: userProfile });
      },
      setRole: async (role: UserRole) => {
        if (!services) throw new Error("Firebase services not initialized.");
        const { db } = services;
        const currentUser = get().user;
        if (!currentUser) return;

        const currentRoles = currentUser.roles || [];
        const newRoles = currentRoles.includes(role) ? currentRoles : [...currentRoles, role];
        
        const updatedUser = { ...currentUser, roles: newRoles, currentRole: role };
        
        set({ user: updatedUser });
        
        await updateUser(db, currentUser.id, { roles: newRoles, currentRole: role });
      },
      switchRole: async (role: UserRole) => {
        if (!services) throw new Error("Firebase services not initialized.");
        const { db } = services;
        const currentUser = get().user;
        if (!currentUser) return;
        
        set({ user: { ...currentUser, currentRole: role } });
        await updateUser(db, currentUser.id, { currentRole: role });
      },
      updateUserProfile: async (data) => {
        if (!services) throw new Error("Firebase services not initialized.");
        const { db } = services;
        const currentUser = get().user;
        if (!currentUser) return;

        const updatedData: Partial<User> = { ...data };

        if (data.profilePicture) {
            updatedData.avatar = data.profilePicture;
        }
        
        const updatedUser = await updateUser(db, currentUser.id, updatedData);
        if (updatedUser) {
          set({ user: updatedUser });
        }
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

// Export a hook to get the services safely.
export const useFirebaseServices = () => {
    if (!services) {
        throw new Error("Firebase services have not been initialized. Ensure Providers component is at the root.");
    }
    return services;
}
