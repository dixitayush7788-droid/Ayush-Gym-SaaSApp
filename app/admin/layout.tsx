// app/admin/layout.tsx
//
// Server Component shell for the entire /admin section.
// Guarded by requireSuperAdmin() — redirects non-admins before any UI renders.
//
// Provides:
//   • Responsive sidebar (collapsible on mobile)
//   • Top header with admin email + sign-out
//   • Content area for child routes

import type { ReactNode } from 'react';
import { requireSuperAdmin } from '@/lib/auth/require-super-admin';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminHeader } from '@/components/admin/admin-header';

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Redirects to /login or /unauthorized if the caller is not a valid admin.
  const admin = await requireSuperAdmin();

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar — fixed on desktop, drawer on mobile (managed by client component) */}
      <AdminSidebar adminEmail={admin.email} />

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <AdminHeader adminEmail={admin.email} adminName={admin.full_name} />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
