'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { PrivateSidebar } from '@/components/layout/PrivateSidebar';
import { PrivateHeader } from '@/components/layout/PrivateHeader';

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <PrivateSidebar />
        <div className="flex flex-1 flex-col">
          <PrivateHeader />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
