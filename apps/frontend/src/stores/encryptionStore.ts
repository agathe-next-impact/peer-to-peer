'use client';

import { create } from 'zustand';

interface EncryptionStore {
  derivedKey: CryptoKey | null;
  isReady: boolean;
  setDerivedKey: (key: CryptoKey) => void;
  clearKey: () => void;
}

export const useEncryptionStore = create<EncryptionStore>((set) => ({
  derivedKey: null,
  isReady: false,

  setDerivedKey: (key) => set({ derivedKey: key, isReady: true }),
  clearKey: () => set({ derivedKey: null, isReady: false }),
}));
