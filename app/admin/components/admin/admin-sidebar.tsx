// components/admin/admin-sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Dumbbell,
  LayoutDashboard,
  Building2,
  Settings,
  Menu,
  X,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/gyms', label: 'Gyms', icon: Building2 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

interface AdminSidebarProps {
  adminEmail: string;
}

export function AdminSidebar({ adminEmail }: AdminSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const NavLinks = () => (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            aria-current={active ? 'page' : undefined}
            className={[
              'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
              active
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
            ].join(' ')}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );

  const Brand = () => (
    <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-6 dark:border-slate-800">
      <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900">
        <Dumbbell className="h-4 w-4" />
      </div>
      <span className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
        Gym SaaS
      </span>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger — fixed top-left, only on small screens */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
        className="fixed left-4 top-4 z-40 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex dark:border-slate-800 dark:bg-slate-900">
        <Brand />
        <div className="flex flex-1 flex-col gap-4 py-4">
          <NavLinks />
        </div>
        <div className="border-t border-slate-200 px-6 py-4 dark:border-slate-800">
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
            {adminEmail}
          </p>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white shadow-xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800">
              <div className="flex h-16 items-center gap-2">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                  <Dumbbell className="h-4 w-4" />
                </div>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  Gym SaaS
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-1 flex-col gap-4 py-4">
              <NavLinks />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
