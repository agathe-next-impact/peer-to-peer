'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const navItems = [
  { label: 'Ressources', href: '/ressources' },
  { label: 'Blog', href: '/blog' },
  { label: 'Annuaire', href: '/annuaire' },
  { label: 'Agenda', href: '/agenda' },
  { label: 'Actualités', href: '/actualites' },
  { label: 'À propos', href: '/a-propos' },
];

export function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary-700">Pairémancipation</span>
        </Link>

        {/* Navigation desktop */}
        <nav className="hidden items-center gap-6 md:flex" aria-label="Navigation principale">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary-700"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/connexion"
            className="text-sm font-medium text-primary-700 hover:text-primary-800"
          >
            Connexion
          </Link>
          <Link
            href="/inscription"
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            Inscription
          </Link>
        </div>

        {/* Bouton menu mobile */}
        <button
          type="button"
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Navigation mobile */}
      {mobileOpen && (
        <nav className="border-t md:hidden" aria-label="Navigation mobile">
          <div className="space-y-1 px-4 pb-4 pt-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-md px-3 py-2 text-base font-medium text-muted-foreground hover:bg-muted hover:text-primary-700"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <hr className="my-2" />
            <Link
              href="/connexion"
              className="block rounded-md px-3 py-2 text-base font-medium text-primary-700"
              onClick={() => setMobileOpen(false)}
            >
              Connexion
            </Link>
            <Link
              href="/inscription"
              className="block rounded-md bg-primary-600 px-3 py-2 text-center text-base font-medium text-white"
              onClick={() => setMobileOpen(false)}
            >
              Inscription
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
