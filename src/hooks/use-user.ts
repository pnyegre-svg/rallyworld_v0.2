
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, UserRole, Organizer } from '@/lib/data';
import { getUser, createUser, updateUser } from '@/lib/users';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { appCheckReady } from '@/lib/app-check';

type UserState = {
  user: User | null;
  isAuthReady: boolean; // To confirm Firebase auth state is resolved AND user profile is loaded
  initializeAuth: () => () => void; // Returns the unsubscribe function
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
      isAuthReady: false,
      initializeAuth: () => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            // First, wait for App Check to be ready
            await appCheckReady;
            
            if (firebaseUser) {
              if (!get().user || get().user?.email !== firebaseUser.email) {
                  await get().signInUser(firebaseUser.email!);
              }
            } else {
              set({ user: null });
            }
            // Only set auth ready to true once the initial check and potential user load is complete.
            if (!get().isAuthReady) {
                 set({ isAuthReady: true });
            }
        });
        return unsubscribe;
      },
      signOutUser: () => {
        set({ user: null, isAuthReady: false });
      },
      signInUser: async (email, name) => {
        const firebaseUser = auth.currentUser;
        if (!firebaseUser) throw new Error("User not authenticated in Firebase");

        let userProfile = await getUser(firebaseUser.uid);

        if (!userProfile) {
            const newUser: Omit<User, 'id'> = {
                name: name || 'New User',
                email: email,
                avatar: `/avatars/${Math.floor(Math.random() * 5) + 1}.png`,
                profilePicture: '',
                roles: ['fan'],
                currentRole: 'fan',
            };
            await createUser(firebaseUser.uid, newUser);
            userProfile = { ...newUser, id: firebaseUser.uid };
        }
        
        if (userProfile.email === 'admin@rally.world' && !userProfile.roles.includes('organizer')) {
            userProfile.roles.push('organizer');
            userProfile.currentRole = 'organizer';
            await updateUser(userProfile.id, { roles: userProfile.roles, currentRole: userProfile.currentRole });
        }

        set({ user: userProfile });
      },
      setRole: async (role: UserRole) => {
        const currentUser = get().user;
        if (!currentUser) return;

        const currentRoles = currentUser.roles || [];
        const newRoles = currentRoles.includes(role) ? currentRoles : [...currentRoles, role];
        
        const updatedUser = { ...currentUser, roles: newRoles, currentRole: role };
        
        set({ user: updatedUser });
        
        await updateUser(currentUser.id, { roles: newRoles, currentRole: role });
      },
      switchRole: async (role: UserRole) => {
        const currentUser = get().user;
        if (!currentUser) return;
        
        set({ user: { ...currentUser, currentRole: role } });
        await updateUser(currentUser.id, { currentRole: role });
      },
      updateUserProfile: async (data) => {
        const currentUser = get().user;
        if (!currentUser) return;

        const updatedData: Partial<User> = { ...data };

        if (data.profilePicture) {
            updatedData.avatar = data.profilePicture;
        }
        
        const updatedUser = await updateUser(currentUser.id, updatedData);
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
