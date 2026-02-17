import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation — Pairémancipation",
  description:
    "Conditions générales d'utilisation de la plateforme Pairémancipation.",
};

export default function CguPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <article className="prose prose-lg max-w-none">
        <h1>Conditions générales d&apos;utilisation</h1>
        <p className="lead">
          En vigueur au{' '}
          {new Date().toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>

        <h2>Article 1 — Objet</h2>
        <p>
          Les présentes CGU régissent l&apos;utilisation de la plateforme
          Pairémancipation, un service numérique dédié au rétablissement en santé
          mentale par le pair-accompagnement. Toute inscription ou utilisation du
          service implique l&apos;acceptation sans réserve des présentes conditions.
        </p>

        <h2>Article 2 — Accès au service</h2>
        <p>
          L&apos;accès à la zone publique (blog, ressources, annuaire, agenda,
          actualités) est libre et gratuit. L&apos;accès à la zone privée (carnet de
          bord, objectifs, autoévaluation, calendrier, documents) nécessite la
          création d&apos;un compte utilisateur.
        </p>
        <p>
          L&apos;utilisateur s&apos;engage à fournir des informations exactes lors de
          son inscription et à maintenir la confidentialité de ses identifiants.
        </p>

        <h2>Article 3 — Données de santé</h2>
        <p>
          L&apos;utilisateur est informé que les données saisies dans la zone privée
          constituent des données de santé au sens de l&apos;article 9 du RGPD. Ces
          données sont :
        </p>
        <ul>
          <li>
            <strong>Chiffrées côté client</strong> (AES-256-GCM) avant tout envoi
            au serveur — seul l&apos;utilisateur possède la clé de déchiffrement.
          </li>
          <li>
            <strong>Hébergées en France</strong> chez un prestataire certifié HDS
            (Hébergement de Données de Santé).
          </li>
          <li>
            <strong>Isolées</strong> dans un schéma PostgreSQL dédié avec contrôle
            d&apos;accès strict.
          </li>
        </ul>
        <p>
          L&apos;utilisateur est seul responsable de la conservation de son mot de
          passe et de son code de récupération. En cas de perte, les données
          chiffrées sont irrécupérables.
        </p>

        <h2>Article 4 — Avertissement médical</h2>
        <p>
          Pairémancipation <strong>n&apos;est pas un service médical</strong>. Les
          informations, outils et ressources fournis ne remplacent en aucun cas un
          avis médical professionnel, un diagnostic ou un traitement.
        </p>
        <p>En cas d&apos;urgence :</p>
        <ul>
          <li>
            <strong>3114</strong> — Numéro national de prévention du suicide (24h/24)
          </li>
          <li>
            <strong>15 (SAMU)</strong> — Urgence médicale
          </li>
          <li>
            <strong>114</strong> — Numéro d&apos;urgence par SMS
          </li>
        </ul>

        <h2>Article 5 — Contributions</h2>
        <p>
          Les contributions des utilisateurs (articles, fiches structures,
          événements, corrections) sont soumises à modération. L&apos;utilisateur
          garantit :
        </p>
        <ul>
          <li>Disposer des droits nécessaires sur le contenu publié</li>
          <li>
            Ne pas publier de contenu illicite, diffamatoire, discriminatoire ou
            portant atteinte aux droits d&apos;autrui
          </li>
          <li>Ne pas communiquer de données personnelles de tiers sans consentement</li>
        </ul>
        <p>
          Pairémancipation se réserve le droit de refuser ou retirer toute
          contribution qui contreviendrait aux présentes CGU.
        </p>

        <h2>Article 6 — Propriété intellectuelle</h2>
        <p>
          Le code source de la plateforme est open source. Les contenus
          rédactionnels sont la propriété de leurs auteurs et sont partagés sous
          licence <strong>Creative Commons BY-NC-SA 4.0</strong> sauf mention
          contraire.
        </p>

        <h2>Article 7 — Responsabilité</h2>
        <p>
          Pairémancipation s&apos;engage à mettre en œuvre les moyens nécessaires
          pour assurer la disponibilité et la sécurité du service, sans obligation
          de résultat. La plateforme ne saurait être tenue responsable :
        </p>
        <ul>
          <li>Des interruptions de service pour maintenance ou force majeure</li>
          <li>De la perte de données résultant de la perte du mot de passe par l&apos;utilisateur</li>
          <li>
            Des conséquences de l&apos;utilisation des informations publiées sur la
            plateforme
          </li>
        </ul>

        <h2>Article 8 — Résiliation</h2>
        <p>
          L&apos;utilisateur peut supprimer son compte à tout moment depuis son
          espace personnel (Mon profil → Supprimer mon compte). La suppression
          entraîne l&apos;effacement irréversible de toutes les données
          personnelles, conformément au droit à l&apos;effacement (article 17 du
          RGPD).
        </p>

        <h2>Article 9 — Modification des CGU</h2>
        <p>
          Pairémancipation se réserve le droit de modifier les présentes CGU. Les
          utilisateurs seront informés de toute modification substantielle par
          email ou notification dans l&apos;application.
        </p>

        <h2>Article 10 — Droit applicable</h2>
        <p>
          Les présentes CGU sont soumises au droit français. Tout litige relatif à
          l&apos;utilisation de la plateforme relève de la compétence exclusive des
          tribunaux français.
        </p>

        <h2>Contact</h2>
        <p>
          Pour toute question relative aux présentes CGU :<br />
          <strong>contact@pairemancipation.fr</strong>
        </p>
      </article>
    </div>
  );
}
