// components/admin/admin-header.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { LogOut, Loader2, UserCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface AdminHeaderProps {
  adminEmail: string;
  adminName: string | null;
}

export function AdminHeader({ adminEmail, adminName }: AdminHeaderProps) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [, startTransition] = useTransition();

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();

    startTransition(() => {
      router.push('/login');
      router.refresh();
    });
  }

  const displayName = adminName?.trim() || adminEmail.split('@')[0];

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/80 px-4 backdrop-blur sm:px-6 lg:px-8 dark:border-slate-800 dark:bg-slate-900/80">
      {/* Left spacer — offset for the mobile hamburger button */}
      <div className="w-10 lg:hidden" aria-hidden="true" />

      <div className="hidden lg:block">
        <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Super Admin Portal
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 sm:flex">
          <UserCircle2 className="h-8 w-8 text-slate-400" />
          <div className="leading-tight">
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {displayName}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {adminEmail}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {signingOut ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  );
}
