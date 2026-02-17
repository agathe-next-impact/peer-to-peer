import { describe, it, expect, beforeEach } from 'vitest';
import { useEncryptionStore } from '@/stores/encryptionStore';

describe('encryptionStore', () => {
  beforeEach(() => {
    useEncryptionStore.setState({
      derivedKey: null,
      isReady: false,
    });
  });

  it('starts with no key and not ready', () => {
    const state = useEncryptionStore.getState();
    expect(state.derivedKey).toBeNull();
    expect(state.isReady).toBe(false);
  });

  it('setDerivedKey sets key and marks ready', () => {
    // Use a mock CryptoKey-like object
    const mockKey = {} as CryptoKey;
    useEncryptionStore.getState().setDerivedKey(mockKey);

    const state = useEncryptionStore.getState();
    expect(state.derivedKey).toBe(mockKey);
    expect(state.isReady).toBe(true);
  });

  it('clearKey removes key and marks not ready', () => {
    const mockKey = {} as CryptoKey;
    useEncryptionStore.getState().setDerivedKey(mockKey);
    useEncryptionStore.getState().clearKey();

    const state = useEncryptionStore.getState();
    expect(state.derivedKey).toBeNull();
    expect(state.isReady).toBe(false);
  });
});
