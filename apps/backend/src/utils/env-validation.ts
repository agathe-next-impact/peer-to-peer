import { z } from 'zod';

const envSchema = z.object({
  DATABASE_HOST: z.string().min(1),
  DATABASE_PORT: z.coerce.number().default(5432),
  DATABASE_NAME: z.string().min(1),
  DATABASE_USERNAME: z.string().min(1),
  DATABASE_PASSWORD: z.string().min(1),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET doit contenir au moins 32 caractères'),
  APP_KEYS: z.string().min(1),
  API_TOKEN_SALT: z.string().min(1),
  ADMIN_JWT_SECRET: z.string().min(32),
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().default(587),
});

export function validateEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("Variables d'environnement invalides :");
    console.error(result.error.format());
    process.exit(1);
  }
  return result.data;
}
