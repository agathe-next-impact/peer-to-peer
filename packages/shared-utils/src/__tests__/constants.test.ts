import { describe, it, expect } from 'vitest';
import {
  PASSWORD_MIN_LENGTH,
  PBKDF2_DEFAULT_ITERATIONS,
  ENCRYPTION_KEY_LENGTH,
  INACTIVITY_TIMEOUT_MS,
  MAX_LOGIN_ATTEMPTS,
  MOODS,
  MOOD_EMOJIS,
  GOAL_HORIZONS,
  GOAL_HORIZON_LABELS,
  UPLOAD_MAX_SIZE_IMAGE,
  UPLOAD_MAX_SIZE_PDF,
} from '../constants';

describe('constants', () => {
  it('password must be at least 12 characters (OWASP recommendation)', () => {
    expect(PASSWORD_MIN_LENGTH).toBeGreaterThanOrEqual(12);
  });

  it('PBKDF2 iterations should be at least 600k (OWASP 2023)', () => {
    expect(PBKDF2_DEFAULT_ITERATIONS).toBeGreaterThanOrEqual(600_000);
  });

  it('encryption key length should be 256 bits (AES-256)', () => {
    expect(ENCRYPTION_KEY_LENGTH).toBe(256);
  });

  it('inactivity timeout should be 30 minutes', () => {
    expect(INACTIVITY_TIMEOUT_MS).toBe(30 * 60 * 1000);
  });

  it('max login attempts should limit brute force', () => {
    expect(MAX_LOGIN_ATTEMPTS).toBeLessThanOrEqual(10);
    expect(MAX_LOGIN_ATTEMPTS).toBeGreaterThan(0);
  });

  it('all 5 moods have corresponding emojis', () => {
    expect(MOODS).toHaveLength(5);
    for (const mood of MOODS) {
      expect(MOOD_EMOJIS[mood]).toBeDefined();
      expect(typeof MOOD_EMOJIS[mood]).toBe('string');
    }
  });

  it('all goal horizons have French labels', () => {
    expect(GOAL_HORIZONS).toHaveLength(3);
    for (const horizon of GOAL_HORIZONS) {
      expect(GOAL_HORIZON_LABELS[horizon]).toBeDefined();
    }
  });

  it('upload limits are reasonable', () => {
    expect(UPLOAD_MAX_SIZE_IMAGE).toBe(5 * 1024 * 1024); // 5 Mo
    expect(UPLOAD_MAX_SIZE_PDF).toBe(20 * 1024 * 1024); // 20 Mo
    expect(UPLOAD_MAX_SIZE_PDF).toBeGreaterThan(UPLOAD_MAX_SIZE_IMAGE);
  });
});
