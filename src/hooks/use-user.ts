
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, UserRole, Organizer } from '@/lib/data';
import { getUser, createUser, updateUser } from '@/lib/users';

type UserState = {
  user: User | null;
  isLoading: boolean;
  signInUser: (email: string, name?: string) => Promise<void>;
  setRole: (role: UserRole) => Promise<void>;
  switchRole: (role: UserRole) => void;
  updateOrganizerProfile: (profile: Organizer) => Promise<void>;
};

const defaultUser: User = {
    id: '',
    name: 'Rally Fan',
    email: '',
    avatar: '/avatars/04.png',
    roles: ['fan'],
    currentRole: 'fan',
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      signInUser: async (email, name) => {
        set({ isLoading: true });
        let userProfile = await getUser(email);

        if (!userProfile) {
            // User doesn't exist, so create them
            const newUser: Omit<User, 'id'> = {
                name: name || 'New User',
                email: email,
                avatar: `/avatars/${Math.floor(Math.random() * 5) + 1}.png`,
                roles: ['fan'],
                currentRole: 'fan',
            };
            const newUserId = await createUser(newUser);
            userProfile = { ...newUser, id: newUserId };
        }
        
        // Special case for admin to ensure they always have the organizer role
        if (userProfile.email === 'admin@rally.world' && !userProfile.roles.includes('organizer')) {
            userProfile.roles.push('organizer');
            userProfile.currentRole = 'organizer';
            await updateUser(userProfile.id, { roles: userProfile.roles, currentRole: userProfile.currentRole });
        }

        set({ user: userProfile, isLoading: false });
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
      switchRole: (role: UserRole) => {
        const currentUser = get().user;
        if (!currentUser) return;
        
        set({ user: { ...currentUser, currentRole: role } });
        await updateUser(currentUser.id, { currentRole: role });
      },
      updateOrganizerProfile: async (profile: Organizer) => {
        const currentUser = get().user;
        if (!currentUser) return;

        const updatedUser = { ...currentUser, organizerProfile: profile };

        set({ user: updatedUser });

        // Use dot notation to update a nested object field in Firestore.
        await updateUser(currentUser.id, { organizerProfile: profile });
      }
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
