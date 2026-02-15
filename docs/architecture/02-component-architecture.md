# Étape 2 — Architecture des Composants (Next.js)

## Stack Frontend Retenue

| Besoin | Librairie | Justification |
|--------|-----------|---------------|
| **Framework** | Next.js 14+ (App Router) | SSR/SSG, layouts imbriqués, Server Components |
| **UI Kit** | shadcn/ui + Tailwind CSS | Composants accessibles (Radix), personnalisables, pas de vendor lock-in |
| **Graphiques** | Recharts | Léger, déclaratif, bonne accessibilité, basé sur D3 |
| **Cartographie** | React Leaflet + OpenStreetMap | Gratuit, RGPD-friendly (pas de tracking Google) |
| **Formulaires** | React Hook Form + Zod | Validation type-safe, performant |
| **État global** | Zustand | Léger, pas de boilerplate, compatible Server Components |
| **Fetching API** | TanStack Query (React Query) | Cache, revalidation, optimistic updates |
| **PDF** | @react-pdf/renderer | Génération PDF côté client |
| **Calendrier** | FullCalendar (React) | Complet, drag & drop, sync externe |
| **Date** | date-fns | Léger, tree-shakable, locale FR |
| **Icônes** | Lucide React | Cohérent avec shadcn/ui |
| **Accessibilité** | Radix UI (via shadcn) | ARIA natif, navigation clavier |

---

## Structure du Projet Next.js

```
frontend/
├── public/
│   ├── images/
│   ├── fonts/
│   └── locales/
│       └── fr/
├── src/
│   ├── app/                          # App Router (routes)
│   │   ├── layout.tsx                # Layout racine (providers, metadata)
│   │   ├── page.tsx                  # Homepage
│   │   ├── (public)/                 # Groupe : Zone Publique
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx          # Liste articles
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx      # Article détail
│   │   │   ├── actualites/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/page.tsx
│   │   │   ├── ressources/
│   │   │   │   ├── page.tsx          # Base de connaissances
│   │   │   │   └── [slug]/page.tsx
│   │   │   ├── tutoriels/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/page.tsx
│   │   │   ├── annuaire/
│   │   │   │   ├── page.tsx          # Carte + liste
│   │   │   │   └── [slug]/page.tsx   # Fiche structure
│   │   │   ├── agenda/
│   │   │   │   ├── page.tsx          # Calendrier événements
│   │   │   │   └── [slug]/page.tsx   # Détail événement
│   │   │   └── a-propos/
│   │   │       └── page.tsx
│   │   ├── (auth)/                   # Groupe : Authentification
│   │   │   ├── connexion/page.tsx
│   │   │   ├── inscription/page.tsx
│   │   │   ├── mot-de-passe-oublie/page.tsx
│   │   │   └── layout.tsx            # Layout auth (centré, minimaliste)
│   │   ├── (member)/                 # Groupe : Zone Membre (auth requise)
│   │   │   ├── layout.tsx            # Layout avec sidebar + guard auth
│   │   │   ├── contribuer/
│   │   │   │   ├── page.tsx          # Hub de contribution
│   │   │   │   ├── structure/page.tsx
│   │   │   │   ├── evenement/page.tsx
│   │   │   │   └── article/page.tsx
│   │   │   ├── mes-contributions/
│   │   │   │   └── page.tsx          # Historique + statuts
│   │   │   └── profil/
│   │   │       └── page.tsx          # Profil contributeur public
│   │   └── (private)/                # Groupe : Zone Privée (auth + isolation)
│   │       ├── layout.tsx            # Layout dashboard + guard + décryptage ctx
│   │       ├── tableau-de-bord/
│   │       │   └── page.tsx          # DASHBOARD PRINCIPAL
│   │       ├── carnet/
│   │       │   ├── page.tsx          # Liste des notes
│   │       │   ├── nouveau/page.tsx  # Nouvelle note
│   │       │   └── [id]/page.tsx     # Éditer note
│   │       ├── objectifs/
│   │       │   ├── page.tsx          # Vue objectifs
│   │       │   └── [id]/page.tsx     # Détail objectif
│   │       ├── autoevaluation/
│   │       │   ├── page.tsx          # Historique évaluations
│   │       │   ├── nouvelle/page.tsx # Passer une évaluation
│   │       │   └── [id]/page.tsx     # Résultat détaillé
│   │       ├── documents/
│   │       │   ├── page.tsx          # Mes documents
│   │       │   └── nouveau/page.tsx  # Générateur
│   │       ├── calendrier/
│   │       │   └── page.tsx          # Calendrier personnel
│   │       ├── parcours/
│   │       │   └── page.tsx          # Parcours + recommandations
│   │       └── parametres/
│   │           └── page.tsx          # Paramètres compte + sync Google
│   ├── components/                   # Composants React
│   │   ├── ui/                       # shadcn/ui (auto-généré)
│   │   ├── layout/                   # Structure de page
│   │   ├── public/                   # Zone publique
│   │   ├── member/                   # Zone membre
│   │   ├── private/                  # Zone privée
│   │   └── dashboard/                # Widgets du dashboard
│   ├── lib/                          # Utilitaires
│   ├── hooks/                        # Hooks React custom
│   ├── stores/                       # Zustand stores
│   ├── types/                        # Types TypeScript
│   └── styles/                       # CSS global + thème Tailwind
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Composants Détaillés par Zone

### Layout & Navigation (`components/layout/`)

| Composant | Description | Props clés |
|-----------|-------------|------------|
| `RootLayout` | Provider global (QueryClient, Theme, Auth) | `children` |
| `PublicHeader` | Navbar publique : logo, nav, CTA connexion | — |
| `PublicFooter` | Footer : liens, mentions légales, contact | — |
| `AuthLayout` | Layout centré pour pages auth | `children` |
| `MemberSidebar` | Sidebar zone membre : nav, profil, contributions | `activePath` |
| `PrivateSidebar` | Sidebar zone privée : nav dashboard, carnet, objectifs... | `activePath` |
| `PrivateLayout` | Layout dashboard avec sidebar + topbar | `children` |
| `TopBar` | Barre supérieure : recherche, notifications, avatar | `user` |
| `Breadcrumb` | Fil d'Ariane dynamique (basé sur segments App Router) | `segments` |
| `MobileNav` | Navigation hamburger responsive | `isOpen`, `onClose` |

### Zone Publique (`components/public/`)

#### Blog & Contenus

| Composant | Description | Données (Strapi) |
|-----------|-------------|-------------------|
| `ArticleCard` | Carte aperçu article (image, titre, extrait, date) | `blog-article` |
| `ArticleList` | Grille/liste paginée d'articles avec filtres | `blog-article[]` |
| `ArticleDetail` | Page complète : contenu riche, auteur, tags, partage | `blog-article` |
| `NewsCard` | Carte actualité compacte | `news-item` |
| `NewsTicker` | Bandeau défilant des dernières actus (homepage) | `news-item[]` |
| `ResourceCard` | Carte ressource base de connaissances | `knowledge-base-entry` |
| `ResourceList` | Liste avec filtres catégorie/difficulté | `knowledge-base-entry[]` |
| `TutorialViewer` | Affichage pas-à-pas avec progression | `tutorial` |
| `CategoryFilter` | Filtre par catégories (chips cliquables) | `blog-category[]` |
| `TagCloud` | Nuage de tags | `tag[]` |
| `SearchBar` | Recherche full-text (appel API Strapi) | — |
| `ContentSeo` | Injection métadonnées SEO (composant `shared.seo-meta`) | `seoMeta` |

#### Annuaire & Cartographie

| Composant | Description | Librairie |
|-----------|-------------|-----------|
| `DirectoryMap` | Carte Leaflet pleine page avec clusters de marqueurs | React Leaflet |
| `DirectoryMapMarker` | Marqueur personnalisé par type de structure | React Leaflet |
| `DirectoryMapPopup` | Popup au clic : nom, type, adresse, lien fiche | React Leaflet |
| `DirectoryMapCluster` | Regroupement de marqueurs par zoom | react-leaflet-cluster |
| `DirectoryFilters` | Panel de filtres : type, service, distance, recherche | shadcn/ui |
| `DirectoryList` | Liste alternative (mode liste vs carte) | — |
| `StructureCard` | Carte résumé d'une structure | — |
| `StructureDetail` | Fiche complète : infos, horaires, services, carte solo | — |
| `GeolocateButton` | Bouton "Me localiser" (Geolocation API) | — |

#### Agenda

| Composant | Description | Librairie |
|-----------|-------------|-----------|
| `EventCalendar` | Vue calendrier des événements publics | FullCalendar |
| `EventCard` | Carte événement : date, titre, lieu, type | — |
| `EventList` | Liste chronologique filtrée | — |
| `EventDetail` | Page détail : description, lieu/visio, organisateur | — |
| `EventTypeFilter` | Filtre par type d'événement (chips) | — |

### Zone Membre (`components/member/`)

| Composant | Description |
|-----------|-------------|
| `ContributionHub` | Page d'accueil contribution : choix du type |
| `ContributionForm` | Formulaire dynamique selon le type (React Hook Form + Zod) |
| `StructureContribForm` | Sous-formulaire spécifique "Proposer une structure" |
| `EventContribForm` | Sous-formulaire spécifique "Proposer un événement" |
| `ArticleContribForm` | Sous-formulaire spécifique "Proposer un article" |
| `ContributionList` | Historique des contributions du membre + statuts |
| `ContributionStatusBadge` | Badge visuel du statut (pending, approved, rejected...) |
| `ContributorProfileCard` | Carte de profil public (avatar, bio, stats) |
| `ContributorProfileForm` | Formulaire d'édition du profil contributeur |

### Zone Privée (`components/private/`)

#### Carnet de Bord

| Composant | Description |
|-----------|-------------|
| `NotebookEntryList` | Liste des notes avec filtres (date, humeur, tags) |
| `NotebookEntryCard` | Carte aperçu note (titre, date, mood emoji, extrait) |
| `NotebookEntryForm` | Formulaire création/édition note + sélecteur humeur |
| `MoodSelector` | Sélecteur visuel d'humeur (5 niveaux, icônes) |
| `MoodTimeline` | Frise chronologique des humeurs (mini-graphique) |
| `NotebookTagFilter` | Filtre par tags personnels |

#### Objectifs

| Composant | Description |
|-----------|-------------|
| `GoalBoard` | Vue Kanban des objectifs par statut |
| `GoalCard` | Carte objectif : titre, horizon, barre de progression |
| `GoalDetail` | Vue détaillée : description, milestones, progression |
| `GoalForm` | Formulaire création/édition objectif |
| `MilestoneChecklist` | Liste de jalons cochables (avec dates) |
| `GoalProgressBar` | Barre de progression visuelle (segmentée par jalons) |
| `GoalHorizonTabs` | Onglets court/moyen/long terme |

#### Autoévaluation

| Composant | Description | Librairie |
|-----------|-------------|-----------|
| `AssessmentWizard` | Formulaire multi-étapes (une dimension par étape) | React Hook Form |
| `AssessmentQuestionRenderer` | Rendu dynamique selon le type (Likert, oui/non, numérique...) | — |
| `LikertScale` | Échelle de Likert interactive (5 ou 7 points) | Custom |
| `AssessmentResultView` | Vue résultat complète : scores par dimension | — |
| `AssessmentRadarChart` | Graphique radar des scores par dimension | Recharts |
| `AssessmentLineChart` | Évolution des scores dans le temps (historique) | Recharts |
| `AssessmentCompareChart` | Comparaison de 2 évaluations côte à côte (barres) | Recharts |
| `AssessmentHistory` | Liste des évaluations passées (timeline) | — |
| `ScoreBadge` | Badge coloré du score global (vert/jaune/rouge) | — |

#### Documents

| Composant | Description | Librairie |
|-----------|-------------|-----------|
| `DocumentTemplateSelector` | Galerie de modèles disponibles | — |
| `DocumentFormRenderer` | Formulaire dynamique basé sur `fields` du template | React Hook Form |
| `DocumentPreview` | Prévisualisation PDF en temps réel | @react-pdf/renderer |
| `DocumentList` | Liste des documents générés (téléchargement) | — |
| `PdfGenerator` | Service de génération PDF (composant wrapper) | @react-pdf/renderer |

#### Calendrier Personnel

| Composant | Description | Librairie |
|-----------|-------------|-----------|
| `PersonalCalendar` | Calendrier interactif avec événements personnels | FullCalendar |
| `CalendarEventForm` | Formulaire ajout/édition événement | React Hook Form |
| `CalendarEventPopover` | Popover au clic sur un événement | shadcn/ui Popover |
| `GoogleCalendarSync` | Bouton + status de synchronisation Google | — |
| `ReminderConfig` | Configuration des rappels (minutes avant) | — |

#### Parcours de Rétablissement

| Composant | Description |
|-----------|-------------|
| `RecoveryProfileWizard` | Questionnaire initial profil (besoins, forces, étape CHIME) |
| `RecoveryStageIndicator` | Indicateur visuel de l'étape de rétablissement |
| `RecoveryPathway` | Visualisation du parcours (stepper vertical) |
| `RecommendationList` | Liste de recommandations personnalisées |
| `RecommendationCard` | Carte recommandation (type, raison, lien vers ressource) |

---

## Composants Dashboard (`components/dashboard/`)

Le dashboard est composé de **widgets (cartes)** indépendants. Chaque widget est un composant autonome qui fetch ses propres données.

### Architecture des Widgets

```
components/dashboard/
├── DashboardGrid.tsx          # Grille responsive CSS Grid
├── DashboardWidget.tsx        # Wrapper générique (titre, loading, erreur)
├── WeekPlanningWidget.tsx     # Planning de la semaine
├── GoalProgressWidget.tsx     # Progression des objectifs
├── AssessmentChartWidget.tsx  # Infographies autoévaluation
├── RecentNotesWidget.tsx      # Dernières notes
├── RecentDocumentsWidget.tsx  # Derniers documents
├── ActivityFeedWidget.tsx     # Flux d'activité
└── QuickActionsWidget.tsx     # Actions rapides
```

### Détail de chaque Widget

#### `DashboardGrid`
- **Rôle** : Conteneur de la grille de widgets
- **Layout** : CSS Grid responsive
  - Desktop : 3 colonnes (`1fr 1fr 1fr`)
  - Tablette : 2 colonnes
  - Mobile : 1 colonne (empilement)
- **Props** : `children` (les widgets)

#### `DashboardWidget` (Wrapper générique)
- **Rôle** : Encapsule chaque widget dans une carte uniforme
- **Fonctionnalités** : titre, icône, état de chargement (skeleton), état erreur, lien "Voir tout"
- **Props** : `title`, `icon`, `isLoading`, `error`, `viewAllHref`, `children`, `colSpan?`

#### `WeekPlanningWidget`
- **Données** : `personal-calendar-event` (semaine courante)
- **Affichage** : Timeline verticale jour par jour, événements empilés
- **Interactions** : Clic → détail, bouton "+" ajout rapide
- **Span** : 1 colonne

#### `GoalProgressWidget`
- **Données** : `personal-goal` (actifs uniquement)
- **Affichage** :
  - 3 sections empilées : Court terme / Moyen terme / Long terme
  - Chaque objectif : titre + barre de progression circulaire ou linéaire
  - Statistiques : X/Y complétés cette semaine/mois/année
- **Librairie** : Recharts (`PieChart` pour les circulaires)
- **Span** : 1 colonne

#### `AssessmentChartWidget`
- **Données** : 2 dernières `self-assessment` du même template
- **Affichage** :
  - **Graphique radar** (Recharts `RadarChart`) superposant les 2 évaluations
  - Légende : dates des 2 évaluations
  - Score global avec indicateur tendance (↑ ↓ →)
- **Librairie** : Recharts
- **Span** : 1 colonne (ou 2 en desktop si données riches)

```tsx
// Exemple de structure Recharts pour le radar
<RadarChart data={dimensionsData}>
  <PolarGrid />
  <PolarAngleAxis dataKey="dimension" />
  <PolarRadiusAxis angle={30} domain={[0, 100]} />
  <Radar name={date1} dataKey="score1" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.2} />
  <Radar name={date2} dataKey="score2" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
  <Legend />
  <Tooltip />
</RadarChart>
```

#### `RecentNotesWidget`
- **Données** : 3 dernières `personal-notebook`
- **Affichage** : Liste compacte (titre, date, emoji humeur, extrait tronqué)
- **Interactions** : Clic → page note, bouton "Nouvelle note"
- **Span** : 1 colonne

#### `RecentDocumentsWidget`
- **Données** : 3 derniers `generated-document`
- **Affichage** : Liste compacte (titre, type template, date, bouton télécharger)
- **Span** : 1 colonne

#### `ActivityFeedWidget`
- **Données** : Agrégation multi-sources triée par date
  - Dernières `contribution` du membre
  - Prochains `event` (publics)
  - Derniers `news-item`
  - Derniers `blog-article`
  - Dernières `knowledge-base-entry`
- **Affichage** : Timeline unifiée avec icône par type + badge coloré
- **Span** : 2 colonnes (desktop), pleine largeur (mobile)

#### `QuickActionsWidget`
- **Rôle** : Raccourcis vers les actions fréquentes
- **Actions** :
  - Nouvelle note
  - Passer une autoévaluation
  - Ajouter un objectif
  - Générer un document
  - Contribuer une ressource
- **Affichage** : Grille de boutons icône + label
- **Span** : 1 colonne

### Mise en page du Dashboard (Desktop)

```
┌─────────────────────────────────────────────────────────────┐
│  TopBar : Bonjour [Prénom] | Recherche | Notif | Avatar    │
├────────────────┬────────────────────────────────────────────┤
│                │                                            │
│  Sidebar       │  ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│                │  │ Planning  │ │ Objectifs│ │ Évalua-  │  │
│  - Tableau de  │  │ semaine  │ │ progress.│ │ tion     │  │
│    bord        │  │          │ │          │ │ (radar)  │  │
│  - Carnet      │  └──────────┘ └──────────┘ └──────────┘  │
│  - Objectifs   │                                            │
│  - Autoéval.   │  ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  - Documents   │  │ Dernières│ │ Derniers │ │ Actions  │  │
│  - Calendrier  │  │ notes    │ │ docs     │ │ rapides  │  │
│  - Parcours    │  │          │ │          │ │          │  │
│  - Paramètres  │  └──────────┘ └──────────┘ └──────────┘  │
│                │                                            │
│  ───────────── │  ┌─────────────────────────────────────┐  │
│  Contribuer    │  │ Flux d'activité (2 colonnes)        │  │
│  Mon profil    │  │ Articles · Événements · Actus ·     │  │
│                │  │ Contributions                        │  │
│                │  └─────────────────────────────────────┘  │
│                │                                            │
├────────────────┴────────────────────────────────────────────┤
│  Footer (minimal en zone privée)                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Hooks React Custom (`hooks/`)

| Hook | Description | Utilisé par |
|------|-------------|-------------|
| `useAuth` | Contexte auth : user, login, logout, isAuthenticated | Global |
| `useCurrentUser` | Données du user connecté + contributor-profile | Layouts membre/privé |
| `useEncryption` | Chiffrement/déchiffrement côté client (Web Crypto API) | Zone privée |
| `useNotebook` | CRUD notes (TanStack Query + déchiffrement) | Carnet de bord |
| `useGoals` | CRUD objectifs + calcul progression | Objectifs + Dashboard |
| `useAssessments` | CRUD évaluations + calcul scores | Autoévaluation + Dashboard |
| `useDocuments` | CRUD documents générés | Documents |
| `usePersonalCalendar` | CRUD événements perso + sync Google | Calendrier |
| `useRecoveryProfile` | Lecture/maj profil rétablissement | Parcours |
| `useContributions` | Soumission + suivi contributions | Zone membre |
| `useDirectory` | Recherche structures avec géolocalisation | Annuaire |
| `useEvents` | Fetch événements avec filtres | Agenda |
| `useDebounce` | Debounce de valeur (recherche) | SearchBar |
| `useGeolocation` | API Geolocation du navigateur | Annuaire |
| `useMediaQuery` | Breakpoints responsive | Layouts |

---

## Stores Zustand (`stores/`)

| Store | État géré | Justification |
|-------|-----------|---------------|
| `authStore` | `user`, `token`, `isAuthenticated`, `contributorProfile` | Session globale |
| `uiStore` | `sidebarOpen`, `theme`, `mobileNavOpen` | État interface |
| `dashboardStore` | `widgetOrder`, `widgetVisibility` | Personnalisation future |
| `encryptionStore` | `derivedKey` (en mémoire uniquement, jamais persisté) | Clé de déchiffrement de la session |

---

## Types TypeScript (`types/`)

```
types/
├── api.ts             # Types génériques API Strapi (pagination, réponse, erreur)
├── blog.ts            # BlogArticle, BlogCategory, NewsItem
├── knowledge.ts       # KnowledgeBaseEntry, KnowledgeCategory, Tutorial
├── directory.ts       # Structure, ServiceType, Coordinates
├── event.ts           # Event (public), EventType
├── member.ts          # ContributorProfile, Contribution
├── notebook.ts        # PersonalNotebook, Mood
├── goal.ts            # PersonalGoal, Milestone, GoalHorizon
├── assessment.ts      # SelfAssessment, AssessmentTemplate, Dimension, Question
├── document.ts        # GeneratedDocument, DocumentTemplate
├── calendar.ts        # PersonalCalendarEvent, Recurrence
├── recovery.ts        # RecoveryProfile, RecoveryRecommendation, RecoveryStage
├── dashboard.ts       # WidgetConfig, ActivityFeedItem
└── auth.ts            # User, AuthState, LoginCredentials
```

---

## Librairies Graphiques — Détail d'utilisation

### Recharts — Graphiques du Dashboard

| Composant Recharts | Utilisation dans Pairémancipation |
|--------------------|-----------------------------------|
| `RadarChart` | Superposition 2 autoévaluations par dimension |
| `LineChart` | Évolution temporelle des scores d'autoévaluation |
| `BarChart` | Comparaison côte à côte de 2 évaluations |
| `PieChart` / `RadialBarChart` | Progression globale des objectifs (% complétés) |
| `AreaChart` | Évolution de l'humeur sur le carnet de bord |
| `Tooltip`, `Legend`, `ResponsiveContainer` | UX standard sur tous les graphiques |

**Principes d'accessibilité des graphiques :**
- Toujours un `<title>` et `<desc>` SVG (aria-label)
- Couleurs avec contraste suffisant (WCAG AA)
- Alternative textuelle pour chaque graphique (tableau masqué pour lecteur d'écran)
- Pas d'information transmise uniquement par la couleur (utiliser aussi des motifs/formes)

### React Leaflet — Cartographie de l'annuaire

| Composant Leaflet | Utilisation |
|--------------------|-------------|
| `MapContainer` | Conteneur carte (centre France, zoom 6) |
| `TileLayer` | Tuiles OpenStreetMap (RGPD-compliant) |
| `Marker` + `Popup` | Marqueurs par structure avec popup info |
| `MarkerClusterGroup` | Regroupement par densité (plugin) |
| `useMapEvents` | Écoute déplacement/zoom pour rechargement |
| `Circle` | Rayon de recherche autour de la position |

**Choix OpenStreetMap vs Google Maps :**
- Pas de cookies tiers, pas de tracking → conformité RGPD
- Gratuit, pas de clé API payante
- Données ouvertes, communauté active

---

## Gestion de l'accessibilité (a11y)

L'accessibilité est un impératif éthique pour une plateforme destinée à un public en situation de vulnérabilité.

| Critère | Implémentation |
|---------|---------------|
| Navigation clavier | shadcn/ui (Radix) natif + focus visible |
| Lecteur d'écran | ARIA labels sur tous les composants interactifs |
| Contraste | Thème Tailwind validé WCAG AA (ratio 4.5:1 min) |
| Taille de texte | Base 16px, respect `rem`, zoom jusqu'à 200% |
| Réduction de mouvement | `prefers-reduced-motion` respecté |
| Langage simple | Labels clairs, pas de jargon technique |
| États d'erreur | Messages explicites, pas seulement des couleurs |
| Skip links | Lien "Aller au contenu principal" |
| Focus management | Après navigation SPA, focus sur le contenu |

---

## Notes de conception

1. **Server Components par défaut** : Toutes les pages publiques utilisent les React Server Components de Next.js pour le SEO et la performance. Les composants interactifs (formulaires, cartes, graphiques) sont des Client Components (`"use client"`).

2. **Lazy loading des widgets** : Chaque widget du dashboard est chargé dynamiquement via `next/dynamic` pour ne pas bloquer le rendu initial.

3. **Skeleton loading** : Chaque widget affiche un squelette pendant le chargement des données (via le `DashboardWidget` wrapper).

4. **Déchiffrement côté client** : Les données privées sont déchiffrées dans le navigateur uniquement. Le hook `useEncryption` dérive la clé à partir du mot de passe de l'utilisateur via PBKDF2 (jamais stockée en base).

5. **Routes françaises** : Les URL utilisent des slugs en français (`/carnet`, `/objectifs`, `/autoevaluation`) pour une meilleure appropriation par le public cible.

6. **Images responsive** : Utilisation du composant `next/image` avec des formats modernes (WebP/AVIF) et chargement paresseux natif.
