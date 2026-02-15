# Étape 3 — Sécurité & Conformité HDS / RGPD

## Contexte réglementaire

| Cadre | Exigence | Impact sur Pairémancipation |
|-------|----------|----------------------------|
| **HDS** (Hébergeur de Données de Santé) | Hébergement certifié ISO 27001 + HDS pour toute donnée de santé à caractère personnel | Zone Privée obligatoirement hébergée chez un prestataire HDS |
| **RGPD** (Règlement Général sur la Protection des Données) | Consentement, minimisation, droit d'accès/suppression, PIA | Tout le système |
| **Référentiel de sécurité ASIP/ANS** | Bonnes pratiques e-santé (PGSSI-S) | Authentification, traçabilité, chiffrement |
| **ePrivacy** | Cookies, traceurs | Zone Publique (pas de cookies tiers) |

---

## 1. AUTHENTIFICATION & GESTION DES SESSIONS

### 1.1 Inscription & Connexion

| # | Exigence | Implémentation | Priorité |
|---|----------|----------------|----------|
| A-01 | Mots de passe robustes | Minimum 12 caractères, 1 majuscule, 1 chiffre, 1 spécial. Vérification côté serveur (Strapi policy) + côté client (Zod) | Critique |
| A-02 | Hachage des mots de passe | bcrypt avec coût ≥ 12 (par défaut dans Strapi users-permissions) | Critique |
| A-03 | Protection brute force | Rate limiting : max 5 tentatives / 15 min par IP + par email. Plugin `strapi-plugin-rate-limit` ou middleware custom | Critique |
| A-04 | Vérification email | Email de confirmation obligatoire à l'inscription (Strapi built-in) | Haute |
| A-05 | Réinitialisation mot de passe | Token à usage unique, expirant en 30 min, envoyé par email. Invalidation de l'ancien token à chaque nouvelle demande | Critique |
| A-06 | Détection de compromission | Vérification du mot de passe contre la base HaveIBeenPwned (API k-anonymity) à l'inscription et au changement | Moyenne |

### 1.2 Sessions & Tokens

| # | Exigence | Implémentation | Priorité |
|---|----------|----------------|----------|
| A-07 | JWT sécurisé | Access token : durée 15 min. Refresh token : durée 7 jours, rotation à chaque utilisation | Critique |
| A-08 | Stockage des tokens | Access token : mémoire JavaScript uniquement (Zustand store, jamais localStorage). Refresh token : cookie `HttpOnly`, `Secure`, `SameSite=Strict` | Critique |
| A-09 | Révocation de session | Table `user-session` en base pour invalider des refresh tokens. Bouton "Déconnecter toutes les sessions" dans les paramètres | Haute |
| A-10 | Déconnexion automatique | Inactivité > 30 min en zone privée → déconnexion + suppression clé de déchiffrement de la mémoire | Critique |
| A-11 | CSRF protection | Token CSRF sur toutes les mutations (POST/PUT/DELETE). Cookie `SameSite=Strict` comme mitigation supplémentaire | Critique |

### 1.3 Authentification renforcée (future)

| # | Exigence | Implémentation | Priorité |
|---|----------|----------------|----------|
| A-12 | MFA (Multi-Factor Authentication) | TOTP (Google Authenticator / Authy) via plugin Strapi ou custom. Optionnel pour les membres, recommandé | Moyenne (MVP+) |
| A-13 | Connexion sociale | OAuth2 uniquement si demandé (Google, France Connect). Attention : ne pas stocker de tokens OAuth en base non chiffrée | Basse (MVP+) |

---

## 2. CHIFFREMENT DES DONNÉES

### 2.1 Chiffrement en transit

| # | Exigence | Implémentation | Priorité |
|---|----------|----------------|----------|
| C-01 | HTTPS obligatoire | TLS 1.2+ sur toutes les connexions. Certificat Let's Encrypt ou fourni par l'hébergeur HDS. HSTS activé | Critique |
| C-02 | Redirection HTTP → HTTPS | Redirection 301 automatique. Header `Strict-Transport-Security: max-age=31536000; includeSubDomains` | Critique |
| C-03 | Communication API sécurisée | Strapi API accessible uniquement via HTTPS. Pas de requêtes en clair | Critique |

### 2.2 Chiffrement au repos (Zone Privée)

| # | Exigence | Implémentation | Priorité |
|---|----------|----------------|----------|
| C-04 | Chiffrement applicatif | AES-256-GCM pour les champs marqués 🔒 (cf. Étape 1) | Critique |
| C-05 | Dérivation de clé utilisateur | PBKDF2 (ou Argon2id) avec sel unique par utilisateur. 600 000 itérations minimum. La clé dérivée ne quitte jamais le navigateur | Critique |
| C-06 | Envelope encryption | Chaque utilisateur a une clé de données (DEK) chiffrée par sa clé dérivée (KEK). Permet la rotation sans re-chiffrer toutes les données | Haute |
| C-07 | Aucune clé en base | La clé de déchiffrement n'est jamais stockée côté serveur. Seul le navigateur du membre peut déchiffrer ses données | Critique |
| C-08 | Chiffrement disque | Chiffrement TDE (Transparent Data Encryption) au niveau PostgreSQL, fourni par l'hébergeur HDS | Critique |
| C-09 | Chiffrement des fichiers PDF | Les fichiers PDF générés stockés dans le media provider sont chiffrés avec la DEK de l'utilisateur avant upload | Haute |
| C-10 | Rotation de clés | Mécanisme de re-chiffrement lors du changement de mot de passe. L'ancienne DEK est re-wrappée avec la nouvelle KEK | Haute |

### 2.3 Schéma de chiffrement

```
┌──────────────────────────────────────────────────────────────┐
│                     NAVIGATEUR (Client)                      │
│                                                              │
│  Mot de passe ──► PBKDF2 ──► KEK (Key Encryption Key)      │
│                              │                               │
│                              ▼                               │
│                    Déchiffre la DEK wrappée                  │
│                              │                               │
│                              ▼                               │
│                    DEK (Data Encryption Key)                 │
│                              │                               │
│              ┌───────────────┼───────────────┐               │
│              ▼               ▼               ▼               │
│          Chiffre         Chiffre         Chiffre             │
│          notes           scores          documents           │
│              │               │               │               │
│              ▼               ▼               ▼               │
│         Données          Données         Données             │
│         chiffrées        chiffrées       chiffrées           │
│              │               │               │               │
└──────────────┼───────────────┼───────────────┼───────────────┘
               │               │               │
               ▼               ▼               ▼
┌──────────────────────────────────────────────────────────────┐
│                     SERVEUR (Strapi)                         │
│                                                              │
│  Stocke UNIQUEMENT :                                         │
│  - Données chiffrées (blobs opaques)                        │
│  - DEK wrappée (chiffrée par la KEK)                        │
│  - Sel PBKDF2 de l'utilisateur                              │
│  - NE POSSÈDE JAMAIS la KEK ni la DEK en clair             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 2.4 Conséquence critique : perte de mot de passe

> Si le membre perd son mot de passe ET n'a pas configuré de mécanisme de récupération, **ses données privées sont définitivement inaccessibles**. C'est un choix de sécurité délibéré (zero-knowledge).

**Mitigations :**
- Code de récupération (12 mots) généré à l'inscription → stocké par le membre hors plateforme
- Possibilité d'exporter ses données chiffrées (backup)
- Avertissement clair et répété dans l'UX

---

## 3. CONTRÔLE D'ACCÈS (RBAC)

### 3.1 Rôles Strapi

| Rôle | Zone Publique | Zone Membre | Zone Privée | Admin Strapi |
|------|---------------|-------------|-------------|--------------|
| **Public** (non connecté) | Lecture seule (articles, annuaire, agenda) | Aucun accès | Aucun accès | Aucun accès |
| **Authenticated** (membre) | Lecture seule | Créer contributions, éditer son profil | CRUD sur ses propres données uniquement | Aucun accès |
| **Contributor** (contributeur actif) | Lecture seule | Créer + éditer ses contributions | CRUD sur ses propres données | Aucun accès |
| **Moderator** (modérateur) | Lecture seule | Approuver/rejeter contributions, éditer contenus | CRUD sur ses propres données | Accès limité au panel modération |
| **Admin** | Tout | Tout | **Aucun accès aux données privées des autres** | Accès complet Strapi |

### 3.2 Règles d'isolation des données privées

| # | Règle | Implémentation | Priorité |
|---|-------|----------------|----------|
| R-01 | Isolation par propriétaire | Toute requête en zone privée est filtrée par `owner = currentUser.id`. Aucune exception, même pour les admins | Critique |
| R-02 | Policy Strapi systématique | Middleware `is-owner` appliqué sur toutes les routes `/api/personal-*`, `/api/self-assessment*`, `/api/generated-document*`, `/api/recovery-*` | Critique |
| R-03 | Pas de populate profond | Interdire `?populate=owner` sur les routes privées pour éviter la fuite de données utilisateur dans les réponses API | Haute |
| R-04 | Admin ne voit pas les données santé | Les rôles admin Strapi n'ont **pas** la permission `find`/`findOne` sur les Content-Types de la zone privée. Configuré dans les permissions Strapi | Critique |
| R-05 | Suppression en cascade | Lors de la suppression d'un compte, toutes les données privées sont supprimées de manière irréversible (hard delete, pas de soft delete) | Critique |
| R-06 | Logs d'accès | Chaque accès à une donnée privée est journalisé (userId, contentType, action, timestamp). Logs stockés séparément, non modifiables | Haute |

### 3.3 Implémentation du middleware `is-owner` (Strapi)

```javascript
// src/middlewares/is-owner.js — Pseudo-code
module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Authentification requise');

    // Pour les requêtes GET avec ID
    if (ctx.params.id) {
      const entity = await strapi.entityService.findOne(contentType, ctx.params.id);
      if (entity.owner?.id !== user.id) {
        return ctx.forbidden('Accès non autorisé');
      }
    }

    // Pour les requêtes LIST : forcer le filtre owner
    if (ctx.request.method === 'GET' && !ctx.params.id) {
      ctx.query.filters = {
        ...(ctx.query.filters || {}),
        owner: user.id,
      };
    }

    // Pour CREATE : forcer le owner
    if (ctx.request.method === 'POST') {
      ctx.request.body.data = {
        ...(ctx.request.body.data || {}),
        owner: user.id,
      };
    }

    await next();
  };
};
```

---

## 4. SÉCURITÉ APPLICATIVE (OWASP)

### 4.1 Injection & XSS

| # | Risque | Mitigation | Priorité |
|---|--------|------------|----------|
| S-01 | XSS (Cross-Site Scripting) | React échappe par défaut. Interdire `dangerouslySetInnerHTML`. Sanitiser le Rich Text Strapi avec DOMPurify avant rendu | Critique |
| S-02 | SQL Injection | Strapi utilise Knex.js (requêtes paramétrées). Ne jamais écrire de requêtes SQL brutes. Valider les inputs avec Zod | Critique |
| S-03 | NoSQL Injection | Valider et typer tous les filtres de requêtes API (pas de `$where`, `$regex` non contrôlés dans les query params) | Haute |
| S-04 | CSRF | Token CSRF + cookie `SameSite=Strict` (cf. A-11) | Critique |
| S-05 | Clickjacking | Header `X-Frame-Options: DENY` + `Content-Security-Policy: frame-ancestors 'none'` | Haute |

### 4.2 Headers de sécurité HTTP

| Header | Valeur | Rôle |
|--------|--------|------|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Force HTTPS |
| `X-Content-Type-Options` | `nosniff` | Empêche le MIME sniffing |
| `X-Frame-Options` | `DENY` | Anti-clickjacking |
| `X-XSS-Protection` | `0` (désactivé, confiance au CSP) | Legacy |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limite les fuites de referrer |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(self)` | Limite les APIs navigateur |
| `Content-Security-Policy` | Voir détail ci-dessous | Politique de sécurité du contenu |

### 4.3 Content Security Policy (CSP)

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-{random}';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https://*.tile.openstreetmap.org;
  font-src 'self';
  connect-src 'self' https://api.pairemancipation.fr;
  frame-src 'none';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  upgrade-insecure-requests;
```

### 4.4 Sécurité des uploads

| # | Exigence | Implémentation | Priorité |
|---|----------|----------------|----------|
| S-06 | Validation MIME type | Vérification côté serveur du magic number du fichier (pas seulement l'extension) | Critique |
| S-07 | Limite de taille | Max 5 Mo par fichier (images), 20 Mo (PDF). Configurable dans Strapi `plugins.upload` | Haute |
| S-08 | Types autorisés | Images : `jpg, png, webp, avif`. Documents : `pdf` uniquement. Pas de fichiers exécutables | Critique |
| S-09 | Stockage isolé | Les fichiers uploadés par les membres (avatars, contributions) sont séparés des fichiers privés (PDF générés) | Haute |
| S-10 | Pas d'exécution | Headers `Content-Disposition: attachment` sur tous les fichiers servis. Pas de rendu inline de fichiers non vérifiés | Haute |

---

## 5. CONFORMITÉ RGPD

### 5.1 Principes appliqués

| Principe RGPD | Application concrète |
|----------------|---------------------|
| **Minimisation** | Ne collecter que les données strictement nécessaires. Pas de nom réel obligatoire (pseudo accepté) |
| **Consentement** | Consentement explicite à l'inscription (case non pré-cochée). Consentement séparé pour chaque usage |
| **Limitation de finalité** | Les données privées ne servent qu'au membre. Aucune analyse, profilage commercial ou partage |
| **Durée de conservation** | Données actives : durée du compte. Données supprimées : effacement sous 30 jours max |
| **Portabilité** | Export de toutes les données personnelles au format JSON + PDF (Article 20) |
| **Droit à l'oubli** | Suppression complète du compte et de toutes les données associées (Article 17) |

### 5.2 Checklist d'implémentation RGPD

| # | Exigence | Implémentation | Priorité |
|---|----------|----------------|----------|
| G-01 | Registre des traitements | Document maintenu décrivant chaque traitement de données personnelles | Critique (légal) |
| G-02 | PIA (Privacy Impact Assessment) | Analyse d'impact obligatoire car données de santé (Article 35). À réaliser avant la mise en production | Critique (légal) |
| G-03 | DPO (Délégué à la Protection des Données) | Désignation obligatoire ou externalisation. Contact affiché sur la plateforme | Critique (légal) |
| G-04 | Bandeau cookies | Consentement cookies analytiques (si utilisés). Pas de cookies tiers (pas Google Analytics → Matomo self-hosted ou rien) | Haute |
| G-05 | Page politique de confidentialité | Description claire et accessible des traitements, droits, contacts | Critique |
| G-06 | Formulaire d'exercice des droits | Page permettant au membre de demander accès, rectification, suppression, portabilité | Haute |
| G-07 | Export des données (portabilité) | Bouton dans Paramètres : génère un ZIP (JSON + PDF) de toutes les données du membre | Haute |
| G-08 | Suppression de compte | Processus en 2 étapes : confirmation + délai de grâce de 7 jours (annulable) puis hard delete | Haute |
| G-09 | Journalisation des consentements | Horodatage et versionnement de chaque consentement donné | Haute |
| G-10 | Anonymisation des contributions | Lors de la suppression du compte, les contributions approuvées restent visibles mais l'auteur est remplacé par "Membre supprimé" | Moyenne |
| G-11 | Notification de violation | Procédure de notification CNIL sous 72h en cas de fuite de données. Procédure documentée | Critique (légal) |

---

## 6. HÉBERGEMENT HDS — Exigences

### 6.1 Périmètre HDS

| Donnée | Hébergement HDS obligatoire ? | Raison |
|--------|-------------------------------|--------|
| Articles de blog, annuaire, événements | Non | Données publiques, non personnelles |
| Profil contributeur (pseudo, avatar) | Non | Données personnelles non sensibles |
| Carnet de bord, notes, humeur | **Oui** | Données de santé à caractère personnel |
| Autoévaluations (réponses, scores) | **Oui** | Données de santé |
| Objectifs de rétablissement | **Oui** | Données liées au parcours de soin |
| Documents générés (plans de crise, etc.) | **Oui** | Données de santé |
| Calendrier personnel (si RDV médicaux) | **Oui** | Potentiellement données de santé |
| Profil de rétablissement | **Oui** | Données de santé |

### 6.2 Options d'architecture d'hébergement

#### Option A : Tout chez un hébergeur HDS (Recommandée pour le MVP)

```
┌─────────────────────────────────────────┐
│         Hébergeur HDS certifié          │
│  (ex: OVH Healthcare, Scaleway HDS,    │
│   Clever Cloud HDS, Outscale)           │
│                                         │
│  ┌──────────┐  ┌──────────┐            │
│  │  Strapi   │  │  Next.js │            │
│  │  (API)    │  │  (Front) │            │
│  └────┬──────┘  └──────────┘            │
│       │                                  │
│  ┌────▼──────────────────────┐          │
│  │  PostgreSQL               │          │
│  │  ┌─────────┐ ┌──────────┐│          │
│  │  │ public  │ │ private  ││          │
│  │  │ schema  │ │ _health  ││          │
│  │  └─────────┘ └──────────┘│          │
│  └───────────────────────────┘          │
└─────────────────────────────────────────┘
```

**Avantages** : Simple, un seul prestataire, conformité totale.
**Inconvénients** : Coût plus élevé (même les données publiques sont en HDS).

#### Option B : Architecture hybride (Optimisation coût)

```
┌──────────────────────┐     ┌──────────────────────┐
│  Hébergeur standard  │     │   Hébergeur HDS      │
│                      │     │                      │
│  ┌────────┐          │     │  ┌────────────────┐  │
│  │Next.js │          │     │  │ Strapi (API    │  │
│  │(Front) │          │     │  │  privée)       │  │
│  └────────┘          │     │  └───────┬────────┘  │
│                      │     │          │            │
│  ┌────────────────┐  │     │  ┌───────▼────────┐  │
│  │ Strapi (API    │  │     │  │  PostgreSQL    │  │
│  │  publique)     │  │     │  │  private_health│  │
│  └───────┬────────┘  │     │  └────────────────┘  │
│          │           │     │                      │
│  ┌───────▼────────┐  │     └──────────────────────┘
│  │  PostgreSQL    │  │
│  │  public schema │  │
│  └────────────────┘  │
└──────────────────────┘
```

**Avantages** : Coût optimisé, données publiques servies rapidement.
**Inconvénients** : Complexité opérationnelle, deux infras à maintenir.

> **Recommandation : Option A pour le MVP.** La simplicité et la conformité l'emportent sur l'optimisation des coûts à ce stade.

### 6.3 Hébergeurs HDS compatibles (France)

| Hébergeur | Certifié HDS | Offre compatible | Note |
|-----------|--------------|-------------------|------|
| OVH Cloud (Healthcare) | Oui | Hosted Private Cloud, Public Cloud | Leader français |
| Scaleway (Dedibox HDS) | Oui | Serveurs dédiés | Bon rapport qualité/prix |
| Outscale (3DS) | Oui | Cloud IaaS | Souverain |
| Clever Cloud | Oui (via partenaire) | PaaS | Simplicité de déploiement |
| Azure (régions France) | Oui | App Service, Azure DB | Hyperscaler |

---

## 7. JOURNALISATION & AUDIT

| # | Exigence | Implémentation | Priorité |
|---|----------|----------------|----------|
| L-01 | Logs d'authentification | Connexions réussies/échouées, changements de mot de passe, déconnexions | Critique |
| L-02 | Logs d'accès aux données privées | Chaque lecture/écriture sur la zone privée (userId, action, contentType, timestamp) | Critique |
| L-03 | Logs d'administration | Actions des modérateurs et admins sur le contenu | Haute |
| L-04 | Logs immuables | Les logs sont écrits en append-only. Aucune suppression ni modification possible | Critique |
| L-05 | Rétention des logs | 12 mois minimum (exigence HDS), 36 mois recommandé | Critique |
| L-06 | Séparation des logs | Les logs sont stockés dans un système séparé de la base de données applicative (ex: service de log dédié, fichier séparé) | Haute |
| L-07 | Alertes de sécurité | Notification en cas de : 5+ tentatives échouées, accès admin inhabituel, export de données massif | Haute |

---

## 8. SÉCURITÉ DU DÉVELOPPEMENT

### 8.1 Pratiques de code

| # | Exigence | Outil/Méthode | Priorité |
|---|----------|---------------|----------|
| D-01 | Analyse statique de sécurité | ESLint plugin `eslint-plugin-security` + `eslint-plugin-no-unsanitized` | Haute |
| D-02 | Audit des dépendances | `npm audit` en CI/CD. Aucune vulnérabilité critique ou haute tolérée | Critique |
| D-03 | Dépendances à jour | Dependabot ou Renovate pour les mises à jour automatiques | Haute |
| D-04 | Secrets hors du code | Variables d'environnement via `.env` (jamais commité). Validation au démarrage via Zod | Critique |
| D-05 | Revue de code | Toute PR doit être revue avant merge. Focus sécurité sur les routes privées | Haute |
| D-06 | Tests de sécurité | Tests automatisés vérifiant l'isolation des données (un user ne peut pas accéder aux données d'un autre) | Critique |

### 8.2 CI/CD sécurisé

| # | Exigence | Implémentation | Priorité |
|---|----------|----------------|----------|
| D-07 | Pipeline sécurisé | Secrets injectés via le CI (GitHub Secrets / GitLab CI Variables), jamais en clair dans le pipeline | Critique |
| D-08 | Scan d'images Docker | Trivy ou Snyk sur les images Docker avant déploiement | Haute |
| D-09 | Environnements séparés | `development` (données fictives) → `staging` (données anonymisées) → `production` (HDS). Aucune donnée réelle en dev/staging | Critique |
| D-10 | Déploiement bleu-vert | Zero-downtime deployment pour éviter les interruptions de service | Moyenne |

### 8.3 Gestion des variables d'environnement

```bash
# .env.example — Template (commité dans le repo)
# === Strapi ===
STRAPI_HOST=0.0.0.0
STRAPI_PORT=1337
STRAPI_URL=https://api.pairemancipation.fr

# === Base de données ===
DATABASE_HOST=
DATABASE_PORT=5432
DATABASE_NAME=
DATABASE_USERNAME=
DATABASE_PASSWORD=          # Secret — minimum 32 caractères aléatoires
DATABASE_SSL=true

# === JWT ===
JWT_SECRET=                 # Secret — minimum 64 caractères aléatoires
JWT_EXPIRATION=15m
REFRESH_TOKEN_EXPIRATION=7d

# === Chiffrement ===
PBKDF2_ITERATIONS=600000
ENCRYPTION_ALGORITHM=aes-256-gcm

# === Email ===
SMTP_HOST=
SMTP_PORT=587
SMTP_USERNAME=
SMTP_PASSWORD=              # Secret

# === Next.js ===
NEXT_PUBLIC_STRAPI_URL=https://api.pairemancipation.fr
NEXT_PUBLIC_SITE_URL=https://pairemancipation.fr

# === Google Calendar (optionnel) ===
GOOGLE_CALENDAR_CLIENT_ID=
GOOGLE_CALENDAR_CLIENT_SECRET=  # Secret
```

---

## 9. PLAN DE RÉPONSE AUX INCIDENTS

| Étape | Action | Délai | Responsable |
|-------|--------|-------|-------------|
| 1. Détection | Alerte automatique ou signalement | Immédiat | Système / Équipe |
| 2. Confinement | Isolation du système affecté, révocation des tokens compromis | < 1 heure | Équipe technique |
| 3. Évaluation | Déterminer la nature et l'étendue de la violation | < 4 heures | Équipe technique + DPO |
| 4. Notification CNIL | Si données personnelles compromises | < 72 heures | DPO |
| 5. Notification utilisateurs | Si risque élevé pour les droits et libertés | Sans délai après évaluation | DPO + Direction |
| 6. Remédiation | Correction de la vulnérabilité, renforcement | Variable | Équipe technique |
| 7. Post-mortem | Analyse des causes, mise à jour des procédures | < 2 semaines | Toute l'équipe |

---

## 10. RÉCAPITULATIF — MATRICE DE CRITICITÉ

| Catégorie | Critiques | Hautes | Moyennes | Total |
|-----------|-----------|--------|----------|-------|
| Authentification | 6 | 2 | 2 | 10 |
| Chiffrement | 6 | 3 | 0 | 9 |
| RBAC / Accès | 4 | 2 | 0 | 6 |
| OWASP / Applicatif | 3 | 2 | 0 | 5 |
| Upload | 2 | 3 | 0 | 5 |
| RGPD | 4 | 5 | 1 | 10 |
| Journalisation | 4 | 3 | 0 | 7 |
| Développement | 4 | 4 | 2 | 10 |
| **TOTAL** | **33** | **24** | **5** | **62** |

> **33 exigences critiques** doivent être satisfaites avant la mise en production.
> Les 24 exigences hautes doivent être planifiées dans les sprints suivant le MVP.
