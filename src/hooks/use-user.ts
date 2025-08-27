
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, UserRole, Organizer } from '@/lib/data';
import { getUser, createUser, updateUser } from '@/lib/users';
import { doc, collection, getFirestore } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

type UserState = {
  user: User | null;
  isLoading: boolean; // For initial page load
  isAuthReady: boolean; // To confirm Firebase auth state is resolved AND user profile is loaded
  signInUser: (email: string, name?: string) => Promise<void>;
  setRole: (role: UserRole) => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
  updateUserProfile: (data: Partial<Omit<User, 'id' | 'email'>>) => Promise<void>;
  setAuthReady: (isReady: boolean) => void;
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      isAuthReady: false,
      setAuthReady: (isReady: boolean) => {
        set({ isAuthReady: isReady, isLoading: !isReady });
      },
      signInUser: async (email, name) => {
        set({ isLoading: true, isAuthReady: false });
        try {
            let userProfile = await getUser(email);

            if (!userProfile) {
                // User doesn't exist, so create them
                const firebaseUser = auth.currentUser;
                if (!firebaseUser) throw new Error("User not authenticated in Firebase");

                const newUser: Omit<User, 'id'> = {
                    name: name || 'New User',
                    email: email,
                    avatar: `/avatars/${Math.floor(Math.random() * 5) + 1}.png`, // Default generic avatar
                    roles: ['fan'],
                    currentRole: 'fan',
                    profilePicture: '', // Initialize with empty string
                };
                const newUserId = await createUser(firebaseUser.uid, newUser);
                userProfile = { ...newUser, id: newUserId };
            }
            
            // Special case for admin to ensure they always have the organizer role
            if (userProfile.email === 'admin@rally.world' && !userProfile.roles.includes('organizer')) {
                userProfile.roles.push('organizer');
                userProfile.currentRole = 'organizer';
                await updateUser(userProfile.id, { roles: userProfile.roles, currentRole: userProfile.currentRole });
            }

            set({ user: userProfile, isLoading: false, isAuthReady: true });
        } catch (error) {
            console.error("Error signing in user:", error);
            set({ isLoading: false, isAuthReady: false, user: null });
        }
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

        // If profilePicture is being updated, also update the avatar for consistency
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

    