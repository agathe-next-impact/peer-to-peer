/**
 * Module de chiffrement zero-knowledge côté client.
 * Utilise Web Crypto API — la clé ne quitte jamais le navigateur.
 */

import {
  PBKDF2_DEFAULT_ITERATIONS,
  ENCRYPTION_KEY_LENGTH,
} from '@pairemancipation/shared-utils';

const ALGORITHM = 'AES-GCM';
const IV_LENGTH = 12;
const SALT_LENGTH = 16;

/**
 * Dérive une KEK (Key Encryption Key) à partir du mot de passe utilisateur.
 */
export async function deriveKeyFromPassword(
  password: string,
  salt: Uint8Array,
  iterations: number = PBKDF2_DEFAULT_ITERATIONS,
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: ENCRYPTION_KEY_LENGTH },
    false,
    ['wrapKey', 'unwrapKey'],
  );
}

/**
 * Génère une DEK (Data Encryption Key) aléatoire.
 */
export async function generateDataKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: ALGORITHM, length: ENCRYPTION_KEY_LENGTH },
    true,
    ['encrypt', 'decrypt'],
  );
}

/**
 * Wraps (chiffre) la DEK avec la KEK pour stockage en base.
 */
export async function wrapKey(dek: CryptoKey, kek: CryptoKey): Promise<ArrayBuffer> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const wrapped = await crypto.subtle.wrapKey('raw', dek, kek, {
    name: ALGORITHM,
    iv,
  });

  // Concaténer IV + wrapped key
  const result = new Uint8Array(IV_LENGTH + wrapped.byteLength);
  result.set(iv, 0);
  result.set(new Uint8Array(wrapped), IV_LENGTH);
  return result.buffer;
}

/**
 * Unwraps (déchiffre) la DEK avec la KEK.
 */
export async function unwrapKey(
  wrappedKeyWithIv: ArrayBuffer,
  kek: CryptoKey,
): Promise<CryptoKey> {
  const data = new Uint8Array(wrappedKeyWithIv);
  const iv = data.slice(0, IV_LENGTH);
  const wrappedKey = data.slice(IV_LENGTH);

  return crypto.subtle.unwrapKey(
    'raw',
    wrappedKey,
    kek,
    { name: ALGORITHM, iv },
    { name: ALGORITHM, length: ENCRYPTION_KEY_LENGTH },
    false,
    ['encrypt', 'decrypt'],
  );
}

/**
 * Chiffre un texte avec la DEK.
 */
export async function encrypt(plaintext: string, key: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoder.encode(plaintext),
  );

  // Concaténer IV + ciphertext et encoder en base64
  const result = new Uint8Array(IV_LENGTH + encrypted.byteLength);
  result.set(iv, 0);
  result.set(new Uint8Array(encrypted), IV_LENGTH);
  return btoa(String.fromCharCode(...result));
}

/**
 * Déchiffre un texte avec la DEK.
 */
export async function decrypt(ciphertext: string, key: CryptoKey): Promise<string> {
  const data = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));
  const iv = data.slice(0, IV_LENGTH);
  const encrypted = data.slice(IV_LENGTH);

  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    encrypted,
  );

  return new TextDecoder().decode(decrypted);
}

/**
 * Génère un sel aléatoire.
 */
export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
}

/**
 * Génère un code de récupération de 12 mots.
 */
export function generateRecoveryCode(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .match(/.{1,4}/g)!
    .slice(0, 12)
    .join('-');
}
