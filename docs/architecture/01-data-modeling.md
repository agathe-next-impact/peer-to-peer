# Étape 1 — Modélisation des Données (Strapi)

## Principes fondamentaux

### Séparation des zones de données

| Zone | Niveau de sensibilité | Stockage | Chiffrement |
|------|-----------------------|----------|-------------|
| **Publique** | Aucune donnée personnelle | PostgreSQL standard | Non requis |
| **Membre** (collaboratif) | Données pseudo-anonymisées | PostgreSQL standard | En transit (TLS) |
| **Privée** (confidentiel) | Données de santé (HDS) | PostgreSQL isolé ou schéma dédié | Au repos (AES-256) + en transit (TLS) |

### Convention de nommage
- Collections : `kebab-case` au pluriel (ex: `blog-articles`)
- Champs : `camelCase` (convention Strapi)
- Relations : préfixées par le type (`author`, `members`, `relatedArticles`)

---

## ZONE PUBLIQUE — Content-Types

### 1. `blog-article` (Collection Type)

| Champ | Type | Description | Requis |
|-------|------|-------------|--------|
| `title` | String | Titre de l'article | Oui |
| `slug` | UID (basé sur title) | URL-friendly identifier | Oui |
| `excerpt` | Text | Résumé court (160 car.) | Oui |
| `content` | Rich Text (Blocks) | Corps de l'article (Strapi Blocks) | Oui |
| `coverImage` | Media (single) | Image de couverture | Non |
| `category` | Relation → `blog-category` (many-to-one) | Catégorie principale | Oui |
| `tags` | Relation → `tag` (many-to-many) | Tags transversaux | Non |
| `author` | Relation → `contributor-profile` (many-to-one) | Auteur/contributeur | Oui |
| `status` | Enumeration [`draft`, `in_review`, `published`, `archived`] | Workflow éditorial | Oui |
| `publishedAt` | DateTime | Date de publication | Auto |
| `seoMeta` | Component (`shared.seo-meta`) | Métadonnées SEO | Non |

### 2. `blog-category` (Collection Type)

| Champ | Type | Description | Requis |
|-------|------|-------------|--------|
| `name` | String | Nom de la catégorie | Oui |
| `slug` | UID | Identifiant URL | Oui |
| `description` | Text | Description courte | Non |
| `icon` | String | Nom d'icône (ex: Lucide) | Non |

### 3. `tag` (Collection Type)

| Champ | Type | Description | Requis |
|-------|------|-------------|--------|
| `name` | String (unique) | Libellé du tag | Oui |
| `slug` | UID | Identifiant URL | Oui |

### 4. `knowledge-base-entry` (Collection Type)

| Champ | Type | Description | Requis |
|-------|------|-------------|--------|
| `title` | String | Titre de la ressource | Oui |
| `slug` | UID | Identifiant URL | Oui |
| `content` | Rich Text (Blocks) | Contenu éducatif | Oui |
| `category` | Relation → `knowledge-category` (many-to-one) | Catégorie | Oui |
| `tags` | Relation → `tag` (many-to-many) | Tags | Non |
| `difficulty` | Enumeration [`beginner`, `intermediate`, `advanced`] | Niveau | Non |
| `coverImage` | Media | Illustration | Non |
| `seoMeta` | Component (`shared.seo-meta`) | SEO | Non |

### 5. `knowledge-category` (Collection Type)

| Champ | Type | Description | Requis |
|-------|------|-------------|--------|
| `name` | String | Nom | Oui |
| `slug` | UID | Identifiant URL | Oui |
| `description` | Text | Description | Non |
| `parentCategory` | Relation → self (many-to-one) | Hiérarchie | Non |

### 6. `tutorial` (Collection Type)

| Champ | Type | Description | Requis |
|-------|------|-------------|--------|
| `title` | String | Titre du tutoriel | Oui |
| `slug` | UID | Identifiant URL | Oui |
| `description` | Text | Description courte | Oui |
| `steps` | Component (repeatable) `tutorial.step` | Étapes du tuto | Oui |
| `category` | Relation → `knowledge-category` (many-to-one) | Catégorie | Non |
| `tags` | Relation → `tag` (many-to-many) | Tags | Non |
| `coverImage` | Media | Image | Non |

### 7. `structure` (Collection Type) — Annuaire

| Champ | Type | Description | Requis |
|-------|------|-------------|--------|
| `name` | String | Nom de la structure | Oui |
| `slug` | UID | Identifiant URL | Oui |
| `type` | Enumeration [`public`, `association`, `private`, `community`] | Type | Oui |
| `description` | Rich Text (Blocks) | Présentation | Oui |
| `address` | Component (`location.address`) | Adresse postale | Oui |
| `coordinates` | Component (`location.coordinates`) | Lat/Lng pour carte | Oui |
| `phone` | String | Téléphone | Non |
| `email` | Email | Email de contact | Non |
| `website` | String | URL du site web | Non |
| `openingHours` | Component (repeatable) `schedule.opening-slot` | Horaires | Non |
| `services` | Relation → `service-type` (many-to-many) | Services proposés | Non |
| `coverImage` | Media | Photo/logo | Non |
| `isVerified` | Boolean | Vérifié par l'équipe | Oui (défaut: false) |
| `submittedBy` | Relation → `contributor-profile` (many-to-one) | Contributeur | Non |

### 8. `service-type` (Collection Type)

| Champ | Type | Description | Requis |
|-------|------|-------------|--------|
| `name` | String | Nom du service | Oui |
| `slug` | UID | Identifiant | Oui |
| `icon` | String | Icône | Non |

### 9. `event` (Collection Type) — Agenda

| Champ | Type | Description | Requis |
|-------|------|-------------|--------|
| `title` | String | Titre de l'événement | Oui |
| `slug` | UID | Identifiant URL | Oui |
| `description` | Rich Text (Blocks) | Description complète | Oui |
| `startDate` | DateTime | Date/heure de début | Oui |
| `endDate` | DateTime | Date/heure de fin | Non |
| `isAllDay` | Boolean | Événement journée entière | Non |
| `location` | Component (`location.address`) | Lieu physique | Non |
| `isOnline` | Boolean | Événement en ligne | Non |
| `onlineLink` | String | Lien visio/stream | Non |
| `eventType` | Enumeration [`workshop`, `conference`, `meetup`, `support_group`, `training`, `other`] | Type | Oui |
| `organizer` | String | Organisateur | Non |
| `structure` | Relation → `structure` (many-to-one) | Structure liée | Non |
| `coverImage` | Media | Affiche/illustration | Non |
| `tags` | Relation → `tag` (many-to-many) | Tags | Non |
| `submittedBy` | Relation → `contributor-profile` (many-to-one) | Contributeur | Non |
| `status` | Enumeration [`draft`, `in_review`, `published`, `cancelled`] | Statut | Oui |

### 10. `news-item` (Collection Type) — Actualités

| Champ | Type | Description | Requis |
|-------|------|-------------|--------|
| `title` | String | Titre | Oui |
| `slug` | UID | Identifiant URL | Oui |
| `excerpt` | Text | Résumé | Oui |
| `content` | Rich Text (Blocks) | Contenu | Oui |
| `source` | String | Source externe (URL) | Non |
| `coverImage` | Media | Image | Non |
| `tags` | Relation → `tag` (many-to-many) | Tags | Non |
| `publishedAt` | DateTime | Date publication | Auto |

---

## ZONE MEMBRE (Collaboratif) — Content-Types

### 11. `contributor-profile` (Collection Type)

> Profil public du membre contributeur, séparé du compte utilisateur (user de Strapi).

| Champ | Type | Description | Requis |
|-------|------|-------------|--------|
| `displayName` | String | Nom/pseudo affiché | Oui |
| `bio` | Text | Biographie courte | Non |
| `avatar` | Media (single) | Photo de profil | Non |
| `user` | Relation → `plugin::users-permissions.user` (one-to-one) | Lien au compte Strapi | Oui |
| `role` | Enumeration [`member`, `contributor`, `moderator`, `peer_helper`] | Rôle communautaire | Oui |
| `contributions` | Relation → `contribution` (one-to-many) | Historique contributions | Auto |
| `joinedAt` | Date | Date d'inscription | Auto |

### 12. `contribution` (Collection Type)

> Toute soumission de contenu par un membre (avant modération).

| Champ | Type | Description | Requis |
|-------|------|-------------|--------|
| `type` | Enumeration [`structure`, `event`, `resource`, `blog_article`, `correction`] | Type de contribution | Oui |
| `title` | String | Titre/sujet | Oui |
| `data` | JSON | Données structurées de la contribution | Oui |
| `status` | Enumeration [`pending`, `approved`, `rejected`, `revision_needed`] | Statut modération | Oui |
| `moderationNote` | Text | Note du modérateur | Non |
| `contributor` | Relation → `contributor-profile` (many-to-one) | Auteur | Oui |
| `relatedContent` | String | Référence au contenu cible (type:id) | Non |

---

## ZONE PRIVÉE (Données de Santé — Chiffrement obligatoire) — Content-Types

> **ATTENTION** : Tous les champs marqués 🔒 doivent être chiffrés au repos via AES-256-GCM.
> Ces Content-Types sont isolés dans un schéma PostgreSQL dédié (`private_health`)
> ou une base de données séparée selon la stratégie HDS retenue.

### 13. `personal-notebook` (Collection Type) — Carnet de bord

| Champ | Type | Description | Requis | Chiffré |
|-------|------|-------------|--------|---------|
| `owner` | Relation → `plugin::users-permissions.user` (many-to-one) | Propriétaire | Oui | Non |
| `title` | String | Titre de la note | Oui | 🔒 Oui |
| `content` | Text (long) | Corps de la note | Oui | 🔒 Oui |
| `mood` | Enumeration [`very_bad`, `bad`, `neutral`, `good`, `very_good`] | Humeur associée | Non | 🔒 Oui |
| `tags` | JSON | Tags personnels (array de strings) | Non | Non |
| `date` | Date | Date de la note | Oui | Non |
| `createdAt` | DateTime | — | Auto | Non |
| `updatedAt` | DateTime | — | Auto | Non |

### 14. `personal-goal` (Collection Type) — Objectifs

| Champ | Type | Description | Requis | Chiffré |
|-------|------|-------------|--------|---------|
| `owner` | Relation → user (many-to-one) | Propriétaire | Oui | Non |
| `title` | String | Intitulé de l'objectif | Oui | 🔒 Oui |
| `description` | Text | Détail | Non | 🔒 Oui |
| `horizon` | Enumeration [`short_term`, `medium_term`, `long_term`] | Échéance | Oui | Non |
| `status` | Enumeration [`not_started`, `in_progress`, `completed`, `abandoned`] | Statut | Oui | Non |
| `progress` | Integer (0-100) | Pourcentage progression | Non | Non |
| `targetDate` | Date | Date cible | Non | Non |
| `milestones` | Component (repeatable) `goal.milestone` | Jalons intermédiaires | Non | 🔒 Oui |
| `createdAt` | DateTime | — | Auto | Non |

### 15. `self-assessment` (Collection Type) — Autoévaluation

| Champ | Type | Description | Requis | Chiffré |
|-------|------|-------------|--------|---------|
| `owner` | Relation → user (many-to-one) | Propriétaire | Oui | Non |
| `template` | Relation → `assessment-template` (many-to-one) | Modèle utilisé | Oui | Non |
| `date` | DateTime | Date de passation | Oui | Non |
| `responses` | JSON | Réponses structurées `{questionId, value}[]` | Oui | 🔒 Oui |
| `scores` | JSON | Scores calculés `{dimensionId, score, maxScore}[]` | Oui | 🔒 Oui |
| `globalScore` | Decimal | Score global normalisé (0-100) | Non | 🔒 Oui |
| `personalNote` | Text | Commentaire libre du membre | Non | 🔒 Oui |

### 16. `assessment-template` (Collection Type) — Modèles d'évaluation

> Données **non sensibles** : ce sont les questionnaires vierges (pas les réponses).

| Champ | Type | Description | Requis |
|-------|------|-------------|--------|
| `name` | String | Nom du questionnaire | Oui |
| `slug` | UID | Identifiant | Oui |
| `description` | Text | Explication du questionnaire | Oui |
| `version` | String | Version (semver) | Oui |
| `dimensions` | Component (repeatable) `assessment.dimension` | Dimensions évaluées | Oui |
| `questions` | Component (repeatable) `assessment.question` | Questions | Oui |
| `scoringMethod` | Enumeration [`sum`, `average`, `weighted`, `custom`] | Méthode de calcul | Oui |
| `isActive` | Boolean | Disponible pour les membres | Oui |

### 17. `generated-document` (Collection Type) — Documents générés

| Champ | Type | Description | Requis | Chiffré |
|-------|------|-------------|--------|---------|
| `owner` | Relation → user (many-to-one) | Propriétaire | Oui | Non |
| `template` | Relation → `document-template` (many-to-one) | Modèle utilisé | Oui | Non |
| `title` | String | Titre du document | Oui | 🔒 Oui |
| `generatedData` | JSON | Données saisies par le membre | Oui | 🔒 Oui |
| `pdfFile` | Media (single) | Fichier PDF généré | Non | 🔒 Oui (fichier chiffré) |
| `generatedAt` | DateTime | Date de génération | Auto | Non |

### 18. `document-template` (Collection Type) — Modèles de documents

> Non sensible : structure vierge du document.

| Champ | Type | Description | Requis |
|-------|------|-------------|--------|
| `name` | String | Nom du modèle | Oui |
| `slug` | UID | Identifiant | Oui |
| `description` | Text | Description | Oui |
| `category` | Enumeration [`medical_report`, `personal_plan`, `crisis_plan`, `wellness_plan`, `other`] | Catégorie | Oui |
| `fields` | JSON | Schéma des champs `{id, label, type, required, options}[]` | Oui |
| `pdfTemplate` | Media | Template PDF/HTML | Oui |
| `isActive` | Boolean | Disponible | Oui |

### 19. `personal-calendar-event` (Collection Type) — Calendrier personnel

| Champ | Type | Description | Requis | Chiffré |
|-------|------|-------------|--------|---------|
| `owner` | Relation → user (many-to-one) | Propriétaire | Oui | Non |
| `title` | String | Titre | Oui | 🔒 Oui |
| `description` | Text | Description | Non | 🔒 Oui |
| `startDate` | DateTime | Début | Oui | Non |
| `endDate` | DateTime | Fin | Non | Non |
| `isAllDay` | Boolean | Journée entière | Non | Non |
| `eventType` | Enumeration [`appointment`, `medication`, `activity`, `goal_milestone`, `custom`] | Type | Non | Non |
| `reminder` | JSON | Config rappel `{minutesBefore, method}` | Non | Non |
| `googleEventId` | String | ID Google Agenda (sync) | Non | Non |
| `recurrence` | JSON | Règle de récurrence (RFC 5545) | Non | Non |

### 20. `recovery-profile` (Collection Type) — Profil de rétablissement

| Champ | Type | Description | Requis | Chiffré |
|-------|------|-------------|--------|---------|
| `owner` | Relation → user (one-to-one) | Propriétaire | Oui | Non |
| `selfDeterminedNeeds` | JSON | Besoins auto-identifiés `{needId, priority}[]` | Non | 🔒 Oui |
| `strengths` | JSON | Forces identifiées | Non | 🔒 Oui |
| `recoveryStage` | Enumeration [`moratorium`, `awareness`, `preparation`, `rebuilding`, `growth`] | Étape CHIME | Non | 🔒 Oui |
| `preferences` | JSON | Préférences de contenu/parcours | Non | 🔒 Oui |
| `lastUpdated` | DateTime | Dernière mise à jour | Auto | Non |

### 21. `recovery-recommendation` (Collection Type) — Recommandations

> Générées par le système en fonction du `recovery-profile`.

| Champ | Type | Description | Requis | Chiffré |
|-------|------|-------------|--------|---------|
| `owner` | Relation → user (many-to-one) | Destinataire | Oui | Non |
| `type` | Enumeration [`article`, `tutorial`, `event`, `structure`, `assessment`, `goal_suggestion`] | Type de ressource | Oui | Non |
| `targetContentType` | String | Content-Type cible | Oui | Non |
| `targetContentId` | Integer | ID du contenu recommandé | Oui | Non |
| `reason` | Text | Explication de la recommandation | Non | Non |
| `relevanceScore` | Decimal | Score de pertinence (0-1) | Non | Non |
| `isViewed` | Boolean | Consultée | Oui | Non |
| `isDismissed` | Boolean | Masquée par l'utilisateur | Oui | Non |

---

## COMPOSANTS PARTAGÉS (Strapi Components)

### `shared.seo-meta`

| Champ | Type | Description |
|-------|------|-------------|
| `metaTitle` | String | Titre SEO |
| `metaDescription` | Text | Description SEO (160 car.) |
| `ogImage` | Media | Image Open Graph |
| `canonicalUrl` | String | URL canonique |

### `location.address`

| Champ | Type | Description |
|-------|------|-------------|
| `street` | String | Rue |
| `postalCode` | String | Code postal |
| `city` | String | Ville |
| `department` | String | Département |
| `region` | String | Région |
| `country` | String (défaut: "France") | Pays |

### `location.coordinates`

| Champ | Type | Description |
|-------|------|-------------|
| `latitude` | Decimal | Latitude |
| `longitude` | Decimal | Longitude |

### `schedule.opening-slot`

| Champ | Type | Description |
|-------|------|-------------|
| `dayOfWeek` | Enumeration [`monday`..`sunday`] | Jour |
| `openTime` | Time | Heure ouverture |
| `closeTime` | Time | Heure fermeture |
| `note` | String | Note (ex: "Sur RDV") |

### `tutorial.step`

| Champ | Type | Description |
|-------|------|-------------|
| `order` | Integer | Numéro d'étape |
| `title` | String | Titre de l'étape |
| `content` | Rich Text | Instructions |
| `image` | Media | Capture/illustration |

### `goal.milestone`

| Champ | Type | Description |
|-------|------|-------------|
| `title` | String | Intitulé du jalon |
| `isCompleted` | Boolean | Atteint ? |
| `completedAt` | DateTime | Date d'atteinte |
| `note` | Text | Commentaire |

### `assessment.dimension`

| Champ | Type | Description |
|-------|------|-------------|
| `dimensionId` | String (unique) | Identifiant technique |
| `name` | String | Nom (ex: "Bien-être émotionnel") |
| `description` | Text | Explication |
| `weight` | Decimal | Poids dans le scoring |

### `assessment.question`

| Champ | Type | Description |
|-------|------|-------------|
| `questionId` | String (unique) | Identifiant technique |
| `text` | Text | Énoncé de la question |
| `type` | Enumeration [`likert_5`, `likert_7`, `yes_no`, `numeric`, `text`] | Type de réponse |
| `dimension` | String | Réf. à la dimension |
| `order` | Integer | Ordre d'affichage |
| `isRequired` | Boolean | Obligatoire |

---

## SINGLE TYPES (Pages & Configuration)

### `homepage` (Single Type)

| Champ | Type | Description |
|-------|------|-------------|
| `heroTitle` | String | Titre principal |
| `heroSubtitle` | Text | Sous-titre |
| `heroImage` | Media | Image héro |
| `featuredArticles` | Relation → `blog-article` (one-to-many) | Articles mis en avant |
| `featuredEvents` | Relation → `event` (one-to-many) | Événements mis en avant |
| `ctaText` | String | Texte du bouton CTA |
| `ctaLink` | String | Lien du CTA |

### `about-page` (Single Type)

| Champ | Type | Description |
|-------|------|-------------|
| `title` | String | Titre |
| `content` | Rich Text (Blocks) | Contenu de la page |
| `teamMembers` | Component (repeatable) `about.team-member` | Équipe |
| `values` | Component (repeatable) `about.value-card` | Valeurs/principes |

### `platform-settings` (Single Type)

| Champ | Type | Description |
|-------|------|-------------|
| `siteName` | String | Nom du site |
| `siteDescription` | Text | Description |
| `logo` | Media | Logo |
| `favicon` | Media | Favicon |
| `maintenanceMode` | Boolean | Mode maintenance |
| `defaultAssessmentTemplate` | Relation → `assessment-template` | Questionnaire par défaut |
| `googleCalendarClientId` | String | Client ID Google (sync agenda) |

---

## DIAGRAMME DES RELATIONS

```
                    ┌─────────────────────────────────────────────┐
                    │              ZONE PUBLIQUE                   │
                    │                                             │
  blog-category ──┐ │   blog-article ←── tag (M2M)               │
                  └─┤                                             │
                    │   knowledge-base-entry ←── knowledge-cat.   │
                    │   tutorial                                  │
                    │   news-item                                 │
                    │                                             │
                    │   structure ←── service-type (M2M)          │
                    │   event ←─── structure (M2O)                │
                    │                                             │
                    │   assessment-template (questionnaires vides)│
                    │   document-template (modèles vides)         │
                    └───────────────────┬─────────────────────────┘
                                        │
                                        │ submittedBy / author
                                        ▼
                    ┌─────────────────────────────────────────────┐
                    │            ZONE MEMBRE                      │
                    │                                             │
                    │   contributor-profile ←── user (1:1)        │
                    │   contribution ←── contributor-profile      │
                    │                                             │
                    └───────────────────┬─────────────────────────┘
                                        │
                                        │ owner (user)
                                        ▼
                    ┌─────────────────────────────────────────────┐
                    │     ZONE PRIVÉE (HDS / Chiffrement)        │
                    │                                             │
                    │   personal-notebook ←── user (M2O)         │
                    │   personal-goal ←── user (M2O)             │
                    │   self-assessment ←── user (M2O)           │
                    │                  ←── assessment-template    │
                    │   generated-document ←── user (M2O)        │
                    │                      ←── document-template  │
                    │   personal-calendar-event ←── user (M2O)   │
                    │   recovery-profile ←── user (1:1)          │
                    │   recovery-recommendation ←── user (M2O)   │
                    │                                             │
                    └─────────────────────────────────────────────┘
```

## STRATÉGIE DE CHIFFREMENT AU REPOS

### Approche retenue : Chiffrement applicatif (Application-Level Encryption)

Plutôt que de compter uniquement sur le chiffrement disque (TDE) de PostgreSQL, nous implémentons un **chiffrement au niveau applicatif** pour les champs sensibles :

1. **Algorithme** : AES-256-GCM (authentifié)
2. **Gestion des clés** : Via un service de gestion de clés (KMS) externe ou Vault
3. **Implémentation Strapi** : Middleware/lifecycle hook personnalisé :
   - `beforeCreate` / `beforeUpdate` : chiffrement des champs marqués
   - `afterFind` / `afterFindOne` : déchiffrement pour l'utilisateur authentifié
4. **Rotation des clés** : Support de multiple versions de clés (envelope encryption)

### Schéma PostgreSQL dédié

```sql
-- Les données privées sont isolées dans un schéma séparé
CREATE SCHEMA private_health;

-- Les tables de la zone privée résident dans ce schéma
-- Accès restreint au service applicatif uniquement
GRANT USAGE ON SCHEMA private_health TO strapi_app_user;
REVOKE ALL ON SCHEMA private_health FROM PUBLIC;
```

## NOTES DE CONCEPTION

1. **Pas de lien direct** entre les données publiques et les données privées : le `contributor-profile` sert de couche intermédiaire entre l'identité publique du membre et ses données privées.

2. **Le champ `owner`** des Content-Types privés pointe vers le `user` Strapi (pas vers `contributor-profile`) pour minimiser les jointures sur données sensibles.

3. **Les templates** (`assessment-template`, `document-template`) sont des données publiques car ils ne contiennent aucune donnée personnelle. Seules les **réponses** et **documents générés** sont privés.

4. **Le champ JSON `data`** de `contribution` permet de stocker des structures variées selon le type de contribution, validées côté applicatif avant insertion.

5. **La synchronisation Google Agenda** ne stocke que l'`ID` de l'événement Google, pas les tokens OAuth (ceux-ci sont gérés dans le service d'authentification, jamais en base).
