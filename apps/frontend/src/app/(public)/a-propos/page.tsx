import type { Metadata } from 'next';
import { Heart, Users, Shield, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'À propos — Pairémancipation',
  description:
    'Découvrez la mission de Pairémancipation : une plateforme de pair-accompagnement en santé mentale pour favoriser le rétablissement.',
};

const VALUES = [
  {
    icon: Heart,
    title: 'Pair-accompagnement',
    description:
      "Le savoir expérientiel est une ressource précieuse. Nous croyons que l'entraide entre pairs est un levier puissant de rétablissement.",
  },
  {
    icon: Shield,
    title: 'Confidentialité',
    description:
      'Vos données de santé sont chiffrées de bout en bout. Nous appliquons les normes HDS (Hébergement de Données de Santé) les plus strictes.',
  },
  {
    icon: Users,
    title: 'Communauté',
    description:
      'Nous construisons un réseau solidaire de personnes concernées, de proches et de professionnels engagés dans le rétablissement.',
  },
  {
    icon: BookOpen,
    title: 'Connaissance partagée',
    description:
      'Notre base de connaissances est co-construite par la communauté pour offrir des ressources fiables et accessibles à tous.',
  },
];

export default function AProposPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="mb-16 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">À propos de Pairémancipation</h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Pairémancipation est une plateforme numérique dédiée au rétablissement en santé mentale
          par le pair-accompagnement. Notre mission : donner à chacun les outils pour être acteur
          de son propre parcours.
        </p>
      </section>

      {/* Mission */}
      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-bold">Notre mission</h2>
        <div className="prose prose-lg max-w-none">
          <p>
            Le rétablissement en santé mentale est un processus personnel et unique. Il ne
            s&apos;agit pas seulement de la réduction des symptômes, mais d&apos;un chemin
            vers une vie pleine de sens, malgré les défis posés par les troubles psychiques.
          </p>
          <p>
            Pairémancipation s&apos;appuie sur le savoir expérientiel — cette connaissance
            unique acquise par ceux qui ont traversé des difficultés similaires — pour créer
            un espace d&apos;entraide, de partage et de progression.
          </p>
          <p>
            La plateforme offre un carnet de bord confidentiel, des outils d&apos;autoévaluation,
            un annuaire de structures de soutien, et une base de connaissances co-construite
            par la communauté.
          </p>
        </div>
      </section>

      {/* Valeurs */}
      <section className="mb-16">
        <h2 className="mb-8 text-2xl font-bold">Nos valeurs</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {VALUES.map((value) => (
            <div key={value.title} className="rounded-lg border bg-card p-6">
              <value.icon className="mb-3 h-8 w-8 text-primary-700" />
              <h3 className="mb-2 text-lg font-semibold">{value.title}</h3>
              <p className="text-sm text-muted-foreground">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sécurité */}
      <section className="rounded-lg border bg-primary-50 p-8">
        <h2 className="mb-4 text-2xl font-bold">Sécurité et confidentialité</h2>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Chiffrement zero-knowledge :</strong> vos
            données personnelles de santé sont chiffrées côté client avant d&apos;être
            envoyées au serveur. Personne — pas même nous — ne peut les lire.
          </p>
          <p>
            <strong className="text-foreground">Hébergement HDS :</strong> nos serveurs
            sont hébergés chez un prestataire certifié HDS (Hébergement de Données de
            Santé), conformément à la réglementation française.
          </p>
          <p>
            <strong className="text-foreground">Conformité RGPD :</strong> vous gardez le
            contrôle total sur vos données. Vous pouvez les exporter ou les supprimer à
            tout moment.
          </p>
        </div>
      </section>
    </div>
  );
}
