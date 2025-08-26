




import { users } from '@/lib/data';
import type { User, UserRole, Organizer } from '@/lib/data';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type UserState = {
  user: User;
  signInUser: (email: string, name?: string) => void;
  setRole: (role: UserRole) => void;
  switchRole: (role: UserRole) => void;
  updateOrganizerProfile: (profile: Organizer) => void;
};

const defaultUser = {
    id: 'usr_new',
    name: 'Rally Fan',
    email: '',
    avatar: '/avatars/04.png',
    roles: ['fan'],
    currentRole: 'fan',
} as User;

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: defaultUser,
      signInUser: (email, name) => {
        const existingUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

        if (existingUser) {
             // Special case for admin to ensure they always have the organizer role
            if (existingUser.email === 'admin@rally.world' && !existingUser.roles.includes('organizer')) {
                existingUser.roles.push('organizer');
                existingUser.currentRole = 'organizer';
            }
            set({ user: existingUser });
        } else {
            const newUser: User = {
                id: `usr_${Math.random().toString(36).substr(2, 9)}`,
                name: name || 'New User',
                email: email,
                avatar: `/avatars/${Math.floor(Math.random() * 5) + 1}.png`,
                roles: ['fan'],
                currentRole: 'fan',
            };
            set({ user: newUser });
        }
      },
      setRole: (role: UserRole) => {
        set((state) => {
            const currentRoles = state.user.roles || [];
            const newRoles = currentRoles.includes(role) ? currentRoles : [...currentRoles, role];
            return {
                user: { ...state.user, roles: newRoles, currentRole: role }
            }
        });
      },
      switchRole: (role: UserRole) => {
        set((state) => ({
            user: { ...state.user, currentRole: role }
        }));
      },
      updateOrganizerProfile: (profile: Organizer) => {
        set((state) => ({
            user: { ...state.user, organizerProfile: profile }
        }))
      }
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
