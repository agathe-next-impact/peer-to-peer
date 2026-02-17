import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Accueil | Pairémancipation',
  description:
    'Plateforme collaborative pour le rétablissement en santé mentale. Ressources, annuaire, outils personnels.',
};

export default function HomePage() {
  return (
    <main id="main-content" className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-primary-900 sm:text-6xl">
          Pairémancipation
        </h1>
        <p className="mb-8 text-lg text-muted-foreground">
          Plateforme collaborative pour le rétablissement en santé mentale.
          Ressources, annuaire, outils personnels et communauté de pairs-aidants.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <a
            href="/ressources"
            className="rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          >
            Découvrir les ressources
          </a>
          <a
            href="/annuaire"
            className="rounded-lg border border-primary-300 px-6 py-3 font-semibold text-primary-700 shadow-sm hover:bg-primary-50"
          >
            Consulter l&apos;annuaire
          </a>
        </div>
      </div>
    </main>
  );
}
