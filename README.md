# Pairemancipation

Plateforme numerique dediee au retablissement en sante mentale par le pair-accompagnement.

![Node](https://img.shields.io/badge/Node.js-20_LTS-339933?logo=nodedotjs&logoColor=white)
![Strapi](https://img.shields.io/badge/Strapi-4.25.9-4945FF?logo=strapi&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14.2.15-000000?logo=nextdotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![License](https://img.shields.io/badge/License-CC_BY--NC--SA_4.0-lightgrey)

---

## Presentation

Pairemancipation est une plateforme e-sante proposant :

- **Zone publique** : blog, base de ressources, annuaire des structures de sante mentale (carte interactive), agenda des evenements, actualites
- **Zone privee** : carnet de bord, objectifs personnels, autoevaluation, calendrier, generation de documents, suivi du retablissement
- **Chiffrement zero-knowledge** : les donnees de sante sont chiffrees cote client (AES-256-GCM) avant envoi au serveur — seul l'utilisateur possede la cle
- **Conformite HDS/RGPD** : hebergement certifie HDS, schema PostgreSQL isole pour les donnees de sante, politique de confidentialite et CGU integrees

---

## Stack technique

| Couche | Technologies |
|--------|-------------|
| **Backend** | Strapi 4.25.9, PostgreSQL 16, Winston (logs), Zod (validation), koa2-ratelimit |
| **Frontend** | Next.js 14.2.15, React 18, Tailwind CSS 3.4, shadcn/ui, TanStack Query, Zustand, React Hook Form |
| **Cartographie** | React Leaflet + OpenStreetMap (conforme RGPD) |
| **Calendrier** | FullCalendar 6.1 |
| **Chiffrement** | Web Crypto API (PBKDF2 + AES-256-GCM, envelope encryption KEK/DEK) |
| **Packages partages** | `shared-types` (types TypeScript), `shared-utils` (constantes, validation), `eslint-config` |
| **Outils** | Turborepo, Docker, Vitest, Husky, commitlint, Prettier, GitHub Actions |

---

## Prerequis

| Outil | Version minimale |
|-------|-----------------|
| Node.js | >= 20.0.0 LTS |
| npm | >= 10.0.0 |
| Docker | >= 24.0 |
| Docker Compose | >= 2.20 |
| Git | >= 2.40 |

---

## Installation rapide

### 1. Cloner le depot

```bash
git clone <url-du-depot> peer-to-peer
cd peer-to-peer
```

### 2. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Generer les secrets obligatoires :

```bash
# Mot de passe base de donnees (min 32 caracteres)
openssl rand -base64 32

# APP_KEYS (4 cles separees par des virgules)
echo "$(openssl rand -base64 48),$(openssl rand -base64 48),$(openssl rand -base64 48),$(openssl rand -base64 48)"

# JWT_SECRET et ADMIN_JWT_SECRET (min 64 caracteres chacun)
openssl rand -hex 64
openssl rand -hex 64

# API_TOKEN_SALT et TRANSFER_TOKEN_SALT (min 32 caracteres chacun)
openssl rand -hex 32
openssl rand -hex 32
```

Copier les valeurs generees dans le fichier `.env`.

### 3. Installer les dependances

```bash
npm install
```

> Installe automatiquement les dependances de tous les workspaces (backend, frontend, packages partages) via npm workspaces.

### 4. Demarrer les services Docker

```bash
docker compose -f docker/docker-compose.yml up -d
```

Cela demarre :
- **PostgreSQL 16** sur le port `5432` (avec script d'initialisation du schema `private_health`)
- **Mailhog** sur les ports `1025` (SMTP) et `8025` (interface web)

Verifier que les services sont operationnels :

```bash
docker compose -f docker/docker-compose.yml ps
```

### 5. Lancer le developpement

```bash
npm run dev
```

Turborepo demarre en parallele :
- **Strapi** (backend) : http://localhost:1337
- **Next.js** (frontend) : http://localhost:3000

### 6. Creer le compte administrateur Strapi

Au premier lancement, ouvrir http://localhost:1337/admin et creer le compte admin.

### 7. (Optionnel) Peupler la base avec des donnees de demo

```bash
npm run seed --workspace=apps/backend
```

> **Pre-requis** : le compte admin Strapi doit etre cree au prealable (etape 6).

Par defaut, le script utilise `admin@pairemancipation.fr` / `Admin123!`. Pour personnaliser :

```bash
SEED_ADMIN_EMAIL=votre@email.fr SEED_ADMIN_PASSWORD=VotreMotDePasse npm run seed --workspace=apps/backend
```

Le seed cree :
- 5 categories de blog + 10 tags
- 5 categories de ressources
- 8 types de services
- 5 structures (Paris, Lyon, Lille, Nantes)
- 10 articles de blog
- 10 evenements
- 5 actualites
- 3 modeles d'autoevaluation (WHO-5, RAS-r, SWLS)

---

## Variables d'environnement

Toutes les variables sont documentees dans `.env.example`.

| Groupe | Variable | Description | Obligatoire |
|--------|----------|-------------|:-----------:|
| **PostgreSQL** | `DATABASE_HOST` | Hote de la base | - |
| | `DATABASE_PORT` | Port (defaut : 5432) | - |
| | `DATABASE_NAME` | Nom de la base | - |
| | `DATABASE_USERNAME` | Utilisateur | - |
| | `DATABASE_PASSWORD` | Mot de passe (min 32 car.) | Oui |
| | `DATABASE_SSL` | Activer SSL (defaut : false) | - |
| | `DATABASE_SCHEMA` | Schema (defaut : public) | - |
| **Strapi** | `STRAPI_HOST` | Hote (defaut : 0.0.0.0) | - |
| | `STRAPI_PORT` | Port (defaut : 1337) | - |
| | `STRAPI_URL` | URL publique de Strapi | - |
| **Secrets** | `APP_KEYS` | 4 cles (separees par ,) | Oui |
| | `JWT_SECRET` | Secret JWT (min 64 car.) | Oui |
| | `ADMIN_JWT_SECRET` | Secret JWT admin (min 64 car.) | Oui |
| | `API_TOKEN_SALT` | Sel tokens API (min 32 car.) | Oui |
| | `TRANSFER_TOKEN_SALT` | Sel tokens transfert (min 32 car.) | Oui |
| **JWT** | `JWT_EXPIRATION` | Duree du token (defaut : 15m) | - |
| | `REFRESH_TOKEN_EXPIRATION` | Duree du refresh (defaut : 7d) | - |
| **Chiffrement** | `PBKDF2_ITERATIONS` | Iterations PBKDF2 (defaut : 600000) | - |
| | `ENCRYPTION_ALGORITHM` | Algorithme (defaut : aes-256-gcm) | - |
| **SMTP** | `SMTP_HOST` | Hote SMTP (defaut : localhost) | - |
| | `SMTP_PORT` | Port SMTP (defaut : 1025) | - |
| | `SMTP_USERNAME` | Identifiant SMTP | Prod |
| | `SMTP_PASSWORD` | Mot de passe SMTP | Prod |
| **Frontend** | `NEXT_PUBLIC_STRAPI_URL` | URL Strapi cote client | - |
| | `NEXT_PUBLIC_SITE_URL` | URL du site | - |

---

## Commandes utiles

### Monorepo (racine)

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lance backend + frontend en mode developpement |
| `npm run build` | Build de production (tous les workspaces) |
| `npm run lint` | Lint ESLint sur tous les workspaces |
| `npm run typecheck` | Verification TypeScript sur tous les workspaces |
| `npm run test` | Lance les tests Vitest sur tous les workspaces |
| `npm run format` | Formate le code avec Prettier |
| `npm run format:check` | Verifie le formatage sans modifier |

### Backend (apps/backend)

| Commande | Description |
|----------|-------------|
| `npm run develop --workspace=apps/backend` | Strapi en mode dev (hot-reload) |
| `npm run build --workspace=apps/backend` | Build admin panel Strapi |
| `npm run seed --workspace=apps/backend` | Peupler la base de donnees |
| `npm run test --workspace=apps/backend` | Tests backend |

### Frontend (apps/frontend)

| Commande | Description |
|----------|-------------|
| `npm run dev --workspace=apps/frontend` | Next.js en mode dev |
| `npm run build --workspace=apps/frontend` | Build de production Next.js |
| `npm run test --workspace=apps/frontend` | Tests frontend |

### Docker

| Commande | Description |
|----------|-------------|
| `docker compose -f docker/docker-compose.yml up -d` | Demarrer PostgreSQL + Mailhog |
| `docker compose -f docker/docker-compose.yml down` | Arreter les services |
| `docker compose -f docker/docker-compose.yml logs -f postgres` | Logs PostgreSQL |
| `docker compose -f docker/docker-compose.yml exec postgres psql -U strapi_user -d pairemancipation` | Console psql |

### Acces aux services

| Service | URL |
|---------|-----|
| Frontend Next.js | http://localhost:3000 |
| Backend Strapi (API) | http://localhost:1337/api |
| Admin Strapi | http://localhost:1337/admin |
| Mailhog (emails) | http://localhost:8025 |
| PostgreSQL | localhost:5432 |

---

## Structure du projet

```
peer-to-peer/
├── apps/
│   ├── backend/                  # Strapi 4 (API + CMS)
│   │   ├── config/               # database, plugins, middlewares, server
│   │   ├── database/seeds/       # Script de seed
│   │   └── src/
│   │       ├── api/              # 22 Content-Types (routes, controllers, services, schemas)
│   │       ├── middlewares/       # is-owner, audit-log, csrf, rate-limit-auth
│   │       ├── utils/            # env-validation
│   │       └── __tests__/        # Tests backend
│   │
│   └── frontend/                 # Next.js 14 (App Router)
│       ├── public/               # robots.txt, assets statiques
│       └── src/
│           ├── app/
│           │   ├── (public)/     # Zone publique (blog, ressources, annuaire, agenda...)
│           │   ├── (private)/    # Zone privee (carnet, objectifs, autoevaluation...)
│           │   ├── (auth)/       # Connexion, inscription, mot de passe oublie
│           │   └── sitemap.ts    # Sitemap dynamique
│           ├── components/       # Composants React (layout, content, auth, rgpd, ui...)
│           ├── hooks/            # Hooks personnalises (useInactivityTimeout, useDebounce)
│           ├── lib/              # Utilitaires (crypto, strapi, auth, csrf)
│           ├── stores/           # Stores Zustand (auth, ui, encryption)
│           └── __tests__/        # Tests frontend
│
├── packages/
│   ├── shared-types/             # Types TypeScript partages (API, blog, directory, health...)
│   ├── shared-utils/             # Constantes, validation (PBKDF2_ITERATIONS, PASSWORD_MIN_LENGTH...)
│   └── eslint-config/            # Config ESLint partagee (base, next, strapi)
│
├── docker/
│   ├── docker-compose.yml        # PostgreSQL 16 + Mailhog
│   ├── nginx/                    # Config Nginx production (reverse proxy, SSL, rate limiting)
│   └── postgres/
│       ├── init-scripts/         # 01-init-schemas.sql (schema private_health)
│       └── migrations/           # 02-private-health-schema.sql (isolation HDS)
│
├── docs/architecture/            # 5 documents d'architecture
├── .github/workflows/            # CI (lint, test, audit) + CD (staging)
├── .env.example                  # Variables d'environnement documentees
├── turbo.json                    # Pipeline Turborepo
└── package.json                  # Workspaces npm + scripts monorepo
```

---

## Tests

### Lancer tous les tests

```bash
npm run test
```

### Par workspace

```bash
npm run test --workspace=apps/frontend
npm run test --workspace=apps/backend
npm run test --workspace=packages/shared-utils
```

### Couverture actuelle

| Domaine | Fichiers de test |
|---------|-----------------|
| Chiffrement | encrypt/decrypt round-trip, PBKDF2, envelope encryption, salt, recovery code |
| Stores | authStore, uiStore, encryptionStore |
| Middlewares | is-owner (9 tests), rate-limit-auth (5 tests) |
| Composants | StrapiBlocksRenderer, CookieConsent |
| Utilitaires | validation, constantes, debounce |
| API | strapiFind, strapiCreate helpers |

---

## Conventions de code

### Commits

Le projet utilise [Conventional Commits](https://www.conventionalcommits.org/) avec commitlint :

```
<type>(<scope>): <description>
```

**Types** : `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`, `security`

**Scopes** : `backend`, `frontend`, `shared`, `docker`, `ci`, `docs`

**Exemples** :
```
feat(frontend): add recovery stage visualization
fix(backend): correct is-owner middleware for nested relations
security(frontend): sanitize Strapi Blocks content with DOMPurify
```

### Branches

| Branche | Usage |
|---------|-------|
| `main` | Production stable |
| `develop` | Integration continue |
| `feat/<nom>` | Nouvelles fonctionnalites |
| `fix/<nom>` | Corrections de bugs |
| `security/<nom>` | Correctifs de securite |

### Pre-commit hooks (Husky)

- **pre-commit** : lint + typecheck + format check
- **commit-msg** : validation commitlint

### Nommage

| Element | Convention | Exemple |
|---------|-----------|---------|
| Composants React | PascalCase | `PrivateSidebar.tsx` |
| Hooks | camelCase avec `use` | `useInactivityTimeout.ts` |
| Utilitaires | camelCase | `strapiFind.ts` |
| Routes (pages) | kebab-case (francais) | `carnet-de-bord/` |
| Stores Zustand | camelCase avec `use` | `useAuthStore` |

---

## Deploiement

### Docker (production)

Les deux applications disposent de Dockerfiles multi-stage (dev/build/prod) :

```bash
# Build backend
docker build -t pairemancipation-api --target production apps/backend/

# Build frontend
docker build -t pairemancipation-web --target production apps/frontend/
```

### Nginx

La configuration Nginx de production se trouve dans `docker/nginx/nginx.conf` :
- Reverse proxy vers Next.js (port 3000) et Strapi (port 1337)
- Terminaison SSL/TLS 1.2+
- Rate limiting sur `/api/auth` (5 req/min)
- Limite de taille des uploads (20 Mo)

### CI/CD (GitHub Actions)

| Workflow | Declencheur | Actions |
|----------|------------|---------|
| `ci.yml` | PR + push sur main/develop | Lint, typecheck, format, tests Vitest (avec PostgreSQL), npm audit, Trivy scan |
| `cd-staging.yml` | Push sur main | Build Docker, scan Trivy images, deploiement staging |

### Exigences de production

- Hebergeur certifie **HDS** (Hebergement de Donnees de Sante)
- TLS 1.2+ avec certificats valides
- PostgreSQL dedie (pas de base partagee)
- Secrets generes avec `openssl rand` (jamais de valeurs par defaut)
- SMTP configure pour les emails transactionnels

---

## Securite

| Mesure | Implementation |
|--------|---------------|
| **Chiffrement zero-knowledge** | Web Crypto API, AES-256-GCM, cles en memoire uniquement |
| **Derivation de cle** | PBKDF2 avec 600 000 iterations + SHA-256 |
| **Envelope encryption** | KEK (derivee du mot de passe) wraps DEK (cle de donnees) |
| **Isolation des donnees** | Schema PostgreSQL `private_health` dedie |
| **Controle d'acces** | Middleware `is-owner` sur toutes les routes privees |
| **Audit** | Middleware `audit-log` sur les operations sensibles |
| **CSRF** | Token rotation avec cookie + header |
| **Rate limiting** | 5 tentatives auth, blocage 15 minutes |
| **Headers de securite** | CSP, HSTS, X-Frame-Options: DENY, X-Content-Type-Options, Referrer-Policy |
| **Sanitisation** | DOMPurify pour le contenu Strapi Blocks |
| **ESLint securite** | Plugins `eslint-plugin-security` + `eslint-plugin-no-unsanitized` |
| **Inactivite** | Deconnexion automatique apres inactivite (zone privee) |

---

## Documentation d'architecture

Le dossier `docs/architecture/` contient 5 documents detailles :

1. **[01 - Modelisation des donnees](docs/architecture/01-data-modeling.md)** — Content-Types Strapi, schemas, chiffrement
2. **[02 - Architecture des composants](docs/architecture/02-component-architecture.md)** — Composants frontend, hooks, stores, pages
3. **[03 - Securite & conformite HDS](docs/architecture/03-security-hds-checklist.md)** — 62 exigences de securite, headers, CSP, CI/CD
4. **[04 - Roadmap MVP](docs/architecture/04-mvp-roadmap.md)** — 4 phases de developpement (18 semaines)
5. **[05 - Guide technique de setup](docs/architecture/05-technical-setup-guide.md)** — Configuration detaillee de l'environnement

---

## Licence

Le code source est open source. Les contenus redactionnels sont partages sous licence **Creative Commons BY-NC-SA 4.0** sauf mention contraire.

---

## Contact

Pour toute question : **contact@pairemancipation.fr**
