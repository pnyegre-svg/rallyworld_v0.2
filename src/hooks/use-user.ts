import { users } from '@/lib/data';
import type { User } from '@/lib/data';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type UserState = {
  user: User;
  setUser: (user: User) => void;
  setRole: (role: User['role']) => void;
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: users.find(u => u.role === 'organizer')!,
      setUser: (user) => set({ user }),
      setRole: (role) =>
        set((state) => {
          const newUser = users.find((u) => u.role === role);
          return { user: newUser || state.user };
        }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
