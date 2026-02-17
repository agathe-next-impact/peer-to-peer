'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Target,
  ClipboardCheck,
  Calendar,
  FileText,
  User,
  Heart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/uiStore';

const navItems = [
  { label: 'Tableau de bord', href: '/espace-prive', icon: LayoutDashboard },
  { label: 'Carnet de bord', href: '/espace-prive/carnet', icon: BookOpen },
  { label: 'Objectifs', href: '/espace-prive/objectifs', icon: Target },
  { label: 'Autoévaluation', href: '/espace-prive/autoevaluation', icon: ClipboardCheck },
  { label: 'Calendrier', href: '/espace-prive/calendrier', icon: Calendar },
  { label: 'Documents', href: '/espace-prive/documents', icon: FileText },
  { label: 'Mon profil', href: '/espace-prive/profil', icon: User },
  { label: 'Rétablissement', href: '/espace-prive/retablissement', icon: Heart },
];

export function PrivateSidebar() {
  const pathname = usePathname();
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

  return (
    <aside
      className={cn(
        'sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r bg-card transition-transform',
        !sidebarOpen && '-translate-x-full md:translate-x-0',
      )}
    >
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="text-lg font-bold text-primary-700">
          Pairémancipation
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Navigation espace privé">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/espace-prive' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t px-3 py-3">
        <div className="rounded-md bg-primary-50 p-3">
          <p className="text-xs text-primary-700">
            Vos données de santé sont chiffrées de bout en bout.
          </p>
        </div>
      </div>
    </aside>
  );
}
