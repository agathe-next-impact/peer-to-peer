/**
 * Script de seed pour le développement local.
 * Usage : npx ts-node database/seeds/seed.ts
 *
 * Crée des données de démonstration dans Strapi via l'API REST.
 */

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@pairemancipation.fr';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'Admin123!';

async function getAdminToken(): Promise<string> {
  const res = await fetch(`${STRAPI_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });

  if (!res.ok) {
    throw new Error(`Admin login failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data.data.token;
}

async function createEntry(token: string, endpoint: string, data: Record<string, unknown>) {
  const res = await fetch(`${STRAPI_URL}/api/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ data }),
  });

  if (!res.ok) {
    const error = await res.text();
    console.error(`  [ERREUR] ${endpoint}: ${error}`);
    return null;
  }

  const result = await res.json();
  console.log(`  [OK] ${endpoint} #${result.data.id}`);
  return result.data;
}

// ─── Données de seed ──────────────────────────────────

const blogCategories = [
  { name: 'Témoignages', slug: 'temoignages', description: 'Récits personnels de rétablissement.' },
  { name: 'Outils pratiques', slug: 'outils-pratiques', description: 'Fiches et guides pratiques.' },
  { name: 'Pair-aidance', slug: 'pair-aidance', description: 'Ressources sur la pair-aidance professionnelle.' },
  { name: 'Droits', slug: 'droits', description: 'Droits des usagers en santé mentale.' },
  { name: 'Recherche', slug: 'recherche', description: 'Études et publications scientifiques.' },
];

const blogTags = [
  { name: 'rétablissement', slug: 'retablissement' },
  { name: 'pair-aidance', slug: 'pair-aidance' },
  { name: 'GEM', slug: 'gem' },
  { name: 'SAMSAH', slug: 'samsah' },
  { name: 'empowerment', slug: 'empowerment' },
  { name: 'bien-être', slug: 'bien-etre' },
  { name: 'logement', slug: 'logement' },
  { name: 'emploi', slug: 'emploi' },
  { name: 'droits', slug: 'droits' },
  { name: 'autogestion', slug: 'autogestion' },
];

const knowledgeCategories = [
  { name: 'Santé mentale', slug: 'sante-mentale', icon: 'brain' },
  { name: 'Vie quotidienne', slug: 'vie-quotidienne', icon: 'home' },
  { name: 'Emploi & Formation', slug: 'emploi-formation', icon: 'briefcase' },
  { name: 'Logement', slug: 'logement', icon: 'building' },
  { name: 'Droits & Démarches', slug: 'droits-demarches', icon: 'scale' },
];

const serviceTypes = [
  { name: 'CMP', slug: 'cmp', icon: 'hospital' },
  { name: 'GEM', slug: 'gem', icon: 'users' },
  { name: 'SAMSAH', slug: 'samsah', icon: 'heart' },
  { name: 'SAVS', slug: 'savs', icon: 'hand-helping' },
  { name: 'Hôpital de jour', slug: 'hopital-de-jour', icon: 'building' },
  { name: 'Maison des usagers', slug: 'maison-des-usagers', icon: 'home' },
  { name: 'Association', slug: 'association', icon: 'people' },
  { name: 'CATTP', slug: 'cattp', icon: 'activity' },
];

const structures = [
  {
    name: 'GEM Le Relais',
    slug: 'gem-le-relais',
    type: 'association',
    address: { street: '15 rue de la Paix', postalCode: '75002', city: 'Paris', department: 'Paris', region: 'Île-de-France', country: 'France' },
    coordinates: { latitude: 48.8698, longitude: 2.3308 },
    phone: '01 42 00 00 00',
    email: 'contact@gem-lerelais.fr',
    isVerified: true,
  },
  {
    name: 'CMP Esquirol',
    slug: 'cmp-esquirol',
    type: 'public',
    address: { street: '57 rue de la Roquette', postalCode: '75011', city: 'Paris', department: 'Paris', region: 'Île-de-France', country: 'France' },
    coordinates: { latitude: 48.8566, longitude: 2.3773 },
    phone: '01 43 00 00 00',
    email: 'cmp.esquirol@aphp.fr',
    isVerified: true,
  },
  {
    name: 'SAMSAH Solidarité',
    slug: 'samsah-solidarite',
    type: 'association',
    address: { street: '8 avenue Jean Jaurès', postalCode: '69007', city: 'Lyon', department: 'Rhône', region: 'Auvergne-Rhône-Alpes', country: 'France' },
    coordinates: { latitude: 45.7484, longitude: 4.8422 },
    phone: '04 72 00 00 00',
    email: 'contact@samsah-solidarite.fr',
    isVerified: true,
  },
  {
    name: 'GEM Horizon',
    slug: 'gem-horizon',
    type: 'association',
    address: { street: '22 boulevard de la Liberté', postalCode: '59000', city: 'Lille', department: 'Nord', region: 'Hauts-de-France', country: 'France' },
    coordinates: { latitude: 50.6292, longitude: 3.0573 },
    phone: '03 20 00 00 00',
    email: 'contact@gem-horizon.fr',
    isVerified: true,
  },
  {
    name: 'Maison des Usagers Nantes',
    slug: 'maison-usagers-nantes',
    type: 'public',
    address: { street: '5 rue Bias', postalCode: '44000', city: 'Nantes', department: 'Loire-Atlantique', region: 'Pays de la Loire', country: 'France' },
    coordinates: { latitude: 47.2184, longitude: -1.5536 },
    phone: '02 40 00 00 00',
    email: 'mdu@chu-nantes.fr',
    isVerified: true,
  },
];

const articles = [
  {
    title: 'Mon parcours de rétablissement : 3 ans après',
    slug: 'mon-parcours-retablissement-3-ans',
    excerpt: 'Témoignage sur les étapes clés de mon rétablissement en santé mentale et les ressources qui m\'ont aidé.',
    publishedAt: '2025-01-15T10:00:00.000Z',
  },
  {
    title: 'Comprendre la pair-aidance professionnelle',
    slug: 'comprendre-pair-aidance-professionnelle',
    excerpt: 'Qu\'est-ce que la pair-aidance ? Comment devenir pair-aidant professionnel ? Guide complet.',
    publishedAt: '2025-02-01T10:00:00.000Z',
  },
  {
    title: '5 outils d\'autogestion au quotidien',
    slug: '5-outils-autogestion-quotidien',
    excerpt: 'Des outils concrets pour gérer son bien-être au quotidien : carnet de bord, WRAP, plan de crise.',
    publishedAt: '2025-02-15T10:00:00.000Z',
  },
  {
    title: 'Connaître ses droits en psychiatrie',
    slug: 'connaitre-ses-droits-psychiatrie',
    excerpt: 'Vos droits fondamentaux en tant qu\'usager de la psychiatrie : information, consentement, recours.',
    publishedAt: '2025-03-01T10:00:00.000Z',
  },
  {
    title: 'Le GEM : un lieu de vie et d\'entraide',
    slug: 'gem-lieu-vie-entraide',
    excerpt: 'Découverte des Groupes d\'Entraide Mutuelle : fonctionnement, activités et témoignages de membres.',
    publishedAt: '2025-03-15T10:00:00.000Z',
  },
  {
    title: 'Emploi et santé mentale : rompre les tabous',
    slug: 'emploi-sante-mentale-tabous',
    excerpt: 'Comment concilier trouble psychique et vie professionnelle : aménagements, RQTH, témoignages.',
    publishedAt: '2025-04-01T10:00:00.000Z',
  },
  {
    title: 'L\'approche WRAP : plan d\'action de rétablissement',
    slug: 'approche-wrap-plan-action',
    excerpt: 'Présentation de la méthode WRAP (Wellness Recovery Action Plan) et guide de mise en pratique.',
    publishedAt: '2025-04-15T10:00:00.000Z',
  },
  {
    title: 'Directives anticipées en psychiatrie',
    slug: 'directives-anticipees-psychiatrie',
    excerpt: 'Comment rédiger ses directives anticipées psychiatriques et pourquoi c\'est important.',
    publishedAt: '2025-05-01T10:00:00.000Z',
  },
  {
    title: 'Logement accompagné : quelles solutions ?',
    slug: 'logement-accompagne-solutions',
    excerpt: 'Panorama des solutions de logement accompagné pour les personnes vivant avec un trouble psychique.',
    publishedAt: '2025-05-15T10:00:00.000Z',
  },
  {
    title: 'Le pouvoir d\'agir : de patient à acteur',
    slug: 'pouvoir-agir-patient-acteur',
    excerpt: 'Comment passer d\'une posture passive à une posture d\'empowerment dans son parcours de soins.',
    publishedAt: '2025-06-01T10:00:00.000Z',
  },
];

const events = [
  {
    title: 'Atelier WRAP — Introduction',
    slug: 'atelier-wrap-introduction',
    startDate: '2025-09-15T14:00:00.000Z',
    endDate: '2025-09-15T17:00:00.000Z',
    location: 'GEM Le Relais, Paris',
    type: 'workshop',
  },
  {
    title: 'Groupe d\'entraide — Gestion du stress',
    slug: 'groupe-entraide-gestion-stress',
    startDate: '2025-09-22T10:00:00.000Z',
    endDate: '2025-09-22T12:00:00.000Z',
    location: 'Maison des Usagers, Nantes',
    type: 'group',
  },
  {
    title: 'Conférence — La pair-aidance en France',
    slug: 'conference-pair-aidance-france',
    startDate: '2025-10-05T09:00:00.000Z',
    endDate: '2025-10-05T17:00:00.000Z',
    location: 'Université Paris-Cité',
    type: 'conference',
  },
  {
    title: 'Formation pair-aidant — Module 1',
    slug: 'formation-pair-aidant-module-1',
    startDate: '2025-10-14T09:00:00.000Z',
    endDate: '2025-10-18T17:00:00.000Z',
    location: 'CCOMS, Lille',
    type: 'training',
  },
  {
    title: 'Café pair — Rencontre mensuelle',
    slug: 'cafe-pair-rencontre-mensuelle',
    startDate: '2025-10-20T15:00:00.000Z',
    endDate: '2025-10-20T17:00:00.000Z',
    location: 'GEM Horizon, Lille',
    type: 'social',
  },
  {
    title: 'Atelier écriture — Récits de rétablissement',
    slug: 'atelier-ecriture-recits',
    startDate: '2025-11-03T14:00:00.000Z',
    endDate: '2025-11-03T16:00:00.000Z',
    location: 'Bibliothèque municipale, Lyon',
    type: 'workshop',
  },
  {
    title: 'Journée mondiale de la santé mentale',
    slug: 'journee-mondiale-sante-mentale',
    startDate: '2025-10-10T09:00:00.000Z',
    endDate: '2025-10-10T18:00:00.000Z',
    location: 'Parvis de la Défense, Paris',
    type: 'conference',
  },
  {
    title: 'Séance de sport adapté',
    slug: 'seance-sport-adapte',
    startDate: '2025-11-08T10:00:00.000Z',
    endDate: '2025-11-08T12:00:00.000Z',
    location: 'Gymnase Jean Moulin, Nantes',
    type: 'workshop',
  },
  {
    title: 'Forum des associations — Santé mentale',
    slug: 'forum-associations-sante-mentale',
    startDate: '2025-11-15T10:00:00.000Z',
    endDate: '2025-11-15T17:00:00.000Z',
    location: 'Mairie du 11e, Paris',
    type: 'social',
  },
  {
    title: 'Groupe de parole — Familles et proches',
    slug: 'groupe-parole-familles',
    startDate: '2025-11-20T18:00:00.000Z',
    endDate: '2025-11-20T20:00:00.000Z',
    location: 'UNAFAM, Lyon',
    type: 'group',
  },
];

const newsItems = [
  {
    title: 'Lancement de la plateforme Pairémancipation',
    slug: 'lancement-plateforme',
    excerpt: 'La plateforme numérique dédiée au rétablissement en santé mentale est officiellement en ligne.',
    publishedAt: '2025-06-01T08:00:00.000Z',
  },
  {
    title: 'Nouveau partenariat avec le CCOMS',
    slug: 'partenariat-ccoms',
    excerpt: 'Pairémancipation signe un partenariat avec le Centre Collaborateur de l\'OMS pour la santé mentale.',
    publishedAt: '2025-06-15T08:00:00.000Z',
  },
  {
    title: 'Mise à jour : carnet de bord amélioré',
    slug: 'maj-carnet-bord',
    excerpt: 'Le carnet de bord intègre désormais le suivi des émotions et l\'export PDF.',
    publishedAt: '2025-07-01T08:00:00.000Z',
  },
  {
    title: '500 structures référencées dans l\'annuaire',
    slug: '500-structures-annuaire',
    excerpt: 'L\'annuaire de Pairémancipation franchit le cap des 500 structures de santé mentale référencées.',
    publishedAt: '2025-07-15T08:00:00.000Z',
  },
  {
    title: 'Certification HDS obtenue',
    slug: 'certification-hds',
    excerpt: 'Notre hébergeur a obtenu la certification Hébergement de Données de Santé (HDS).',
    publishedAt: '2025-08-01T08:00:00.000Z',
  },
];

const assessmentTemplates = [
  {
    name: 'Échelle de bien-être (WHO-5)',
    slug: 'who-5',
    description: 'Évaluation du bien-être général sur les 2 dernières semaines.',
    dimensions: JSON.stringify([
      { key: 'bonne_humeur', label: 'Je me suis senti(e) de bonne humeur' },
      { key: 'calme_detendu', label: 'Je me suis senti(e) calme et détendu(e)' },
      { key: 'actif_vigoureux', label: 'Je me suis senti(e) actif/ve et vigoureux/se' },
      { key: 'reveil_frais', label: 'Je me suis réveillé(e) frais/fraîche et dispos(e)' },
      { key: 'interet_quotidien', label: 'Mon quotidien est rempli de choses intéressantes' },
    ]),
    scaleMin: 0,
    scaleMax: 5,
    isActive: true,
  },
  {
    name: 'Questionnaire de rétablissement (RAS-r)',
    slug: 'ras-r',
    description: 'Évaluation multidimensionnelle du processus de rétablissement.',
    dimensions: JSON.stringify([
      { key: 'confiance_personnelle', label: 'Confiance personnelle et espoir' },
      { key: 'volonte_demander_aide', label: 'Volonté de demander de l\'aide' },
      { key: 'orientation_objectifs', label: 'Orientation vers des objectifs et du succès' },
      { key: 'appui_autres', label: 'Appui sur les autres' },
      { key: 'non_domination', label: 'Non-domination par les symptômes' },
    ]),
    scaleMin: 1,
    scaleMax: 5,
    isActive: true,
  },
  {
    name: 'Satisfaction de vie (SWLS)',
    slug: 'swls',
    description: 'Évaluation de la satisfaction globale de vie.',
    dimensions: JSON.stringify([
      { key: 'vie_ideale', label: 'Ma vie est proche de mon idéal' },
      { key: 'conditions_excellentes', label: 'Les conditions de ma vie sont excellentes' },
      { key: 'satisfaction', label: 'Je suis satisfait(e) de ma vie' },
      { key: 'choses_importantes', label: 'J\'ai obtenu les choses importantes dans ma vie' },
      { key: 'rien_changer', label: 'Si je pouvais recommencer, je ne changerais rien' },
    ]),
    scaleMin: 1,
    scaleMax: 7,
    isActive: true,
  },
];

// ─── Exécution ────────────────────────────────────────

async function seed() {
  console.log('🌱 Seed Pairémancipation — Démarrage\n');

  const token = await getAdminToken();
  console.log('✅ Connexion admin réussie\n');

  // 1. Catégories blog
  console.log('📂 Catégories de blog...');
  for (const cat of blogCategories) {
    await createEntry(token, 'blog-categories', cat);
  }

  // 2. Tags
  console.log('\n🏷️  Tags...');
  for (const tag of blogTags) {
    await createEntry(token, 'tags', tag);
  }

  // 3. Catégories de ressources
  console.log('\n📚 Catégories de ressources...');
  for (const cat of knowledgeCategories) {
    await createEntry(token, 'knowledge-categories', cat);
  }

  // 4. Types de services
  console.log('\n🏥 Types de services...');
  for (const st of serviceTypes) {
    await createEntry(token, 'service-types', st);
  }

  // 5. Structures
  console.log('\n🏢 Structures...');
  for (const structure of structures) {
    await createEntry(token, 'structures', structure);
  }

  // 6. Articles
  console.log('\n📝 Articles de blog...');
  for (const article of articles) {
    await createEntry(token, 'articles', article);
  }

  // 7. Événements
  console.log('\n📅 Événements...');
  for (const event of events) {
    await createEntry(token, 'events', event);
  }

  // 8. Actualités
  console.log('\n📰 Actualités...');
  for (const news of newsItems) {
    await createEntry(token, 'news-items', news);
  }

  // 9. Modèles d'autoévaluation
  console.log('\n📊 Modèles d\'autoévaluation...');
  for (const tpl of assessmentTemplates) {
    await createEntry(token, 'assessment-templates', tpl);
  }

  console.log('\n✅ Seed terminé !');
  console.log(`   ${blogCategories.length} catégories blog`);
  console.log(`   ${blogTags.length} tags`);
  console.log(`   ${knowledgeCategories.length} catégories ressources`);
  console.log(`   ${serviceTypes.length} types de services`);
  console.log(`   ${structures.length} structures`);
  console.log(`   ${articles.length} articles`);
  console.log(`   ${events.length} événements`);
  console.log(`   ${newsItems.length} actualités`);
  console.log(`   ${assessmentTemplates.length} modèles d'autoévaluation`);
}

seed().catch((err) => {
  console.error('❌ Erreur seed:', err);
  process.exit(1);
});
