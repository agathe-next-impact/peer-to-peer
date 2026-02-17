import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politique de confidentialité — Pairémancipation',
  description: 'Politique de confidentialité et protection des données personnelles.',
};

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <article className="prose prose-lg max-w-none">
        <h1>Politique de confidentialité</h1>
        <p className="lead">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        <h2>1. Responsable du traitement</h2>
        <p>
          Le responsable du traitement des données est l&apos;association Pairémancipation,
          dont le siège social est situé en France.
        </p>

        <h2>2. Données collectées</h2>
        <h3>2.1 Données d&apos;inscription</h3>
        <ul>
          <li>Nom d&apos;utilisateur</li>
          <li>Adresse email</li>
          <li>Mot de passe (hashé, jamais stocké en clair)</li>
        </ul>

        <h3>2.2 Données de santé (zone privée)</h3>
        <p>
          Les données de santé (carnet de bord, objectifs, autoévaluations, documents personnels)
          sont <strong>chiffrées de bout en bout</strong> côté client avant envoi au serveur.
          Pairémancipation ne peut ni lire, ni accéder à ces données en clair.
        </p>

        <h3>2.3 Données de navigation</h3>
        <p>
          Nous ne collectons aucune donnée de navigation à des fins publicitaires. Seuls des
          cookies techniques strictement nécessaires au fonctionnement du site sont utilisés.
        </p>

        <h2>3. Finalités du traitement</h2>
        <ul>
          <li>Gestion des comptes utilisateurs</li>
          <li>Fourniture des services de la plateforme</li>
          <li>Envoi d&apos;emails transactionnels (réinitialisation de mot de passe)</li>
          <li>Statistiques anonymisées d&apos;utilisation</li>
        </ul>

        <h2>4. Base légale</h2>
        <p>
          Le traitement des données repose sur le consentement de l&apos;utilisateur (article 6.1.a
          du RGPD) et l&apos;exécution du contrat de service (article 6.1.b).
        </p>
        <p>
          Pour les données de santé (catégorie spéciale, article 9 du RGPD), le traitement repose
          sur le consentement explicite de la personne concernée.
        </p>

        <h2>5. Durée de conservation</h2>
        <ul>
          <li>Données de compte : jusqu&apos;à suppression du compte</li>
          <li>Données de santé chiffrées : jusqu&apos;à suppression par l&apos;utilisateur</li>
          <li>Logs d&apos;accès : 12 mois (obligation légale)</li>
          <li>Sauvegardes : 90 jours maximum</li>
        </ul>

        <h2>6. Hébergement et sécurité</h2>
        <p>
          Les données sont hébergées en France chez un prestataire certifié <strong>HDS</strong>
          (Hébergement de Données de Santé), conformément aux articles L.1111-8 et R.1111-8-8
          du Code de la santé publique.
        </p>
        <ul>
          <li>Chiffrement des communications (TLS 1.2+)</li>
          <li>Chiffrement zero-knowledge des données de santé (AES-256-GCM)</li>
          <li>Isolation des données dans un schéma PostgreSQL dédié</li>
          <li>Journalisation des accès avec audit trail</li>
        </ul>

        <h2>7. Vos droits</h2>
        <p>Conformément au RGPD, vous disposez des droits suivants :</p>
        <ul>
          <li><strong>Droit d&apos;accès</strong> : consulter vos données personnelles</li>
          <li><strong>Droit de rectification</strong> : corriger vos données</li>
          <li><strong>Droit à l&apos;effacement</strong> : supprimer votre compte et toutes vos données</li>
          <li><strong>Droit à la portabilité</strong> : exporter vos données (format JSON)</li>
          <li><strong>Droit d&apos;opposition</strong> : vous opposer à certains traitements</li>
          <li><strong>Droit de retrait du consentement</strong> : à tout moment</li>
        </ul>
        <p>
          Pour exercer vos droits, connectez-vous à votre espace personnel ou contactez-nous
          à l&apos;adresse : <strong>dpo@pairemancipation.fr</strong>
        </p>

        <h2>8. Cookies</h2>
        <p>
          Nous utilisons uniquement des cookies techniques strictement nécessaires au
          fonctionnement du site (session d&apos;authentification). Aucun cookie publicitaire
          ou de pistage n&apos;est utilisé.
        </p>

        <h2>9. Sous-traitants</h2>
        <p>
          Les données sont traitées exclusivement en France et dans l&apos;Union Européenne.
          Aucun transfert de données hors UE n&apos;est effectué.
        </p>

        <h2>10. Contact DPO</h2>
        <p>
          Délégué à la protection des données :<br />
          Email : <strong>dpo@pairemancipation.fr</strong>
        </p>
        <p>
          Vous pouvez également adresser une réclamation à la CNIL (www.cnil.fr).
        </p>
      </article>
    </div>
  );
}
