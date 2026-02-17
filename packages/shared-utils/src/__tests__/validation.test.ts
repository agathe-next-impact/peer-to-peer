import { describe, it, expect } from 'vitest';
import { backendEnvSchema, frontendEnvSchema } from '../validation';

describe('backendEnvSchema', () => {
  const validEnv = {
    DATABASE_HOST: 'localhost',
    DATABASE_PORT: 5432,
    DATABASE_NAME: 'pairemancipation',
    DATABASE_USERNAME: 'strapi',
    DATABASE_PASSWORD: 'a_very_secure_password_16',
    DATABASE_SSL: false,
    JWT_SECRET: 'a'.repeat(32),
    ADMIN_JWT_SECRET: 'b'.repeat(32),
    APP_KEYS: 'key1,key2,key3,key4',
    API_TOKEN_SALT: 'c'.repeat(16),
    TRANSFER_TOKEN_SALT: 'd'.repeat(16),
    SMTP_HOST: 'smtp.example.com',
    SMTP_PORT: 587,
    PBKDF2_ITERATIONS: 600000,
  };

  it('accepts a valid configuration', () => {
    const result = backendEnvSchema.safeParse(validEnv);
    expect(result.success).toBe(true);
  });

  it('rejects missing DATABASE_HOST', () => {
    const result = backendEnvSchema.safeParse({ ...validEnv, DATABASE_HOST: '' });
    expect(result.success).toBe(false);
  });

  it('rejects weak DATABASE_PASSWORD (< 16 chars)', () => {
    const result = backendEnvSchema.safeParse({ ...validEnv, DATABASE_PASSWORD: 'short' });
    expect(result.success).toBe(false);
  });

  it('rejects weak JWT_SECRET (< 32 chars)', () => {
    const result = backendEnvSchema.safeParse({ ...validEnv, JWT_SECRET: 'short' });
    expect(result.success).toBe(false);
  });

  it('rejects PBKDF2_ITERATIONS below 100000', () => {
    const result = backendEnvSchema.safeParse({ ...validEnv, PBKDF2_ITERATIONS: 1000 });
    expect(result.success).toBe(false);
  });

  it('defaults DATABASE_PORT to 5432', () => {
    const { DATABASE_PORT, ...rest } = validEnv;
    const result = backendEnvSchema.safeParse(rest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.DATABASE_PORT).toBe(5432);
    }
  });

  it('coerces string port to number', () => {
    const result = backendEnvSchema.safeParse({ ...validEnv, DATABASE_PORT: '5433' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.DATABASE_PORT).toBe(5433);
    }
  });
});

describe('frontendEnvSchema', () => {
  it('accepts valid URLs', () => {
    const result = frontendEnvSchema.safeParse({
      NEXT_PUBLIC_STRAPI_URL: 'http://localhost:1337',
      NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid STRAPI_URL', () => {
    const result = frontendEnvSchema.safeParse({
      NEXT_PUBLIC_STRAPI_URL: 'not-a-url',
      NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing SITE_URL', () => {
    const result = frontendEnvSchema.safeParse({
      NEXT_PUBLIC_STRAPI_URL: 'http://localhost:1337',
    });
    expect(result.success).toBe(false);
  });
});
