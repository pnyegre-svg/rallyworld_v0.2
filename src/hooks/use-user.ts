

import { users } from '@/lib/data';
import type { User, UserRole } from '@/lib/data';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type UserState = {
  user: User;
  signInUser: (email: string, name?: string) => void;
  setRole: (role: UserRole) => void;
};

const defaultUser = {
    id: 'usr_new',
    name: 'Rally Fan',
    email: '',
    avatar: '/avatars/04.png',
    role: 'fan'
} as User;

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: defaultUser,
      signInUser: (email, name) => {
        const currentState = get();
        // If the user logging in is the same as the one in the store, do nothing.
        // This preserves the role chosen after sign-up.
        if (currentState.user && currentState.user.email.toLowerCase() === email.toLowerCase()) {
          return;
        }

        const existingUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (existingUser) {
            set({ user: existingUser });
        } else {
            const newUser: User = {
                id: `usr_${Math.random().toString(36).substr(2, 9)}`,
                name: name || 'New User',
                email: email,
                avatar: `/avatars/${Math.floor(Math.random() * 5) + 1}.png`,
                role: 'fan',
            };
            set({ user: newUser });
        }
      },
      setRole: (role: UserRole) => {
        set((state) => ({
            user: { ...state.user, role }
        }));
      }
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
