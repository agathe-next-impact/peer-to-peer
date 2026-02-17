import { z } from 'zod';

// --- Schéma Backend (Strapi) ---
export const backendEnvSchema = z.object({
  DATABASE_HOST: z.string().min(1, 'DATABASE_HOST requis'),
  DATABASE_PORT: z.coerce.number().int().positive().default(5432),
  DATABASE_NAME: z.string().min(1, 'DATABASE_NAME requis'),
  DATABASE_USERNAME: z.string().min(1, 'DATABASE_USERNAME requis'),
  DATABASE_PASSWORD: z.string().min(16, 'DATABASE_PASSWORD — min 16 caractères'),
  DATABASE_SSL: z.coerce.boolean().default(false),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET — min 32 caractères'),
  ADMIN_JWT_SECRET: z.string().min(32),
  APP_KEYS: z.string().min(1, 'APP_KEYS requis (4 clés séparées par virgule)'),
  API_TOKEN_SALT: z.string().min(16),
  TRANSFER_TOKEN_SALT: z.string().min(16),
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  PBKDF2_ITERATIONS: z.coerce.number().int().min(100000).default(600000),
});

// --- Schéma Frontend (Next.js) ---
export const frontendEnvSchema = z.object({
  NEXT_PUBLIC_STRAPI_URL: z.string().url('NEXT_PUBLIC_STRAPI_URL — URL valide requise'),
  NEXT_PUBLIC_SITE_URL: z.string().url('NEXT_PUBLIC_SITE_URL — URL valide requise'),
});

export type BackendEnv = z.infer<typeof backendEnvSchema>;
export type FrontendEnv = z.infer<typeof frontendEnvSchema>;
