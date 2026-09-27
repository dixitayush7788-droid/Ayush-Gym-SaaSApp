// app/admin/dashboard/page.tsx
//
// Server Component. Fetches all metrics directly from public.gyms.
// RLS on the table guarantees only super admins receive rows.

import Link from 'next/link';
import { Building2, CheckCircle2, DoorOpen, DoorClosed, Clock, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

interface TenantMetricRow {
  is_active: boolean;
  op_status: 'OPEN' | 'CLOSED' | 'DELAYED';
}

interface DashboardMetrics {
  totalOnboarded: number;
  activeSubscriptions: number;
  operationalBreakdown: {
    open: number;
    closed: number;
    delayed: number;
  };
}

async function getMetrics(): Promise<DashboardMetrics> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('gyms')
      .select('is_active, op_status')
      .is('deleted_at', null)
      .returns<TenantMetricRow[]>();

    if (error) {
      console.error('[dashboard] failed to load metrics:', error.message);
      return {
        totalOnboarded: 0,
        activeSubscriptions: 0,
        operationalBreakdown: { open: 0, closed: 0, delayed: 0 },
      };
    }

    const rows = data ?? [];

    return {
      totalOnboarded: rows.length,
      activeSubscriptions: rows.filter((r) => r.is_active).length,
      operationalBreakdown: {
        open: rows.filter((r) => r.op_status === 'OPEN').length,
        closed: rows.filter((r) => r.op_status === 'CLOSED').length,
        delayed: rows.filter((r) => r.op_status === 'DELAYED').length,
      },
    };
  } catch (error) {
    console.error('[dashboard] metrics query threw:', error);
    return {
      totalOnboarded: 0,
      activeSubscriptions: 0,
      operationalBreakdown: { open: 0, closed: 0, delayed: 0 },
    };
  }
}

interface MetricCardProps {
  label: string;
  value: number;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: 'slate' | 'emerald' | 'amber' | 'sky';
}

const ACCENT_MAP: Record<MetricCardProps['accent'], string> = {
  slate:
    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  emerald:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
  amber:
    'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400',
  sky: 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400',
};

function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
}: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
            {value.toLocaleString()}
          </p>
          {hint && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {hint}
            </p>
          )}
        </div>
        <div
          className={[
            'inline-flex h-10 w-10 items-center justify-center rounded-lg',
            ACCENT_MAP[accent],
          ].join(' ')}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const metrics = await getMetrics();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Live overview of onboarded gyms and their operational status.
          </p>
        </div>

        <Link
          href="/admin/gyms/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
        >
          <Plus className="h-4 w-4" />
          Onboard New Gym
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Onboarded Gyms"
          value={metrics.totalOnboarded}
          icon={Building2}
          accent="slate"
          hint="All-time, excluding soft-deleted"
        />
        <MetricCard
          label="Active Subscriptions"
          value={metrics.activeSubscriptions}
          icon={CheckCircle2}
          accent="emerald"
          hint="Status = active"
        />
        <MetricCard
          label="Currently Open"
          value={metrics.operationalBreakdown.open}
          icon={DoorOpen}
          accent="sky"
        />
        <MetricCard
          label="Delayed"
          value={metrics.operationalBreakdown.delayed}
          icon={Clock}
          accent="amber"
        />
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
          Operational Status Breakdown
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400">
                <DoorOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Open
                </p>
                <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                  {metrics.operationalBreakdown.open}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <DoorClosed className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Closed
                </p>
                <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                  {metrics.operationalBreakdown.closed}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Delayed
                </p>
                <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                  {metrics.operationalBreakdown.delayed}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
