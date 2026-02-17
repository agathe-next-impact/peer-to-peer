import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mentions légales — Pairémancipation',
  description: 'Mentions légales et conditions générales d\'utilisation.',
};

export default function MentionsLegalesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <article className="prose prose-lg max-w-none">
        <h1>Mentions légales</h1>

        <h2>1. Éditeur du site</h2>
        <p>
          Association Pairémancipation<br />
          Siège social : France<br />
          Email : contact@pairemancipation.fr
        </p>

        <h2>2. Hébergeur</h2>
        <p>
          Hébergeur certifié HDS (Hébergement de Données de Santé)<br />
          Localisation : France
        </p>

        <h2>3. Conditions générales d&apos;utilisation</h2>

        <h3>3.1 Objet</h3>
        <p>
          Les présentes CGU régissent l&apos;utilisation de la plateforme Pairémancipation,
          un service numérique dédié au rétablissement en santé mentale par le
          pair-accompagnement.
        </p>

        <h3>3.2 Accès au service</h3>
        <p>
          L&apos;accès à la zone publique (blog, ressources, annuaire, agenda) est libre et
          gratuit. L&apos;accès à la zone privée (carnet de bord, objectifs, autoévaluation)
          nécessite la création d&apos;un compte.
        </p>

        <h3>3.3 Données de santé</h3>
        <p>
          L&apos;utilisateur est informé que les données saisies dans la zone privée sont des
          données de santé au sens du RGPD. Ces données sont chiffrées côté client et
          l&apos;utilisateur est seul responsable de la conservation de sa clé de chiffrement.
        </p>

        <h3>3.4 Responsabilité</h3>
        <p>
          Pairémancipation n&apos;est pas un service médical. Les informations fournies ne
          remplacent pas un avis médical professionnel. En cas d&apos;urgence, contactez le
          3114 (numéro national de prévention du suicide) ou le 15 (SAMU).
        </p>

        <h3>3.5 Contributions</h3>
        <p>
          Les contributions des utilisateurs (articles, fiches structures, événements) sont
          soumises à modération. L&apos;utilisateur garantit qu&apos;il dispose des droits
          nécessaires sur le contenu publié.
        </p>

        <h3>3.6 Propriété intellectuelle</h3>
        <p>
          Le code source de la plateforme est open source. Les contenus rédactionnels sont
          la propriété de leurs auteurs et sont partagés sous licence Creative Commons
          BY-NC-SA 4.0 sauf mention contraire.
        </p>

        <h3>3.7 Résiliation</h3>
        <p>
          L&apos;utilisateur peut supprimer son compte à tout moment depuis son espace
          personnel. La suppression entraîne l&apos;effacement irréversible de toutes les
          données personnelles.
        </p>

        <h2>4. Droit applicable</h2>
        <p>
          Les présentes mentions légales et CGU sont soumises au droit français. Tout litige
          relève de la compétence des tribunaux français.
        </p>
      </article>
    </div>
  );
}
