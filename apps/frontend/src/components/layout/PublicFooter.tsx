import Link from 'next/link';

export function PublicFooter() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-lg font-semibold text-primary-700">Pairémancipation</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Plateforme collaborative pour le rétablissement en santé mentale.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Ressources
            </h4>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/ressources" className="text-sm text-muted-foreground hover:text-primary-700">
                  Base de connaissances
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-muted-foreground hover:text-primary-700">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/annuaire" className="text-sm text-muted-foreground hover:text-primary-700">
                  Annuaire
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Communauté
            </h4>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/agenda" className="text-sm text-muted-foreground hover:text-primary-700">
                  Agenda
                </Link>
              </li>
              <li>
                <Link href="/a-propos" className="text-sm text-muted-foreground hover:text-primary-700">
                  À propos
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Légal
            </h4>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/mentions-legales" className="text-sm text-muted-foreground hover:text-primary-700">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="/politique-confidentialite" className="text-sm text-muted-foreground hover:text-primary-700">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link href="/cgu" className="text-sm text-muted-foreground hover:text-primary-700">
                  CGU
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Pairémancipation. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
