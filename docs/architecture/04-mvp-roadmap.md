# Étape 4 — Roadmap MVP Pairémancipation

## Vue d'ensemble

### Philosophie MVP

Le MVP (Minimum Viable Product) vise à livrer une plateforme **fonctionnelle, sécurisée et conforme HDS** avec le périmètre minimum permettant de :

1. **Valider l'usage** : les pairs-aidants utilisent-ils réellement les outils privés ?
2. **Valider la communauté** : le contenu collaboratif attire-t-il des contributeurs ?
3. **Valider la conformité** : l'architecture HDS/RGPD tient-elle en conditions réelles ?

### Périmètre MVP vs Post-MVP

| Fonctionnalité | MVP | Post-MVP |
|----------------|:---:|:--------:|
| Site public (blog, ressources, actualités) | x | |
| Annuaire + cartographie | x | |
| Agenda événements publics | x | |
| Inscription / Connexion / Auth | x | |
| Profil contributeur | x | |
| Contribution (structures, événements) | x | |
| Modération des contributions | | x |
| Carnet de bord (notes + humeur) | x | |
| Objectifs de rétablissement | x | |
| Autoévaluation (1 template) | x | |
| Dashboard privé (widgets essentiels) | x | |
| Chiffrement zero-knowledge | x | |
| Génération de documents PDF | | x |
| Calendrier personnel | | x |
| Sync Google Agenda | | x |
| Profil de rétablissement (CHIME) | | x |
| Recommandations personnalisées | | x |
| MFA (TOTP) | | x |
| Connexion sociale (OAuth) | | x |
| Tutoriels interactifs | | x |
| PWA / Notifications push | | x |

---

## Architecture en 4 phases

```
Phase 0          Phase 1            Phase 2             Phase 3
FONDATIONS       ZONE PUBLIQUE      ZONE PRIVÉE         STABILISATION
                                                        & LANCEMENT

Semaines 1-3     Semaines 4-8       Semaines 9-15       Semaines 16-18
───────────── ► ───────────────── ► ─────────────────── ► ────────────────
Infra, Strapi,   Blog, Annuaire,    Auth, Chiffrement,   Tests, Audit,
CI/CD, sécurité  Agenda, SEO        Carnet, Objectifs,   RGPD, Perf,
de base                             Autoéval, Dashboard  Mise en prod
```

---

## Phase 0 — Fondations (Semaines 1-3)

> **Objectif** : Infrastructure opérationnelle, projets initialisés, pipeline CI/CD, sécurité de base.

### Sprint 0.1 — Infrastructure & Projets (S1-S2)

| # | Tâche | Détail | Livrable | Réf. |
|---|-------|--------|----------|------|
| 0.1.1 | Initialiser le monorepo | Structure `backend/` (Strapi) + `frontend/` (Next.js) + `docs/`. Configurer Turborepo ou npm workspaces | Repo fonctionnel | — |
| 0.1.2 | Setup Strapi v4 | `npx create-strapi-app` avec PostgreSQL, TypeScript activé. Configurer `.env` selon le template (cf. Étape 3, §8.3) | Strapi démarre en local | Étape 1 |
| 0.1.3 | Setup Next.js 14+ | App Router, TypeScript strict, Tailwind CSS, ESLint. Installer shadcn/ui (init) | Next.js démarre en local | Étape 2 |
| 0.1.4 | PostgreSQL local | Docker Compose avec PostgreSQL 16. Créer les schemas `public` + `private_health` | `docker-compose.yml` | Étape 1 |
| 0.1.5 | Variables d'environnement | `.env.example` commité, `.env` gitignoré. Validation Zod au démarrage Strapi | Fichiers `.env` | Étape 3, D-04 |
| 0.1.6 | ESLint & Prettier | Config partagée monorepo. Plugins : `eslint-plugin-security`, `eslint-plugin-no-unsanitized` | `.eslintrc.js` | Étape 3, D-01 |

### Sprint 0.2 — CI/CD & Sécurité de base (S2-S3)

| # | Tâche | Détail | Livrable | Réf. |
|---|-------|--------|----------|------|
| 0.2.1 | Pipeline CI (GitHub Actions) | Lint + Type-check + Tests unitaires sur chaque PR. `npm audit` obligatoire | `.github/workflows/ci.yml` | Étape 3, D-02/D-07 |
| 0.2.2 | Docker & Docker Compose | Dockerfiles Strapi + Next.js. Compose pour dev local complet | `Dockerfile` x2 | Étape 3, D-08 |
| 0.2.3 | Hébergeur HDS choisi | Souscrire à l'offre HDS (recommandation : OVH Healthcare ou Scaleway). Setup staging env | Compte hébergeur actif | Étape 3, §6 |
| 0.2.4 | HTTPS & Headers de sécurité | Certificat TLS (Let's Encrypt/hébergeur). Headers de sécurité dans `next.config.js` + middleware Strapi | Config HTTPS | Étape 3, C-01/C-02, §4.2 |
| 0.2.5 | Déploiement staging | Pipeline CD : push sur `main` → déploie staging automatiquement | URL staging accessible | Étape 3, D-09 |
| 0.2.6 | Schema PostgreSQL privé | Script SQL de création du schema `private_health` avec permissions restrictives (cf. Étape 1) | Script migration | Étape 1 |

### Livrables Phase 0

- [ ] Monorepo fonctionnel (Strapi + Next.js)
- [ ] PostgreSQL avec schemas public / private_health
- [ ] CI/CD opérationnel (lint, tests, audit, déploiement staging)
- [ ] HTTPS + headers de sécurité configurés
- [ ] Environnement staging sur hébergeur HDS

---

## Phase 1 — Zone Publique (Semaines 4-8)

> **Objectif** : Site public complet avec contenu éditorial, annuaire géolocalisé, agenda.

### Sprint 1.1 — Content-Types Publics Strapi (S4-S5)

| # | Tâche | Détail | Content-Types | Réf. |
|---|-------|--------|---------------|------|
| 1.1.1 | Créer les Content-Types blog | `blog-article`, `blog-category`, `tag` avec tous les champs (cf. Étape 1) | 3 collections | Étape 1, §1-3 |
| 1.1.2 | Créer les Content-Types ressources | `knowledge-base-entry`, `knowledge-category`, `tutorial` | 3 collections | Étape 1, §4-6 |
| 1.1.3 | Créer les Content-Types annuaire | `structure`, `service-type` + composants `location.address`, `location.coordinates`, `schedule.opening-slot` | 2 collections + 3 composants | Étape 1, §7-8 |
| 1.1.4 | Créer les Content-Types agenda | `event` | 1 collection | Étape 1, §9 |
| 1.1.5 | Créer les Content-Types actualités | `news-item` | 1 collection | Étape 1, §10 |
| 1.1.6 | Single Types | `homepage`, `about-page`, `platform-settings` | 3 single types | Étape 1 |
| 1.1.7 | Composants partagés | `shared.seo-meta`, `tutorial.step` | 2 composants | Étape 1 |
| 1.1.8 | Permissions API publique | Rôle `Public` : lecture seule sur tous les Content-Types ci-dessus. Aucun accès écriture | Config permissions | Étape 3, §3.1 |
| 1.1.9 | Seed data | Jeu de données fictives : 10 articles, 5 ressources, 20 structures, 10 événements, 5 actus | Script seed | — |

### Sprint 1.2 — Pages Publiques Next.js (S5-S7)

| # | Tâche | Composants | Pages | Réf. |
|---|-------|------------|-------|------|
| 1.2.1 | Layout public | `PublicHeader`, `PublicFooter`, `Breadcrumb`, `MobileNav` | `layout.tsx` racine | Étape 2 |
| 1.2.2 | Homepage | `ArticleCard`, `NewsCard`, `EventCard` (sections featured) | `page.tsx` | Étape 2 |
| 1.2.3 | Blog | `ArticleList`, `ArticleDetail`, `CategoryFilter`, `TagCloud`, `ContentSeo` | `(public)/blog/*` | Étape 2 |
| 1.2.4 | Ressources | `ResourceList`, `ResourceCard` | `(public)/ressources/*` | Étape 2 |
| 1.2.5 | Actualités | `NewsCard` (liste), détail article actus | `(public)/actualites/*` | Étape 2 |
| 1.2.6 | À propos | Page statique depuis Single Type | `(public)/a-propos` | Étape 2 |
| 1.2.7 | Pages légales | Mentions légales, politique de confidentialité, CGU | Pages statiques | Étape 3, G-05 |

### Sprint 1.3 — Annuaire & Agenda (S7-S8)

| # | Tâche | Composants | Librairie | Réf. |
|---|-------|------------|-----------|------|
| 1.3.1 | Annuaire carte | `DirectoryMap`, `DirectoryMapMarker`, `DirectoryMapPopup`, `DirectoryMapCluster`, `GeolocateButton` | React Leaflet | Étape 2 |
| 1.3.2 | Annuaire liste | `DirectoryList`, `DirectoryFilters`, `StructureCard` | shadcn/ui | Étape 2 |
| 1.3.3 | Fiche structure | `StructureDetail` (page complète avec mini-carte) | — | Étape 2 |
| 1.3.4 | Agenda public | `EventCalendar`, `EventList`, `EventTypeFilter` | FullCalendar | Étape 2 |
| 1.3.5 | Détail événement | `EventDetail` | — | Étape 2 |
| 1.3.6 | Hooks data | `useDirectory`, `useEvents`, `useDebounce`, `useGeolocation` | TanStack Query | Étape 2 |
| 1.3.7 | SearchBar globale | `SearchBar` avec recherche full-text Strapi | — | Étape 2 |

### Sprint 1.4 — SEO & Performance (S8)

| # | Tâche | Détail | Réf. |
|---|-------|--------|------|
| 1.4.1 | Metadata Next.js | `generateMetadata` sur chaque page publique. Open Graph, Twitter Cards | Étape 2 |
| 1.4.2 | Sitemap | `sitemap.xml` dynamique (articles, structures, événements) | — |
| 1.4.3 | Images optimisées | `next/image` avec formats WebP/AVIF, lazy loading | Étape 2 |
| 1.4.4 | Lighthouse audit | Score ≥ 90 sur Performance, Accessibility, SEO, Best Practices | — |
| 1.4.5 | ISR / SSG | Pages publiques en Static Site Generation avec revalidation (ISR 60s) | Étape 2 |
| 1.4.6 | CSP configurée | Content-Security-Policy avec nonces (cf. Étape 3, §4.3) | Étape 3 |

### Livrables Phase 1

- [ ] 10 Content-Types publics + 3 Single Types fonctionnels dans Strapi
- [ ] Site public complet : blog, ressources, actualités, annuaire, agenda, à propos
- [ ] Cartographie avec clustering et géolocalisation
- [ ] Calendrier public interactif
- [ ] SEO technique (metadata, sitemap, performance Lighthouse ≥ 90)
- [ ] Jeu de données fictives pour démo

---

## Phase 2 — Zone Privée (Semaines 9-15)

> **Objectif** : Authentification, chiffrement zero-knowledge, outils privés du membre, dashboard.

### Sprint 2.1 — Authentification & Comptes (S9-S10)

| # | Tâche | Détail | Réf. |
|---|-------|--------|------|
| 2.1.1 | Inscription | Formulaire (React Hook Form + Zod). Validation mot de passe robuste (12 car., complexité). Email de confirmation | Étape 3, A-01/A-04 |
| 2.1.2 | Connexion | JWT access token (15 min) + refresh token (7 jours, HttpOnly cookie). Rotation du refresh token | Étape 3, A-07/A-08 |
| 2.1.3 | Rate limiting | Middleware Strapi : max 5 tentatives / 15 min par IP + email | Étape 3, A-03 |
| 2.1.4 | Réinitialisation mot de passe | Token unique, 30 min d'expiration, email. Invalidation de l'ancien token | Étape 3, A-05 |
| 2.1.5 | CSRF protection | Token CSRF sur toutes les mutations. Cookie SameSite=Strict | Étape 3, A-11 |
| 2.1.6 | Pages auth Next.js | `(auth)/connexion`, `inscription`, `mot-de-passe-oublie`. Layout centré (`AuthLayout`) | Étape 2 |
| 2.1.7 | Stores auth | `authStore` (Zustand) : user, token en mémoire, isAuthenticated. `useAuth` hook | Étape 2 |
| 2.1.8 | Guard auth | Middleware Next.js : redirection si non connecté sur routes `(member)` et `(private)` | Étape 2 |
| 2.1.9 | Déconnexion auto | Inactivité > 30 min → déconnexion + suppression clé mémoire | Étape 3, A-10 |
| 2.1.10 | Logs authentification | Journal des connexions réussies/échouées, changements de mot de passe | Étape 3, L-01 |

### Sprint 2.2 — Profil Contributeur & Zone Membre (S10-S11)

| # | Tâche | Détail | Réf. |
|---|-------|--------|------|
| 2.2.1 | Content-Type `contributor-profile` | Création à l'inscription (lié au user). displayName, bio, avatar | Étape 1, §11 |
| 2.2.2 | Content-Type `contribution` | Type, title, data (JSON), status, contributor | Étape 1, §12 |
| 2.2.3 | Page profil | `ContributorProfileCard`, `ContributorProfileForm` | Étape 2 |
| 2.2.4 | Hub contribution | `ContributionHub` : proposer une structure ou un événement | Étape 2 |
| 2.2.5 | Formulaires contribution | `StructureContribForm`, `EventContribForm` (React Hook Form + Zod) | Étape 2 |
| 2.2.6 | Historique contributions | `ContributionList`, `ContributionStatusBadge` | Étape 2 |
| 2.2.7 | Layout membre | `MemberSidebar`, garde d'authentification sur le groupe `(member)` | Étape 2 |

### Sprint 2.3 — Chiffrement Zero-Knowledge (S11-S12)

| # | Tâche | Détail | Réf. |
|---|-------|--------|------|
| 2.3.1 | Module crypto client | `lib/crypto.ts` : dérivation PBKDF2 (600k itérations), AES-256-GCM encrypt/decrypt via Web Crypto API | Étape 3, C-04/C-05 |
| 2.3.2 | Envelope encryption | Génération DEK aléatoire à l'inscription. Wrapping par KEK (dérivée du mot de passe). Stockage DEK wrappée en base | Étape 3, C-06 |
| 2.3.3 | `encryptionStore` (Zustand) | Stocke la DEK en mémoire uniquement. Effacée à la déconnexion/inactivité | Étape 2 |
| 2.3.4 | Hook `useEncryption` | Interface : `encrypt(plaintext)`, `decrypt(ciphertext)`, `isReady`. Utilise la DEK du store | Étape 2 |
| 2.3.5 | Code de récupération | Génération de 12 mots aléatoires à l'inscription. Permet de re-wrapper la DEK si mot de passe perdu | Étape 3, §2.4 |
| 2.3.6 | Rotation de clé | Lors du changement de mot de passe : dériver nouvelle KEK, re-wrapper la DEK | Étape 3, C-10 |
| 2.3.7 | Tests crypto | Tests unitaires : encrypt → decrypt round-trip, clé incorrecte = échec, changement mot de passe = toujours déchiffrable | Étape 3, D-06 |

### Sprint 2.4 — Content-Types Privés & Middleware (S12-S13)

| # | Tâche | Détail | Réf. |
|---|-------|--------|------|
| 2.4.1 | Content-Types zone privée | `personal-notebook`, `personal-goal`, `self-assessment` dans le schema `private_health` | Étape 1, §13-15 |
| 2.4.2 | `assessment-template` | Modèles d'évaluation (données non sensibles, zone publique). Créer 1 template MVP (bien-être global, 5 dimensions, 20 questions) | Étape 1, §16 |
| 2.4.3 | Middleware `is-owner` | Filtre obligatoire `owner = currentUser.id` sur toutes les routes privées. Tests d'isolation | Étape 3, R-01/R-02 |
| 2.4.4 | Blocage admin | Retirer les permissions `find`/`findOne` sur les Content-Types privés pour le rôle admin Strapi | Étape 3, R-04 |
| 2.4.5 | Blocage populate | Interdire `?populate=owner` sur les routes privées | Étape 3, R-03 |
| 2.4.6 | Logs d'accès privé | Journal chaque lecture/écriture sur la zone privée (userId, action, contentType, timestamp) | Étape 3, L-02 |
| 2.4.7 | Tests d'isolation | Tests automatisés : UserA ne peut pas lire/modifier/supprimer les données de UserB. Admin ne peut pas lire les données privées | Étape 3, D-06 |

### Sprint 2.5 — Carnet de Bord & Objectifs (S13-S14)

| # | Tâche | Composants | Réf. |
|---|-------|------------|------|
| 2.5.1 | Carnet : liste | `NotebookEntryList`, `NotebookEntryCard`, `NotebookTagFilter`. Données déchiffrées côté client | Étape 2 |
| 2.5.2 | Carnet : création/édition | `NotebookEntryForm`, `MoodSelector`. Chiffrement avant envoi à l'API | Étape 2 |
| 2.5.3 | Carnet : humeur | `MoodTimeline` (mini graphique de l'humeur sur 30 jours) via Recharts `AreaChart` | Étape 2 |
| 2.5.4 | Carnet : hook | `useNotebook` (TanStack Query + decrypt pipeline) | Étape 2 |
| 2.5.5 | Objectifs : vue | `GoalBoard` (Kanban par statut), `GoalCard`, `GoalHorizonTabs` | Étape 2 |
| 2.5.6 | Objectifs : CRUD | `GoalForm`, `GoalDetail`, `MilestoneChecklist`, `GoalProgressBar` | Étape 2 |
| 2.5.7 | Objectifs : hook | `useGoals` (TanStack Query + decrypt pipeline) | Étape 2 |

### Sprint 2.6 — Autoévaluation & Dashboard (S14-S15)

| # | Tâche | Composants | Réf. |
|---|-------|------------|------|
| 2.6.1 | Autoévaluation : wizard | `AssessmentWizard` (multi-étapes), `AssessmentQuestionRenderer`, `LikertScale` | Étape 2 |
| 2.6.2 | Autoévaluation : résultats | `AssessmentResultView`, `AssessmentRadarChart` (Recharts), `ScoreBadge` | Étape 2 |
| 2.6.3 | Autoévaluation : historique | `AssessmentHistory`, `AssessmentLineChart` (évolution dans le temps) | Étape 2 |
| 2.6.4 | Autoévaluation : hook | `useAssessments` (TanStack Query + decrypt pipeline) | Étape 2 |
| 2.6.5 | Dashboard : grille | `DashboardGrid` (CSS Grid responsive 3/2/1 colonnes) | Étape 2 |
| 2.6.6 | Dashboard : widgets | `GoalProgressWidget`, `AssessmentChartWidget`, `RecentNotesWidget`, `QuickActionsWidget`, `ActivityFeedWidget` | Étape 2 |
| 2.6.7 | Dashboard : wrapper | `DashboardWidget` (skeleton loading, erreur, lien "Voir tout") | Étape 2 |
| 2.6.8 | Layout privé | `PrivateSidebar`, `PrivateLayout`, `TopBar`. Contexte de déchiffrement actif | Étape 2 |
| 2.6.9 | Paramètres compte | Page paramètres : changement mot de passe (avec rotation clé), export données, suppression compte | Étape 3, G-07/G-08 |

### Livrables Phase 2

- [ ] Authentification complète (inscription, connexion, JWT, rate limiting, CSRF)
- [ ] Chiffrement zero-knowledge opérationnel (PBKDF2 + AES-256-GCM + envelope encryption)
- [ ] Code de récupération à l'inscription
- [ ] Middleware `is-owner` avec tests d'isolation
- [ ] Carnet de bord (CRUD + humeur + timeline)
- [ ] Objectifs (Kanban + milestones + progression)
- [ ] Autoévaluation (1 template, wizard, radar chart, historique)
- [ ] Dashboard avec 5 widgets
- [ ] Paramètres (mot de passe, export, suppression)

---

## Phase 3 — Stabilisation & Lancement (Semaines 16-18)

> **Objectif** : Tests complets, audit sécurité, conformité RGPD, performance, mise en production.

### Sprint 3.1 — Tests & Qualité (S16)

| # | Tâche | Détail | Réf. |
|---|-------|--------|------|
| 3.1.1 | Tests unitaires | Couverture ≥ 80% sur : module crypto, middleware `is-owner`, hooks data, calcul de scores | Étape 3, D-06 |
| 3.1.2 | Tests d'intégration | API Strapi : vérifier les permissions par rôle, l'isolation des données, les validations | Étape 3, D-06 |
| 3.1.3 | Tests E2E | Parcours complets : inscription → carnet → objectif → autoévaluation → dashboard. Playwright ou Cypress | — |
| 3.1.4 | Tests de sécurité | Vérification OWASP Top 10 : XSS, injection, CSRF, broken auth, broken access control | Étape 3, §4 |
| 3.1.5 | Tests d'accessibilité | Audit axe-core + tests manuels NVDA/VoiceOver. Conformité WCAG 2.1 AA | Étape 2, a11y |
| 3.1.6 | Tests responsive | Vérification sur mobile (360px), tablette (768px), desktop (1280px+) | — |

### Sprint 3.2 — Conformité RGPD (S16-S17)

| # | Tâche | Détail | Réf. |
|---|-------|--------|------|
| 3.2.1 | PIA (Privacy Impact Assessment) | Rédaction de l'analyse d'impact. Données de santé = obligation Article 35 RGPD | Étape 3, G-02 |
| 3.2.2 | Registre des traitements | Documentation de chaque traitement : finalité, base légale, durée, destinataires | Étape 3, G-01 |
| 3.2.3 | Politique de confidentialité | Page complète : traitements, droits, DPO, cookies, hébergeur HDS | Étape 3, G-05 |
| 3.2.4 | Mentions légales | Éditeur, hébergeur, DPO, contact | — |
| 3.2.5 | Formulaire exercice des droits | Page permettant accès, rectification, suppression, portabilité | Étape 3, G-06 |
| 3.2.6 | Bandeau cookies | Consentement cookies analytiques (si Matomo utilisé). Pas de cookies tiers | Étape 3, G-04 |
| 3.2.7 | Export de données | Fonctionnel : ZIP (JSON + PDF) de toutes les données du membre | Étape 3, G-07 |
| 3.2.8 | Suppression de compte | Processus : confirmation → délai 7 jours → hard delete données privées → anonymisation contributions | Étape 3, G-08/G-10 |
| 3.2.9 | Journalisation consentements | Horodatage chaque consentement | Étape 3, G-09 |

### Sprint 3.3 — Performance, Audit & Déploiement (S17-S18)

| # | Tâche | Détail | Réf. |
|---|-------|--------|------|
| 3.3.1 | Audit Lighthouse | Score ≥ 90 sur les 4 catégories (Performance, A11y, SEO, Best Practices) | — |
| 3.3.2 | Audit sécurité externe | Pentest léger ou audit outillé (OWASP ZAP, nuclei). Correction des findings critiques/hautes | Étape 3 |
| 3.3.3 | Audit des dépendances | `npm audit` : 0 vulnérabilité critique/haute | Étape 3, D-02 |
| 3.3.4 | Scan Docker | Trivy sur les images Docker. 0 vulnérabilité critique | Étape 3, D-08 |
| 3.3.5 | Logs & monitoring | Logs d'auth + accès privé opérationnels. Alertes de sécurité configurées | Étape 3, L-01 à L-07 |
| 3.3.6 | Backup & restauration | Backup PostgreSQL automatique quotidien. Test de restauration réussi | — |
| 3.3.7 | Procédure d'incident | Document de réponse aux incidents (cf. Étape 3, §9) prêt et partagé avec l'équipe | Étape 3, §9 |
| 3.3.8 | Déploiement production | Mise en production sur hébergeur HDS. DNS configuré. Vérification HTTPS + headers | Étape 3, §6 |
| 3.3.9 | Smoke tests production | Vérification post-déploiement : inscription, connexion, chiffrement, données publiques | — |

### Livrables Phase 3

- [ ] Couverture tests ≥ 80% (unitaires + intégration)
- [ ] Tests E2E sur les parcours critiques
- [ ] PIA rédigée et validée
- [ ] Registre des traitements complet
- [ ] Pages légales publiées
- [ ] Audit sécurité passé (0 finding critique)
- [ ] Lighthouse ≥ 90
- [ ] Backup automatique + test de restauration
- [ ] Procédure d'incident documentée
- [ ] **Production live sur hébergeur HDS**

---

## Dépendances critiques

```
                 0.1.2 Setup Strapi ──────────► 1.1.x Content-Types
                                                      │
                 0.1.3 Setup Next.js ─────────► 1.2.x Pages publiques
                                                      │
                 0.2.3 Hébergeur HDS ─────────► 0.2.5 Staging ───────► 3.3.8 Production
                                                      │
                 1.1.x Content-Types ─────────► 2.4.x Content-Types privés
                                                      │
                                                      ▼
    2.1.x Authentification ───► 2.3.x Chiffrement ───► 2.4.x Middleware is-owner
                                      │                        │
                                      ▼                        ▼
                                2.5.x Carnet/Objectifs   2.6.x Autoéval/Dashboard
                                      │                        │
                                      └──────────┬─────────────┘
                                                  ▼
                                         3.1.x Tests
                                                  │
                                                  ▼
                                    3.2.x RGPD ──► 3.3.x Production
```

### Chemin critique

Le chemin le plus long (et donc le plus risqué) est :

**Setup Strapi → Content-Types → Auth → Chiffrement → Middleware is-owner → Carnet/Objectifs → Autoéval/Dashboard → Tests → RGPD → Production**

Tout retard sur la chaîne **Auth → Chiffrement → Middleware** retarde l'ensemble de la Phase 2.

---

## Risques & Mitigations

| # | Risque | Impact | Probabilité | Mitigation |
|---|--------|--------|-------------|------------|
| R1 | Complexité du chiffrement zero-knowledge | Élevé | Moyenne | Sprint dédié (2.3). POC crypto en Phase 0 si incertitude |
| R2 | Certification HDS de l'hébergeur | Bloquant | Faible | Choix d'un hébergeur déjà certifié (OVH, Scaleway). Vérification certificat avant commande |
| R3 | Performance du déchiffrement côté client | Moyen | Moyenne | Benchmarker PBKDF2 sur devices bas de gamme. Ajuster le nombre d'itérations si nécessaire (minimum 100k) |
| R4 | Perte de mot de passe utilisateur | Élevé | Haute | Code de récupération à l'inscription. UX d'avertissement claire |
| R5 | Complexité FullCalendar | Faible | Moyenne | Calendrier public MVP simplifié (vue liste + mois). Vue FullCalendar complète en post-MVP |
| R6 | Retard PIA | Bloquant | Moyenne | Commencer la rédaction PIA dès la Phase 1 (en parallèle). Ne pas attendre la Phase 3 |
| R7 | Volume de Content-Types Strapi | Moyen | Faible | Créer les Content-Types en batch (sprint 1.1 dédié). Utiliser les seed scripts pour valider rapidement |

---

## Équipe & Responsabilités suggérées

| Rôle | Responsabilité | Phases principales |
|------|----------------|-------------------|
| **Lead Dev Full-Stack** | Architecture, chiffrement, CI/CD, code reviews | Toutes |
| **Dev Frontend** | Composants React, pages, responsive, a11y | Phases 1-2 |
| **Dev Backend** | Content-Types Strapi, middleware, API, tests | Phases 1-2 |
| **UX/UI Designer** | Maquettes, design system, tests utilisateurs | Phases 0-1 |
| **Référent Sécurité / DPO** | PIA, registre traitements, audit, conformité | Phases 0-3 |

> **Configuration minimale** : 1 développeur full-stack peut réaliser le MVP seul, mais les phases seront séquentielles (doubler la durée à ~36 semaines). Avec 2-3 personnes, le planning de 18 semaines est tenable.

---

## Métriques de succès MVP

| Métrique | Cible | Mesure |
|----------|-------|--------|
| Lighthouse Performance | ≥ 90 | Lighthouse CI |
| Lighthouse Accessibility | ≥ 90 | Lighthouse CI |
| Couverture de tests | ≥ 80% | Jest + Vitest |
| Vulnérabilités critiques | 0 | npm audit + Trivy |
| Temps de chargement (LCP) | < 2.5s | Web Vitals |
| Tests d'isolation réussis | 100% | Tests auto |
| PIA validée | Oui | Document signé |
| Uptime staging (7 derniers jours) | ≥ 99% | Monitoring |

---

## Post-MVP — Fonctionnalités suivantes (par priorité)

| Priorité | Fonctionnalité | Sprint estimé |
|----------|---------------|---------------|
| 1 | Modération des contributions (workflow admin) | 2 sprints |
| 2 | Génération de documents PDF (plans de crise, fiches santé) | 2 sprints |
| 3 | Calendrier personnel + événements privés | 1 sprint |
| 4 | Profil de rétablissement (CHIME) + recommandations personnalisées | 2 sprints |
| 5 | Sync Google Agenda (OAuth2) | 1 sprint |
| 6 | Tutoriels interactifs (pas-à-pas) | 1 sprint |
| 7 | MFA (TOTP) | 1 sprint |
| 8 | Comparaison de 2 autoévaluations côte à côte | 1 sprint |
| 9 | PWA + Notifications push (rappels calendrier) | 2 sprints |
| 10 | Connexion sociale (France Connect, Google) | 1 sprint |

---

## Résumé

```
┌────────────────────────────────────────────────────────────────────┐
│                    ROADMAP MVP — 18 SEMAINES                       │
│                                                                    │
│  Phase 0 (S1-3)     Phase 1 (S4-8)     Phase 2 (S9-15)           │
│  ┌────────────┐     ┌────────────┐     ┌──────────────────┐      │
│  │ Fondations │ ──► │   Public   │ ──► │     Privé        │      │
│  │            │     │            │     │                  │      │
│  │ Infra      │     │ Blog       │     │ Auth + Crypto    │      │
│  │ CI/CD      │     │ Annuaire   │     │ Carnet + Goals   │      │
│  │ Sécurité   │     │ Agenda     │     │ Autoéval         │      │
│  │ HDS setup  │     │ SEO        │     │ Dashboard        │      │
│  └────────────┘     └────────────┘     └──────────────────┘      │
│                                               │                    │
│                                               ▼                    │
│                                        Phase 3 (S16-18)           │
│                                        ┌──────────────────┐      │
│                                        │  Stabilisation   │      │
│                                        │                  │      │
│                                        │  Tests & Audit   │      │
│                                        │  RGPD / PIA      │      │
│                                        │  Performance     │      │
│                                        │  PRODUCTION      │      │
│                                        └──────────────────┘      │
│                                                                    │
│  21 Content-Types · 60+ Composants · 62 exigences sécurité       │
│  Chiffrement zero-knowledge · Hébergement HDS certifié            │
└────────────────────────────────────────────────────────────────────┘
```
