# Étape 5 — Guide de Configuration Technique & Setup du Projet

> Ce document fait le pont entre les spécifications d'architecture (Étapes 1-4) et l'implémentation concrète. Il correspond aux tâches de la **Phase 0 — Fondations** (Semaines 1-3) de la roadmap MVP (cf. Étape 4).

---

## 1. Stack Technique Exacte

### 1.1 Backend

| Catégorie | Package | Version | Justification | Réf. |
|-----------|---------|---------|---------------|------|
| **CMS / API** | Strapi | 4.25.x | Headless CMS, Content-Types API, users-permissions, TypeScript | Étape 1 |
| **Runtime** | Node.js | 20 LTS (Hydrogen) | Support LTS jusqu'en avril 2026, compatibilité Strapi 4 | — |
| **Base de données** | PostgreSQL | 16.x | Schemas multiples (`public` + `private_health`), JSONB, performances | Étape 1 |
| **ORM** | Knex.js | (inclus Strapi) | Query builder, requêtes paramétrées, protection injection SQL | Étape 3, S-02 |
| **Gestionnaire de paquets** | npm | 10.x | Workspaces natifs, lockfile v3, inclus avec Node 20 | — |
| **Email** | @strapi/provider-email-nodemailer | 4.25.x | Envoi SMTP configurable (Mailhog en dev, SMTP réel en prod) | Étape 3, A-04 |
| **Upload** | @strapi/provider-upload-local | 4.25.x | Local en dev ; provider S3-compatible en prod (hébergeur HDS) | Étape 3, S-06 |
| **Rate limiting** | koa2-ratelimit | 5.x | Protection brute force (5 tentatives / 15 min) | Étape 3, A-03 |
| **Validation env** | zod | 3.23.x | Validation des variables d'environnement au démarrage | Étape 3, D-04 |
| **Logging** | winston | 3.x | Logs structurés JSON, niveaux, rotation | Étape 3, L-01 à L-07 |

### 1.2 Frontend

| Catégorie | Package | Version | Justification | Réf. |
|-----------|---------|---------|---------------|------|
| **Framework** | next | 14.2.x | App Router, Server Components, ISR, Image Optimization | Étape 2 |
| **React** | react / react-dom | 18.3.x | Compatible Next.js 14, Server Components | Étape 2 |
| **TypeScript** | typescript | 5.5.x | Strict mode, type-safe | Étape 2 |
| **CSS** | tailwindcss | 3.4.x | Utility-first, tree-shaking, thème personnalisable | Étape 2 |
| **UI Kit** | shadcn/ui (composants copiés) | latest (CLI) | Radix primitives, accessibilité ARIA native, pas de vendor lock-in | Étape 2 |
| **Formulaires** | react-hook-form | 7.53.x | Performant, uncontrolled, intégration Zod | Étape 2 |
| **Validation** | @hookform/resolvers + zod | 3.9.x / 3.23.x | Validation type-safe des formulaires | Étape 2 |
| **État global** | zustand | 4.5.x | Léger, pas de boilerplate, compatible RSC | Étape 2 |
| **Fetching** | @tanstack/react-query | 5.59.x | Cache, revalidation, optimistic updates | Étape 2 |
| **Graphiques** | recharts | 2.13.x | Déclaratif, basé D3, bonne a11y | Étape 2 |
| **Cartographie** | react-leaflet + leaflet | 4.2.x / 1.9.x | RGPD-friendly (OSM), gratuit | Étape 2 |
| **Cluster carte** | react-leaflet-cluster | 2.1.x | Regroupement marqueurs par zoom | Étape 2 |
| **Calendrier** | @fullcalendar/react + plugins | 6.1.x | Vue mois/semaine/jour, drag & drop | Étape 2 |
| **Dates** | date-fns | 3.6.x | Tree-shakable, locale FR, léger | Étape 2 |
| **Icônes** | lucide-react | 0.441.x | Cohérent avec shadcn/ui | Étape 2 |
| **PDF** | @react-pdf/renderer | 3.4.x | Génération PDF côté client | Étape 2 |
| **Sanitisation** | dompurify + @types/dompurify | 3.1.x | Sanitiser Rich Text Strapi avant rendu | Étape 3, S-01 |

### 1.3 Outils de Développement & Infrastructure

| Catégorie | Outil | Version | Rôle |
|-----------|-------|---------|------|
| **Monorepo** | Turborepo | 2.1.x | Orchestration builds, cache, parallélisation |
| **Conteneurisation** | Docker | 27.x | Conteneurs dev et prod |
| **Orchestration locale** | Docker Compose | 2.29.x | Environnement dev complet |
| **Linting** | eslint | 8.57.x | Analyse statique du code |
| **Formatage** | prettier | 3.3.x | Formatage uniforme |
| **Tests unitaires** | vitest | 2.1.x | Rapide, compatible ESM, TypeScript natif |
| **Tests E2E** | playwright | 1.48.x | Tests navigateur multi-browser |
| **CI/CD** | GitHub Actions | — | Pipelines CI/CD |
| **Scan sécurité** | trivy | latest | Scan images Docker + filesystem |
| **Dépendances** | renovate ou dependabot | — | Mises à jour automatiques |
| **Commit conventions** | commitlint + husky | 19.x / 9.x | Conventional Commits enforced |
| **Email (dev)** | Mailhog | latest (Docker) | Capture emails en développement |

---

## 2. Structure du Monorepo

### 2.1 Arborescence racine

```
pairemancipation/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                    # Pipeline CI (lint, typecheck, test, audit)
│   │   ├── cd-staging.yml            # Déploiement staging
│   │   └── cd-production.yml         # Déploiement production
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── ISSUE_TEMPLATE/
│       ├── bug_report.md
│       └── feature_request.md
├── apps/
│   ├── backend/                      # Strapi 4 (API)
│   │   ├── src/
│   │   │   ├── api/                  # Content-Types (cf. Étape 1)
│   │   │   ├── components/           # Composants Strapi (shared, location, etc.)
│   │   │   ├── middlewares/          # is-owner, audit-log, rate-limit
│   │   │   ├── policies/            # Policies custom (is-authenticated, etc.)
│   │   │   ├── extensions/          # Override plugins Strapi
│   │   │   └── utils/               # Helpers (env-validation, etc.)
│   │   ├── config/
│   │   │   ├── database.ts           # Config PostgreSQL (schemas)
│   │   │   ├── middlewares.ts        # Stack middleware Strapi
│   │   │   ├── plugins.ts           # Plugins activés
│   │   │   ├── server.ts            # Config serveur
│   │   │   └── env/
│   │   │       ├── development/
│   │   │       └── production/
│   │   ├── database/
│   │   │   ├── migrations/          # Scripts migration SQL
│   │   │   └── seeds/               # Données fictives (dev)
│   │   ├── Dockerfile
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── frontend/                     # Next.js 14 (cf. Étape 2 pour la structure src/)
│       ├── src/                      # Structure exacte définie en Étape 2
│       ├── public/
│       ├── next.config.js
│       ├── tailwind.config.ts
│       ├── postcss.config.js
│       ├── components.json           # shadcn/ui config
│       ├── Dockerfile
│       ├── tsconfig.json
│       └── package.json
├── packages/
│   ├── shared-types/                 # Types TypeScript partagés (cf. Étape 2, types/)
│   │   ├── src/
│   │   │   ├── api.ts
│   │   │   ├── blog.ts
│   │   │   ├── directory.ts
│   │   │   ├── event.ts
│   │   │   ├── member.ts
│   │   │   ├── notebook.ts
│   │   │   ├── goal.ts
│   │   │   ├── assessment.ts
│   │   │   ├── document.ts
│   │   │   ├── calendar.ts
│   │   │   ├── recovery.ts
│   │   │   ├── auth.ts
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   ├── shared-utils/                 # Utilitaires partagés
│   │   ├── src/
│   │   │   ├── validation.ts         # Schémas Zod partagés (env, forms)
│   │   │   ├── constants.ts          # Constantes métier
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── eslint-config/               # Config ESLint partagée
│       ├── base.js
│       ├── next.js
│       ├── strapi.js
│       └── package.json
├── docker/
│   ├── docker-compose.yml            # Environnement dev complet
│   ├── docker-compose.prod.yml       # Override production
│   ├── postgres/
│   │   └── init-scripts/
│   │       └── 01-init-schemas.sql   # Création schema private_health
│   └── nginx/
│       └── nginx.conf                # Reverse proxy (prod)
├── docs/
│   └── architecture/
│       ├── 01-data-modeling.md
│       ├── 02-component-architecture.md
│       ├── 03-security-hds-checklist.md
│       ├── 04-mvp-roadmap.md
│       └── 05-technical-setup-guide.md  # CE DOCUMENT
├── .env.example
├── .gitignore
├── .prettierrc
├── .commitlintrc.js
├── turbo.json                        # Config Turborepo
├── package.json                      # Root workspace
├── package-lock.json
└── README.md
```

### 2.2 Configuration Turborepo

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [".env"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "build/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"]
    }
  }
}
```

### 2.3 Configuration npm Workspaces (`package.json` racine)

```json
{
  "name": "pairemancipation",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "typecheck": "turbo typecheck",
    "test": "turbo test",
    "format": "prettier --write \"**/*.{ts,tsx,js,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,json,md}\"",
    "prepare": "husky"
  },
  "devDependencies": {
    "turbo": "^2.1.0",
    "prettier": "^3.3.0",
    "prettier-plugin-tailwindcss": "^0.6.0",
    "husky": "^9.0.0",
    "@commitlint/cli": "^19.0.0",
    "@commitlint/config-conventional": "^19.0.0"
  }
}
```

### 2.4 Package partagé : `shared-types`

Ce package exporte tous les types/interfaces TypeScript de l'Étape 2 (`types/`), consommés à la fois par `apps/backend` et `apps/frontend`.

```json
{
  "name": "@pairemancipation/shared-types",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.5.0"
  }
}
```

### 2.5 Package partagé : `shared-utils`

```json
{
  "name": "@pairemancipation/shared-utils",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "dependencies": {
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "typescript": "^5.5.0"
  }
}
```

---

## 3. Docker Compose — Environnement de Développement Local

### 3.1 Architecture des services

```
┌──────────────────────────────────────────────────────────────┐
│                   docker-compose.yml (dev)                     │
│                                                                │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌─────────┐│
│  │ PostgreSQL │  │   Strapi   │  │  Next.js   │  │ Mailhog ││
│  │   :5432    │  │   :1337    │  │   :3000    │  │  :8025  ││
│  │            │  │            │  │            │  │  :1025  ││
│  └─────┬──────┘  └─────┬──────┘  └────────────┘  └─────────┘│
│        │               │                                      │
│        │   schemas:    │                                      │
│        │   - public    │                                      │
│        │   - private   │                                      │
│        │     _health   │                                      │
│        └───────────────┘                                      │
│                                                                │
│  Volumes: pgdata, strapi-uploads                              │
└──────────────────────────────────────────────────────────────┘
```

### 3.2 Fichier `docker-compose.yml`

```yaml
version: "3.9"

services:
  postgres:
    image: postgres:16-alpine
    container_name: pairemancipation-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: pairemancipation
      POSTGRES_USER: strapi_user
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD:-strapi_local_password}
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./docker/postgres/init-scripts:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U strapi_user -d pairemancipation"]
      interval: 10s
      timeout: 5s
      retries: 5

  strapi:
    build:
      context: ./apps/backend
      dockerfile: Dockerfile
      target: development
    container_name: pairemancipation-api
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DATABASE_HOST: postgres
      DATABASE_PORT: 5432
      DATABASE_NAME: pairemancipation
      DATABASE_USERNAME: strapi_user
      DATABASE_PASSWORD: ${DATABASE_PASSWORD:-strapi_local_password}
      JWT_SECRET: ${JWT_SECRET:-dev-jwt-secret-minimum-32-characters-long!!}
      APP_KEYS: ${APP_KEYS:-devKey1Base64aa,devKey2Base64bb,devKey3Base64cc,devKey4Base64dd}
      API_TOKEN_SALT: ${API_TOKEN_SALT:-dev-api-token-salt-value-here}
      ADMIN_JWT_SECRET: ${ADMIN_JWT_SECRET:-dev-admin-jwt-secret-32-chars-min!!}
      TRANSFER_TOKEN_SALT: ${TRANSFER_TOKEN_SALT:-dev-transfer-salt-value}
      SMTP_HOST: mailhog
      SMTP_PORT: 1025
      SMTP_USERNAME: ""
      SMTP_PASSWORD: ""
    ports:
      - "1337:1337"
    volumes:
      - ./apps/backend:/srv/app
      - backend_node_modules:/srv/app/node_modules
      - strapi_uploads:/srv/app/public/uploads

  frontend:
    build:
      context: ./apps/frontend
      dockerfile: Dockerfile
      target: development
    container_name: pairemancipation-front
    restart: unless-stopped
    depends_on:
      - strapi
    environment:
      NEXT_PUBLIC_STRAPI_URL: http://localhost:1337
      NEXT_PUBLIC_SITE_URL: http://localhost:3000
    ports:
      - "3000:3000"
    volumes:
      - ./apps/frontend:/srv/app
      - frontend_node_modules:/srv/app/node_modules

  mailhog:
    image: mailhog/mailhog:latest
    container_name: pairemancipation-mail
    ports:
      - "1025:1025"
      - "8025:8025"
    restart: unless-stopped

volumes:
  pgdata:
  backend_node_modules:
  frontend_node_modules:
  strapi_uploads:
```

### 3.3 Script d'initialisation PostgreSQL

Fichier : `docker/postgres/init-scripts/01-init-schemas.sql`

```sql
-- Étape 5, Section 3.3 — Initialisation PostgreSQL
-- Réf. Étape 1 (schéma privé) et Étape 3, C-08

-- 1. Schéma dédié aux données de santé
CREATE SCHEMA IF NOT EXISTS private_health;

-- 2. Extensions utiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 3. Permissions
GRANT USAGE ON SCHEMA private_health TO strapi_user;
GRANT CREATE ON SCHEMA private_health TO strapi_user;
REVOKE ALL ON SCHEMA private_health FROM PUBLIC;

-- 4. Search path par défaut
ALTER ROLE strapi_user SET search_path TO public, private_health;

-- 5. Documentation
COMMENT ON SCHEMA private_health IS
  'Schéma isolé pour les données de santé (HDS). Accès restreint au service applicatif.';
```

### 3.4 Dockerfiles

**Dockerfile Strapi** (`apps/backend/Dockerfile`) :

```dockerfile
# --- Development ---
FROM node:20-alpine AS development
WORKDIR /srv/app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
CMD ["npm", "run", "develop"]

# --- Build ---
FROM node:20-alpine AS build
WORKDIR /srv/app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Production ---
FROM node:20-alpine AS production
WORKDIR /srv/app
ENV NODE_ENV=production
COPY --from=build /srv/app ./
RUN npm ci --omit=dev
EXPOSE 1337
CMD ["npm", "start"]
```

**Dockerfile Next.js** (`apps/frontend/Dockerfile`) :

```dockerfile
# --- Development ---
FROM node:20-alpine AS development
WORKDIR /srv/app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
CMD ["npm", "run", "dev"]

# --- Build ---
FROM node:20-alpine AS build
WORKDIR /srv/app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Production ---
FROM node:20-alpine AS production
WORKDIR /srv/app
ENV NODE_ENV=production
COPY --from=build /srv/app/.next ./.next
COPY --from=build /srv/app/public ./public
COPY --from=build /srv/app/package.json ./
COPY --from=build /srv/app/node_modules ./node_modules
COPY --from=build /srv/app/next.config.js ./
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 4. Configuration Strapi

### 4.1 Plugins activés

| Plugin | Package | Rôle | Réf. |
|--------|---------|------|------|
| Users & Permissions | `@strapi/plugin-users-permissions` (inclus) | Authentification, rôles, JWT | Étape 3, §1 |
| Upload | `@strapi/plugin-upload` (inclus) | Gestion des médias (images, PDF) | Étape 3, S-06 à S-10 |
| Email | `@strapi/plugin-email` + `@strapi/provider-email-nodemailer` | Envoi emails (confirmation, reset) | Étape 3, A-04/A-05 |
| i18n | `@strapi/plugin-i18n` (inclus) | Internationalisation (locale fr) | — |
| SEO | `@strapi/plugin-seo` | Composant SEO pour les Content-Types | Étape 2 |

### 4.2 `config/plugins.ts`

```typescript
export default ({ env }) => ({
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('SMTP_HOST', 'localhost'),
        port: env.int('SMTP_PORT', 1025),
        auth: {
          user: env('SMTP_USERNAME', ''),
          pass: env('SMTP_PASSWORD', ''),
        },
      },
      settings: {
        defaultFrom: 'noreply@pairemancipation.fr',
        defaultReplyTo: 'contact@pairemancipation.fr',
      },
    },
  },
  upload: {
    config: {
      sizeLimit: 5 * 1024 * 1024, // 5 Mo (cf. Étape 3, S-07)
      breakpoints: {
        xlarge: 1920,
        large: 1000,
        medium: 750,
        small: 500,
      },
    },
  },
  'users-permissions': {
    config: {
      jwt: {
        expiresIn: '15m', // cf. Étape 3, A-07
      },
      register: {
        allowedFields: ['displayName'],
      },
    },
  },
});
```

### 4.3 `config/middlewares.ts`

```typescript
export default [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'https://*.tile.openstreetmap.org',
          ],
          'media-src': ["'self'", 'data:', 'blob:'],
          upgradeInsecureRequests: null, // Désactivé en dev
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      origin: [
        'http://localhost:3000',        // Dev frontend
        'https://pairemancipation.fr',  // Production
        'https://staging.pairemancipation.fr',
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      headers: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
      keepHeaderOnError: true,
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
```

### 4.4 `config/database.ts`

```typescript
export default ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env('DATABASE_HOST', '127.0.0.1'),
      port: env.int('DATABASE_PORT', 5432),
      database: env('DATABASE_NAME', 'pairemancipation'),
      user: env('DATABASE_USERNAME', 'strapi_user'),
      password: env('DATABASE_PASSWORD', ''),
      ssl: env.bool('DATABASE_SSL', false)
        ? { rejectUnauthorized: false }
        : false,
      schema: env('DATABASE_SCHEMA', 'public'),
    },
    pool: {
      min: env.int('DATABASE_POOL_MIN', 2),
      max: env.int('DATABASE_POOL_MAX', 10),
    },
    debug: false,
  },
});
```

> **Note** : Les Content-Types de la zone privée utiliseront une configuration Knex personnalisée ou un lifecycle hook Strapi pour cibler le schéma `private_health` (cf. Étape 1, stratégie de chiffrement).

### 4.5 Validation des variables d'environnement au démarrage

Fichier : `apps/backend/src/utils/env-validation.ts`

```typescript
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
```

> Réf. Étape 3, D-04 : « Secrets hors du code. Validation au démarrage via Zod. »

---

## 5. Configuration Next.js

### 5.1 `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Mode strict React
  reactStrictMode: true,

  // Sortie standalone pour Docker
  output: 'standalone',

  // Configuration images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.pairemancipation.fr',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Headers de sécurité (cf. Étape 3, §4.2)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '0' },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://*.tile.openstreetmap.org",
              "font-src 'self'",
              `connect-src 'self' ${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}`,
              "frame-src 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },

  // Rewrites pour proxy API en dev (évite les CORS)
  async rewrites() {
    return [
      {
        source: '/api/strapi/:path*',
        destination: `${
          process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'
        }/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
```

> **Note** : `unsafe-eval` est nécessaire en mode dev Next.js. En production, le CSP devrait être durci via une variable d'environnement conditionnelle.

### 5.2 Configuration Tailwind CSS

Fichier : `apps/frontend/tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Palette Pairémancipation
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6', // Couleur principale
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        accent: {
          500: '#10b981', // Vert — santé, bien-être
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),     // Animations pour shadcn/ui
    require('@tailwindcss/typography'), // Prose pour le Rich Text Strapi
  ],
};

export default config;
```

### 5.3 Initialisation shadcn/ui

Fichier : `apps/frontend/components.json`

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/styles/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

**Composants shadcn/ui à installer pour le MVP** (réf. Étape 2) :

| Composant | Utilisation dans Pairémancipation |
|-----------|-----------------------------------|
| `button` | CTAs, actions, formulaires |
| `card` | ArticleCard, StructureCard, GoalCard, DashboardWidget |
| `dialog` | Modales (confirmation, détails) |
| `dropdown-menu` | TopBar actions, filtres |
| `form` | Wrapper React Hook Form |
| `input` | Champs texte |
| `label` | Labels formulaires |
| `select` | Selects (catégorie, type) |
| `textarea` | Notes carnet, descriptions |
| `badge` | ContributionStatusBadge, ScoreBadge |
| `tabs` | GoalHorizonTabs, filtres |
| `popover` | CalendarEventPopover |
| `skeleton` | Loading states (DashboardWidget) |
| `toast` | Notifications (succès, erreur) |
| `avatar` | Profil contributeur |
| `separator` | Séparation visuelle |
| `sheet` | MobileNav (sidebar mobile) |
| `progress` | GoalProgressBar |
| `switch` | Paramètres (toggles) |
| `command` | SearchBar (command palette) |

**Commande d'installation groupée :**

```bash
cd apps/frontend
npx shadcn-ui@latest add button card dialog dropdown-menu form input label \
  select textarea badge tabs popover skeleton toast avatar separator sheet \
  progress switch command
```

### 5.4 Path aliases (`tsconfig.json`)

Fichier : `apps/frontend/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/stores/*": ["./src/stores/*"],
      "@/types/*": ["./src/types/*"],
      "@/styles/*": ["./src/styles/*"],
      "@pairemancipation/shared-types": ["../../packages/shared-types/src"],
      "@pairemancipation/shared-utils": ["../../packages/shared-utils/src"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## 6. Pipeline CI/CD (GitHub Actions)

### 6.1 Vue d'ensemble

```
┌───────────────┐     ┌───────────────────────────────────────┐     ┌──────────────┐
│  Pull Request │     │            CI Pipeline                │     │   Merge      │
│               │ ──► │                                       │ ──► │   autorisé   │
│               │     │  ┌────────┐  ┌───────────┐           │     └──────┬───────┘
│               │     │  │  Lint  │  │ Typecheck │           │            │
│               │     │  └───┬────┘  └─────┬─────┘           │     ┌──────▼───────┐
│               │     │      │             │                  │     │  CD Pipeline │
│               │     │  ┌───▼─────────────▼────┐            │     │              │
│               │     │  │   Tests unitaires    │            │     │  Push main   │
│               │     │  └──────────┬───────────┘            │     │  → Staging   │
│               │     │             │                         │     │              │
│               │     │  ┌──────────▼───────────┐            │     │  Tag v*.*.*  │
│               │     │  │  npm audit + Trivy   │            │     │  → Prod      │
│               │     │  └──────────────────────┘            │     └──────────────┘
│               │     └───────────────────────────────────────┘
└───────────────┘
```

### 6.2 Workflow CI (`.github/workflows/ci.yml`)

```yaml
name: CI

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint-and-typecheck:
    name: Lint & Typecheck
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run format:check

  test:
    name: Tests
    runs-on: ubuntu-latest
    needs: lint-and-typecheck
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: pairemancipation_test
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_password
        ports:
          - 5432:5432
        options: >-
          --health-cmd="pg_isready -U test_user"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run test
        env:
          DATABASE_HOST: localhost
          DATABASE_PORT: 5432
          DATABASE_NAME: pairemancipation_test
          DATABASE_USERNAME: test_user
          DATABASE_PASSWORD: test_password

  security-audit:
    name: Security Audit
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm audit --audit-level=high
      - name: Trivy filesystem scan
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          severity: 'CRITICAL,HIGH'
          exit-code: '1'
```

> Réf. Étape 3, D-01 (ESLint sécurité), D-02 (npm audit), D-07 (secrets CI), D-08 (Trivy).

### 6.3 Workflow CD Staging (`.github/workflows/cd-staging.yml`)

```yaml
name: CD Staging

on:
  push:
    branches: [main]

jobs:
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run build

      - name: Build Docker images
        run: |
          docker build -t pairemancipation-api:staging ./apps/backend --target production
          docker build -t pairemancipation-front:staging ./apps/frontend --target production

      - name: Trivy scan images
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'pairemancipation-api:staging'
          severity: 'CRITICAL'
          exit-code: '1'

      - name: Deploy to HDS hosting
        run: |
          # Déploiement spécifique à l'hébergeur HDS choisi
          # SSH + docker-compose, ou push vers registry privé
          echo "Déploiement vers ${{ secrets.STAGING_HOST }}"
        env:
          DEPLOY_KEY: ${{ secrets.STAGING_DEPLOY_KEY }}
```

> Le workflow de production (`cd-production.yml`) sera déclenché par les tags `v*.*.*` et suivra la même structure avec des smoke tests post-déploiement.

### 6.4 Matrice des pipelines

| Pipeline | Déclencheur | Étapes | Bloquant pour merge |
|----------|-------------|--------|---------------------|
| **CI** | PR vers `main`/`develop` | Lint, Typecheck, Format, Tests, npm audit, Trivy FS | Oui |
| **CD Staging** | Push sur `main` | Build, Docker build, Trivy images, Deploy staging | Non (post-merge) |
| **CD Production** | Tag `v*.*.*` | Build, Docker build, Trivy images, Deploy prod, Smoke tests | — |

---

## 7. Variables d'Environnement

### 7.1 Template `.env.example` (racine)

```bash
# ============================================================
# Pairémancipation — Variables d'environnement
# Copier ce fichier vers .env et remplir les valeurs
# NE JAMAIS COMMITER le fichier .env (cf. Étape 3, D-04)
# ============================================================

# --- PostgreSQL ---
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=pairemancipation
DATABASE_USERNAME=strapi_user
DATABASE_PASSWORD=                    # OBLIGATOIRE — min 32 caractères aléatoires
DATABASE_SSL=false                     # true en production
DATABASE_SCHEMA=public

# --- Strapi ---
STRAPI_HOST=0.0.0.0
STRAPI_PORT=1337
STRAPI_URL=http://localhost:1337      # URL publique de l'API

# --- Secrets Strapi ---
APP_KEYS=                             # OBLIGATOIRE — 4 clés séparées par des virgules
JWT_SECRET=                           # OBLIGATOIRE — min 64 caractères aléatoires
ADMIN_JWT_SECRET=                     # OBLIGATOIRE — min 64 caractères aléatoires
API_TOKEN_SALT=                       # OBLIGATOIRE — min 32 caractères aléatoires
TRANSFER_TOKEN_SALT=                  # OBLIGATOIRE — min 32 caractères aléatoires

# --- JWT (Tokens utilisateurs) ---
JWT_EXPIRATION=15m                    # Durée access token (cf. Étape 3, A-07)
REFRESH_TOKEN_EXPIRATION=7d           # Durée refresh token (cf. Étape 3, A-07)

# --- Chiffrement (Zone Privée) ---
PBKDF2_ITERATIONS=600000             # Itérations PBKDF2 (cf. Étape 3, C-05)
ENCRYPTION_ALGORITHM=aes-256-gcm     # Algorithme (cf. Étape 3, C-04)

# --- Email (SMTP) ---
SMTP_HOST=localhost                   # Mailhog en dev, SMTP réel en prod
SMTP_PORT=1025                        # 1025 (Mailhog) ou 587 (production)
SMTP_USERNAME=
SMTP_PASSWORD=                        # Secret en production

# --- Next.js (Frontend) ---
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# --- Google Calendar (Optionnel, post-MVP) ---
# GOOGLE_CALENDAR_CLIENT_ID=
# GOOGLE_CALENDAR_CLIENT_SECRET=      # Secret
```

### 7.2 Schémas de validation Zod

Fichier : `packages/shared-utils/src/validation.ts`

```typescript
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
```

### 7.3 Tableau récapitulatif des secrets

| Variable | Sensible | Environnements | Comment générer |
|----------|----------|----------------|-----------------|
| `DATABASE_PASSWORD` | Oui | Dev, Staging, Prod | `openssl rand -base64 32` |
| `JWT_SECRET` | Oui | Dev, Staging, Prod | `openssl rand -base64 64` |
| `ADMIN_JWT_SECRET` | Oui | Dev, Staging, Prod | `openssl rand -base64 64` |
| `APP_KEYS` | Oui | Dev, Staging, Prod | 4x `openssl rand -base64 16` séparés par `,` |
| `API_TOKEN_SALT` | Oui | Dev, Staging, Prod | `openssl rand -base64 32` |
| `TRANSFER_TOKEN_SALT` | Oui | Dev, Staging, Prod | `openssl rand -base64 32` |
| `SMTP_PASSWORD` | Oui | Prod uniquement | Fourni par le service SMTP |
| `GOOGLE_CALENDAR_CLIENT_SECRET` | Oui | Prod (post-MVP) | Console Google Cloud |

> Réf. Étape 3, D-04 et D-07 — tous les secrets injectés via GitHub Secrets en CI/CD, jamais en clair dans le code.

---

## 8. Configuration Base de Données

### 8.1 Architecture des schémas PostgreSQL

```
┌───────────────────────────────────────────────────────────────┐
│                       PostgreSQL 16                            │
│                                                                │
│  ┌───────────────────────────┐  ┌────────────────────────────┐│
│  │    Schéma : public        │  │  Schéma : private_health   ││
│  │                           │  │                            ││
│  │  blog_articles            │  │  personal_notebooks        ││
│  │  blog_categories          │  │  personal_goals            ││
│  │  tags                     │  │  self_assessments          ││
│  │  knowledge_base_entries   │  │  generated_documents       ││
│  │  knowledge_categories     │  │  personal_calendar_events  ││
│  │  tutorials                │  │  recovery_profiles         ││
│  │  structures               │  │  recovery_recommendations  ││
│  │  service_types            │  │                            ││
│  │  events                   │  │  [Chiffrement AES-256-GCM  ││
│  │  news_items               │  │   sur les champs marqués   ││
│  │  contributor_profiles     │  │   🔒 — cf. Étape 1]        ││
│  │  contributions            │  │                            ││
│  │  assessment_templates     │  └────────────────────────────┘│
│  │  document_templates       │                                │
│  │  homepage (single)        │  Accès : strapi_user           │
│  │  about_page (single)      │  REVOKE ALL FROM PUBLIC        │
│  │  platform_settings        │                                │
│  │                           │                                │
│  │  up_users (Strapi)        │                                │
│  │  up_roles (Strapi)        │                                │
│  │  up_permissions (Strapi)  │                                │
│  │  strapi_* (interne)       │                                │
│  └───────────────────────────┘                                │
└───────────────────────────────────────────────────────────────┘
```

### 8.2 Script d'initialisation complet

Fichier : `docker/postgres/init-scripts/01-init-schemas.sql`

```sql
-- Réf. Étape 1 (stratégie de chiffrement, schémas)
-- Réf. Étape 3, C-08 (TDE), R-01 (isolation)

-- 1. Schéma privé pour données de santé
CREATE SCHEMA IF NOT EXISTS private_health;

-- 2. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 3. Permissions
GRANT USAGE ON SCHEMA private_health TO strapi_user;
GRANT CREATE ON SCHEMA private_health TO strapi_user;
REVOKE ALL ON SCHEMA private_health FROM PUBLIC;

-- 4. Search path par défaut
ALTER ROLE strapi_user SET search_path TO public, private_health;

-- 5. Documentation
COMMENT ON SCHEMA private_health IS
  'Schéma isolé pour les données de santé (HDS). Accès restreint.';

-- 6. Index de performance (à exécuter après création des tables par Strapi)
-- CREATE INDEX idx_personal_notebook_owner
--   ON private_health.personal_notebooks(owner);
-- CREATE INDEX idx_personal_goal_owner
--   ON private_health.personal_goals(owner);
-- CREATE INDEX idx_self_assessment_owner
--   ON private_health.self_assessments(owner);
-- CREATE INDEX idx_blog_article_slug
--   ON public.blog_articles(slug);
-- CREATE INDEX idx_structure_type
--   ON public.structures(type);
```

### 8.3 Stratégie de migration

| Outil | Usage | Justification |
|-------|-------|---------------|
| Strapi auto-migration | Schéma applicatif (Content-Types) | Strapi gère les migrations automatiquement au démarrage |
| Scripts SQL manuels | Schéma `private_health`, indexes, permissions | Contrôle précis, auditable, versionné dans `database/migrations/` |
| Convention de nommage | `YYYY-MM-DD-description.sql` | Ex : `2025-01-15-create-private-health-schema.sql` |

> Strapi 4 synchronise son propre schéma. Les scripts SQL manuels ne servent qu'aux opérations de niveau schéma (création `private_health`, permissions, indexes).

### 8.4 Stratégie de backup

| Élément | Fréquence | Méthode | Rétention | Réf. |
|---------|-----------|---------|-----------|------|
| Base PostgreSQL complète | Quotidien, 02h00 | `pg_dump --format=custom` | 30 jours | Étape 4, 3.3.6 |
| Schéma `private_health` seul | Quotidien, 02h00 | `pg_dump --schema=private_health` | 90 jours | Étape 3, HDS |
| Fichiers uploads (media) | Quotidien | Rsync / S3 sync | 30 jours | — |
| Test de restauration | Mensuel | Restauration sur environnement de test | — | Étape 4, 3.3.6 |

**Script de backup :**

```bash
#!/bin/bash
# backup-db.sh — Sauvegarde quotidienne PostgreSQL
DATE=$(date +%Y-%m-%d)
BACKUP_DIR="/backups/postgresql"

# Backup complet
pg_dump -h "$DATABASE_HOST" -U "$DATABASE_USERNAME" \
  --format=custom \
  --file="${BACKUP_DIR}/full-${DATE}.dump" \
  "$DATABASE_NAME"

# Backup schéma privé uniquement
pg_dump -h "$DATABASE_HOST" -U "$DATABASE_USERNAME" \
  --schema=private_health \
  --format=custom \
  --file="${BACKUP_DIR}/private-health-${DATE}.dump" \
  "$DATABASE_NAME"

# Rétention : supprimer les backups anciens
find "$BACKUP_DIR" -name "full-*.dump" -mtime +30 -delete
find "$BACKUP_DIR" -name "private-health-*.dump" -mtime +90 -delete
```

---

## 9. Workflow de Développement Local

### 9.1 Prérequis

| Outil | Version minimale | Installation |
|-------|-----------------|-------------|
| Node.js | 20.x LTS | nvm ou nodejs.org |
| npm | 10.x | Inclus avec Node.js 20 |
| Docker | 27.x | docker.com |
| Docker Compose | 2.29.x | Inclus avec Docker Desktop |
| Git | 2.40+ | git-scm.com |

### 9.2 Guide « Getting Started »

```bash
# 1. Cloner le dépôt
git clone https://github.com/pairemancipation/pairemancipation.git
cd pairemancipation

# 2. Copier les variables d'environnement
cp .env.example .env
# Éditer .env et remplir les secrets (cf. Section 7.3 pour génération)

# 3. Installer les dépendances
npm install

# 4. Démarrer les services Docker (PostgreSQL + Mailhog)
docker compose up -d postgres mailhog

# 5. Attendre que PostgreSQL soit prêt
docker compose exec postgres pg_isready -U strapi_user

# 6. Démarrer Strapi (backend) en mode développement
npm run dev --workspace=apps/backend
# → Strapi accessible sur http://localhost:1337/admin
# → Créer le premier compte administrateur

# 7. Dans un second terminal, démarrer Next.js (frontend)
npm run dev --workspace=apps/frontend
# → Le site est accessible sur http://localhost:3000

# 8. Interface Mailhog (emails de test)
# → Ouvrir http://localhost:8025
```

**Alternative : tout-en-un via Docker Compose :**

```bash
docker compose up -d
# PostgreSQL : localhost:5432
# Strapi     : localhost:1337
# Next.js    : localhost:3000
# Mailhog    : localhost:8025
```

### 9.3 Commandes utiles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Démarre tous les workspaces en mode dev (Turborepo) |
| `npm run build` | Build de production (tous les workspaces) |
| `npm run lint` | Lint ESLint sur tous les workspaces |
| `npm run typecheck` | Vérification TypeScript |
| `npm run test` | Exécute tous les tests (Vitest) |
| `npm run format` | Formate le code (Prettier) |
| `npm run format:check` | Vérifie le formatage sans modifier |
| `docker compose up -d` | Démarre les services Docker |
| `docker compose down` | Arrête les services Docker |
| `docker compose logs -f strapi` | Logs Strapi en temps réel |
| `docker compose exec postgres psql -U strapi_user -d pairemancipation` | Console PostgreSQL |

### 9.4 Seed data (données fictives)

Un script de seed (`apps/backend/database/seeds/seed.ts`) doit être créé pour peupler :

- 10 `blog-article` avec catégories et tags
- 5 `knowledge-base-entry` avec catégories
- 20 `structure` avec coordonnées réparties en France
- 10 `event` (passés, en cours, futurs)
- 5 `news-item`
- Single Types : `homepage`, `about-page`, `platform-settings`

> Réf. Étape 4, Sprint 1.1.9.

```bash
# Exécuter le seed
npm run seed --workspace=apps/backend
```

---

## 10. Conventions de Code

### 10.1 Configuration ESLint

**Fichier : `packages/eslint-config/base.js`**

```javascript
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
    'prettier',
  ],
  plugins: [
    '@typescript-eslint',
    'security',         // cf. Étape 3, D-01
    'no-unsanitized',   // cf. Étape 3, D-01
  ],
  rules: {
    // Sécurité
    'security/detect-object-injection': 'warn',
    'security/detect-non-literal-regexp': 'warn',
    'security/detect-non-literal-fs-filename': 'warn',
    'no-unsanitized/method': 'error',
    'no-unsanitized/property': 'error',

    // TypeScript strict
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/consistent-type-imports': 'error',

    // Général
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
  },
};
```

**Fichier : `packages/eslint-config/next.js`**

```javascript
module.exports = {
  extends: [
    './base.js',
    'next/core-web-vitals',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
  },
};
```

### 10.2 Configuration Prettier

Fichier : `.prettierrc`

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### 10.3 Conventions de commit (Conventional Commits)

Fichier : `.commitlintrc.js`

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // Nouvelle fonctionnalité
        'fix',      // Correction de bug
        'docs',     // Documentation
        'style',    // Formatage (pas de changement fonctionnel)
        'refactor', // Refactorisation
        'perf',     // Amélioration de performance
        'test',     // Ajout ou modification de tests
        'build',    // Changement système de build / dépendances
        'ci',       // Changement CI/CD
        'chore',    // Maintenance
        'revert',   // Annulation de commit
        'security', // Changement lié à la sécurité (cf. Étape 3)
      ],
    ],
    'scope-enum': [
      1,
      'always',
      [
        'backend',  // apps/backend
        'frontend', // apps/frontend
        'shared',   // packages/*
        'docker',   // docker/
        'ci',       // .github/
        'docs',     // docs/
      ],
    ],
    'subject-max-length': [2, 'always', 100],
  },
};
```

**Exemples :**

| Type | Exemple |
|------|---------|
| `feat(frontend)` | `feat(frontend): add ArticleList component with pagination` |
| `fix(backend)` | `fix(backend): fix is-owner middleware for list endpoints` |
| `security(backend)` | `security(backend): add rate limiting on auth routes` |
| `docs` | `docs: add technical setup guide (Step 5)` |
| `test(backend)` | `test(backend): add data isolation tests for private zone` |

**Hooks Husky :**

```bash
# .husky/pre-commit
npm run lint
npm run typecheck
npm run format:check
```

```bash
# .husky/commit-msg
npx --no -- commitlint --edit $1
```

### 10.4 Stratégie de branches

| Branche | Rôle | Protection |
|---------|------|------------|
| `main` | Production-ready, déploie en staging automatiquement | PR obligatoire, CI doit passer, 1 review minimum |
| `develop` | Intégration des features en cours | CI doit passer |
| `feat/<nom>` | Développement d'une feature | Merge vers `develop` puis `main` |
| `fix/<nom>` | Correction de bug | Merge vers `develop` puis `main` |
| `security/<nom>` | Correctif de sécurité | Merge vers `main` directement (hotfix) |
| `docs/<nom>` | Documentation | Merge vers `main` |

```
main       ●────────●──────────────●──────────────●────► production
            \       ↑              ↑              ↑
develop      ●──●──●──●──●──●──●──●──●──●──●──●──●────► staging
              \  ↑     \  ↑        \  ↑
feat/blog      ●──●     ●──●        ●──●
                       feat/auth    feat/notebook
```

### 10.5 Template de Pull Request

Fichier : `.github/PULL_REQUEST_TEMPLATE.md`

```markdown
## Description
<!-- Décrivez les changements effectués -->

## Type de changement
- [ ] Nouvelle fonctionnalité (feat)
- [ ] Correction de bug (fix)
- [ ] Changement de sécurité (security)
- [ ] Refactorisation (refactor)
- [ ] Documentation (docs)
- [ ] Autre : ___

## Références
- Issue : #
- Étape :

## Checklist
- [ ] Le code suit les conventions du projet (ESLint, Prettier)
- [ ] Les types TypeScript sont corrects (`npm run typecheck`)
- [ ] Les tests passent (`npm run test`)
- [ ] Les tests d'isolation sont OK (si zone privée)
- [ ] La documentation est à jour (si applicable)
- [ ] Pas de secret dans le code
- [ ] Accessible (ARIA, contraste, clavier) si composant UI
```

### 10.6 Conventions de nommage

| Élément | Convention | Exemple |
|---------|-----------|---------|
| Fichiers composants React | PascalCase | `ArticleCard.tsx` |
| Fichiers utilitaires | camelCase | `formatDate.ts` |
| Fichiers hooks | camelCase préfixé `use` | `useNotebook.ts` |
| Fichiers stores | camelCase suffixé `Store` | `authStore.ts` |
| Fichiers types | camelCase | `blog.ts` |
| Variables / fonctions | camelCase | `fetchArticles()` |
| Types / Interfaces | PascalCase | `BlogArticle`, `GoalHorizon` |
| Constantes | UPPER_SNAKE_CASE | `MAX_LOGIN_ATTEMPTS` |
| CSS classes | Tailwind utility classes | — |
| Strapi Content-Types | kebab-case pluriel | `blog-articles` (cf. Étape 1) |
| Strapi champs | camelCase | `coverImage`, `publishedAt` (cf. Étape 1) |
| Routes Next.js | kebab-case français | `/carnet`, `/objectifs`, `/autoevaluation` (cf. Étape 2) |

---

## 11. Architecture de Déploiement

### 11.1 Architecture production (Hébergeur HDS)

```
┌──────────────────────────────────────────────────────────────────┐
│                  Hébergeur HDS Certifié                           │
│            (OVH Healthcare / Scaleway HDS)                        │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                  Reverse Proxy (Nginx)                        │ │
│  │                                                               │ │
│  │  pairemancipation.fr ──────► Next.js (:3000)                 │ │
│  │  api.pairemancipation.fr ──► Strapi  (:1337)                 │ │
│  │                                                               │ │
│  │  SSL/TLS Termination (Let's Encrypt / hébergeur)             │ │
│  │  Headers de sécurité (cf. Étape 3, §4.2)                    │ │
│  │  Rate limiting global                                         │ │
│  └──────────────────────────────────────────────────────────────┘ │
│           │                           │                            │
│           ▼                           ▼                            │
│  ┌─────────────────┐      ┌──────────────────┐                   │
│  │   Next.js       │      │     Strapi       │                   │
│  │   (Docker)      │      │     (Docker)     │                   │
│  │   Port 3000     │      │     Port 1337    │                   │
│  │   Standalone    │      │                  │                   │
│  └─────────────────┘      └────────┬─────────┘                   │
│                                     │                              │
│                           ┌────────▼─────────┐                   │
│                           │  PostgreSQL 16   │                   │
│                           │                  │                   │
│                           │  public          │                   │
│                           │  private_health  │                   │
│                           │                  │                   │
│                           │  TDE activé      │                   │
│                           │  Backup quotidien│                   │
│                           └──────────────────┘                   │
│                                                                    │
│  ┌──────────────────┐  ┌──────────────────────┐                  │
│  │  Stockage S3 /   │  │  Logs (append-only,  │                  │
│  │  Object Storage  │  │  rétention 12 mois)  │                  │
│  │  (uploads)       │  │  (cf. Étape 3,       │                  │
│  │                  │  │   L-04/L-05)         │                  │
│  └──────────────────┘  └──────────────────────┘                  │
└──────────────────────────────────────────────────────────────────┘
```

> Réf. Étape 3, §6 — Option A (tout chez un hébergeur HDS) recommandée pour le MVP.

### 11.2 Configuration Nginx (reverse proxy)

Fichier : `docker/nginx/nginx.conf`

```nginx
# Réf. Étape 3, §4.2 (Headers de sécurité)
# Réf. Étape 3, C-01/C-02 (HTTPS/HSTS)

upstream nextjs {
    server frontend:3000;
}

upstream strapi {
    server strapi:1337;
}

# Rate limiting
limit_req_zone $binary_remote_addr zone=global:10m rate=30r/s;
limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/m;

# Redirection HTTP → HTTPS
server {
    listen 80;
    server_name pairemancipation.fr api.pairemancipation.fr;
    return 301 https://$host$request_uri;
}

# Frontend (Next.js)
server {
    listen 443 ssl http2;
    server_name pairemancipation.fr;

    ssl_certificate     /etc/ssl/certs/pairemancipation.fr.pem;
    ssl_certificate_key /etc/ssl/private/pairemancipation.fr.key;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    # Headers de sécurité (cf. Étape 3, §4.2)
    add_header Strict-Transport-Security
      "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy
      "camera=(), microphone=(), geolocation=(self)" always;

    limit_req zone=global burst=50 nodelay;

    location / {
        proxy_pass http://nextjs;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# API (Strapi)
server {
    listen 443 ssl http2;
    server_name api.pairemancipation.fr;

    ssl_certificate     /etc/ssl/certs/pairemancipation.fr.pem;
    ssl_certificate_key /etc/ssl/private/pairemancipation.fr.key;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    add_header Strict-Transport-Security
      "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Limite taille upload (cf. Étape 3, S-07)
    client_max_body_size 20M;

    # Rate limiting auth (plus restrictif)
    location /api/auth/ {
        limit_req zone=auth burst=3 nodelay;
        proxy_pass http://strapi;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://strapi;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 11.3 SSL/TLS

| Élément | Configuration | Réf. |
|---------|--------------|------|
| Protocoles | TLS 1.2 et TLS 1.3 uniquement | Étape 3, C-01 |
| Certificat | Let's Encrypt (auto-renouvellement certbot) ou fourni par hébergeur HDS | Étape 3, C-01 |
| HSTS | `max-age=31536000; includeSubDomains; preload` | Étape 3, C-02 |
| OCSP Stapling | Activé | — |
| Ciphers | `HIGH:!aNULL:!MD5` | — |

### 11.4 Stratégie de déploiement

| Environnement | URL | Déclencheur | Stratégie |
|---------------|-----|-------------|-----------|
| **Développement** | `localhost:3000` / `:1337` | Local (Docker Compose) | — |
| **Staging** | `staging.pairemancipation.fr` | Push sur `main` | Déploiement automatique |
| **Production** | `pairemancipation.fr` | Tag `v*.*.*` | Déploiement bleu-vert (cf. Étape 3, D-10) |

> **Déploiement bleu-vert** : Maintenir deux environnements identiques (blue/green). Déployer sur l'inactif, exécuter les smoke tests, puis basculer le load balancer. Zéro downtime et rollback instantané.

### 11.5 Monitoring & alertes

| Outil | Rôle | Justification |
|-------|------|---------------|
| Uptime monitoring | Healthcheck HTTP (Strapi `/healthcheck`, Next.js `/api/health`) | Alerte si downtime > 1 min |
| Logs centralisés | Agrégation logs applicatifs (Winston JSON → fichiers) | Réf. Étape 3, L-01 à L-07 |
| Alertes sécurité | Notification sur tentatives brute force, accès admin inhabituel | Réf. Étape 3, L-07 |
| Métriques application | Temps de réponse API, erreurs 5xx, usage mémoire | Performance |

> **Recommandation** : Utiliser une solution self-hosted (Grafana + Loki pour les logs) pour maintenir la conformité RGPD — éviter l'envoi de logs vers des services tiers hors du périmètre HDS.

---

## 12. Récapitulatif — Checklist de Démarrage

### Avant le premier commit de code

- [ ] Monorepo initialisé (Turborepo + npm workspaces)
- [ ] `apps/backend` : Strapi 4 initialisé avec TypeScript
- [ ] `apps/frontend` : Next.js 14 initialisé avec App Router + Tailwind + shadcn/ui
- [ ] `packages/shared-types` : Package de types partagés créé
- [ ] `packages/shared-utils` : Package utilitaires + validation Zod
- [ ] `packages/eslint-config` : Configuration ESLint partagée
- [ ] Docker Compose fonctionnel (PostgreSQL 16 + Mailhog)
- [ ] Schéma `private_health` créé dans PostgreSQL
- [ ] `.env.example` complet et documenté
- [ ] Validation Zod des variables d'environnement au démarrage
- [ ] ESLint + Prettier + commitlint + Husky configurés
- [ ] CI GitHub Actions opérationnel (lint + typecheck + test + audit)
- [ ] CD Staging déploie automatiquement sur push `main`
- [ ] Headers de sécurité configurés (`next.config.js` + Nginx)
- [ ] CORS configuré dans Strapi
- [ ] README.md avec instructions « Getting Started »
- [ ] Compte hébergeur HDS souscrit et staging accessible

### Correspondance avec la Roadmap MVP (Étape 4, Phase 0)

| Checklist | Tâche Roadmap | Sprint |
|-----------|---------------|--------|
| Monorepo initialisé | 0.1.1 | 0.1 |
| Strapi setup | 0.1.2 | 0.1 |
| Next.js setup | 0.1.3 | 0.1 |
| PostgreSQL Docker | 0.1.4 | 0.1 |
| Variables d'environnement | 0.1.5 | 0.1 |
| ESLint & Prettier | 0.1.6 | 0.1 |
| Pipeline CI | 0.2.1 | 0.2 |
| Dockerfiles | 0.2.2 | 0.2 |
| Hébergeur HDS | 0.2.3 | 0.2 |
| HTTPS & Headers | 0.2.4 | 0.2 |
| Déploiement staging | 0.2.5 | 0.2 |
| Schéma `private_health` | 0.2.6 | 0.2 |
