/**
 * Crypto round-trip tests.
 * Uses Web Crypto API (available in Node 20+ and jsdom via globalThis.crypto).
 */
import { describe, it, expect } from 'vitest';
import {
  generateDataKey,
  encrypt,
  decrypt,
  generateSalt,
  deriveKeyFromPassword,
  wrapKey,
  unwrapKey,
  generateRecoveryCode,
} from '@/lib/crypto';

describe('encrypt/decrypt round-trip', () => {
  it('encrypts and decrypts a simple string', async () => {
    const key = await generateDataKey();
    const plaintext = 'Mon carnet de bord — 2024';

    const encrypted = await encrypt(plaintext, key);
    expect(encrypted).not.toBe(plaintext);
    expect(typeof encrypted).toBe('string');

    const decrypted = await decrypt(encrypted, key);
    expect(decrypted).toBe(plaintext);
  });

  it('encrypts and decrypts UTF-8 (French accents, emojis)', async () => {
    const key = await generateDataKey();
    const plaintext = 'Étape de rétablissement — émotions 😊🎯';

    const encrypted = await encrypt(plaintext, key);
    const decrypted = await decrypt(encrypted, key);
    expect(decrypted).toBe(plaintext);
  });

  it('encrypts and decrypts empty string', async () => {
    const key = await generateDataKey();
    const encrypted = await encrypt('', key);
    const decrypted = await decrypt(encrypted, key);
    expect(decrypted).toBe('');
  });

  it('encrypts and decrypts long text (1KB+)', async () => {
    const key = await generateDataKey();
    const plaintext = 'A'.repeat(2048);

    const encrypted = await encrypt(plaintext, key);
    const decrypted = await decrypt(encrypted, key);
    expect(decrypted).toBe(plaintext);
  });

  it('produces different ciphertext for same input (random IV)', async () => {
    const key = await generateDataKey();
    const plaintext = 'Same input';

    const encrypted1 = await encrypt(plaintext, key);
    const encrypted2 = await encrypt(plaintext, key);

    expect(encrypted1).not.toBe(encrypted2); // different IVs
  });

  it('fails to decrypt with wrong key', async () => {
    const key1 = await generateDataKey();
    const key2 = await generateDataKey();
    const plaintext = 'Secret data';

    const encrypted = await encrypt(plaintext, key1);

    await expect(decrypt(encrypted, key2)).rejects.toThrow();
  });
});

describe('key derivation (PBKDF2)', () => {
  it('derives a key from password and salt', async () => {
    const salt = generateSalt();
    // Use lower iterations for test speed
    const key = await deriveKeyFromPassword('MySecurePassword12!', salt, 1000);
    expect(key).toBeDefined();
    expect(key.type).toBe('secret');
  });

  it('same password + salt = same key', async () => {
    const salt = generateSalt();
    const key1 = await deriveKeyFromPassword('password123!', salt, 1000);
    const key2 = await deriveKeyFromPassword('password123!', salt, 1000);

    // Wrap a test DEK with both keys — should produce equivalent results
    const dek = await generateDataKey();
    const wrapped1 = await wrapKey(dek, key1);
    // Both keys should be able to unwrap
    const unwrapped = await unwrapKey(wrapped1, key2);
    expect(unwrapped).toBeDefined();
  });

  it('different salts produce different keys', async () => {
    const salt1 = generateSalt();
    const salt2 = generateSalt();
    const key1 = await deriveKeyFromPassword('password123!', salt1, 1000);
    const key2 = await deriveKeyFromPassword('password123!', salt2, 1000);

    const dek = await generateDataKey();
    const wrapped = await wrapKey(dek, key1);

    // key2 should NOT be able to unwrap key wrapped by key1
    await expect(unwrapKey(wrapped, key2)).rejects.toThrow();
  });
});

describe('envelope encryption (wrap/unwrap)', () => {
  it('wraps and unwraps a DEK', async () => {
    const salt = generateSalt();
    const kek = await deriveKeyFromPassword('password', salt, 1000);
    const dek = await generateDataKey();

    const wrapped = await wrapKey(dek, kek);
    expect(wrapped.byteLength).toBeGreaterThan(0);

    const unwrapped = await unwrapKey(wrapped, kek);
    expect(unwrapped).toBeDefined();

    // Test that unwrapped key can encrypt/decrypt
    const plaintext = 'Test data';
    const encrypted = await encrypt(plaintext, dek);
    const decrypted = await decrypt(encrypted, unwrapped);
    expect(decrypted).toBe(plaintext);
  });
});

describe('utility functions', () => {
  it('generateSalt returns 16 bytes', () => {
    const salt = generateSalt();
    expect(salt).toBeInstanceOf(Uint8Array);
    expect(salt.length).toBe(16);
  });

  it('generateSalt produces unique values', () => {
    const salt1 = generateSalt();
    const salt2 = generateSalt();
    expect(Array.from(salt1)).not.toEqual(Array.from(salt2));
  });

  it('generateRecoveryCode returns formatted code', () => {
    const code = generateRecoveryCode();
    expect(typeof code).toBe('string');
    const parts = code.split('-');
    expect(parts.length).toBe(12);
    parts.forEach((part) => {
      expect(part).toMatch(/^[0-9a-f]{4}$/);
    });
  });

  it('generateRecoveryCode produces unique codes', () => {
    const code1 = generateRecoveryCode();
    const code2 = generateRecoveryCode();
    expect(code1).not.toBe(code2);
  });
});
