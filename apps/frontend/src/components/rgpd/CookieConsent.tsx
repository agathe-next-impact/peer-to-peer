'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const CONSENT_KEY = 'pe_cookie_consent';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      setVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card p-4 shadow-lg"
      role="alert"
      aria-live="polite"
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 sm:flex-row">
        <p className="flex-1 text-sm text-muted-foreground">
          Ce site utilise uniquement des cookies techniques strictement nécessaires au
          fonctionnement du service. Aucun cookie publicitaire ou de pistage n&apos;est utilisé.{' '}
          <Link
            href="/politique-confidentialite"
            className="text-primary-700 hover:underline"
          >
            En savoir plus
          </Link>
        </p>
        <button
          type="button"
          onClick={accept}
          className="shrink-0 rounded-md bg-primary-600 px-6 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          J&apos;ai compris
        </button>
      </div>
    </div>
  );
}
