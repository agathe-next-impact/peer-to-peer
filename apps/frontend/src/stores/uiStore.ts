'use client';

import { create } from 'zustand';

interface UIStore {
  sidebarOpen: boolean;
  mobileNavOpen: boolean;
  toggleSidebar: () => void;
  toggleMobileNav: () => void;
  closeMobileNav: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  mobileNavOpen: false,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toggleMobileNav: () => set((state) => ({ mobileNavOpen: !state.mobileNavOpen })),
  closeMobileNav: () => set({ mobileNavOpen: false }),
}));
