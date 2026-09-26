// app/admin/gyms/new/page.tsx
'use client';

import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { useState } from 'react';
import {
  ArrowLeft,
  Building2,
  User,
  Phone,
  Mail,
  Calendar,
  IndianRupee,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  onboardGymAction,
  INITIAL_ONBOARD_STATE,
  type OnboardGymState,
} from './actions';

const inputBase =
  'block w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-white dark:focus:ring-white';

const labelBase =
  'mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300';

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
      {message}
    </p>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Onboarding…
        </>
      ) : (
        <>
          <CheckCircle2 className="h-4 w-4" />
          Onboard Gym
        </>
      )}
    </button>
  );
}

export default function NewGymPage() {
  const [state, formAction] = useFormState<OnboardGymState, FormData>(
    onboardGymAction,
    INITIAL_ONBOARD_STATE
  );

  const [plan, setPlan] = useState<'1_month' | '2_months' | '3_months' | 'custom'>(
    '1_month'
  );

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <Link
        href="/admin/dashboard"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Onboard New Gym
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Register a gym tenant and set up its subscription.
        </p>
      </div>

      {state.status === 'success' && state.message && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.message}</span>
        </div>
      )}

      {state.status === 'error' && state.message && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.message}</span>
        </div>
      )}

      <form
        action={formAction}
        noValidate
        className="space-y-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900"
      >
        <section className="space-y-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Gym & Owner
          </h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="gym_name" className={labelBase}>
                Gym Real Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Building2 className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="gym_name"
                  name="gym_name"
                  type="text"
                  required
                  placeholder="Iron Paradise Fitness"
                  className={inputBase}
                />
              </div>
              <FieldError id="gym_name-error" message={state.fieldErrors?.gym_name} />
            </div>

            <div>
              <label htmlFor="owner_name" className={labelBase}>
                Owner Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="owner_name"
                  name="owner_name"
                  type="text"
                  required
                  placeholder="Rahul Sharma"
                  className={inputBase}
                />
              </div>
              <FieldError id="owner_name-error" message={state.fieldErrors?.owner_name} />
            </div>

            <div>
              <label htmlFor="owner_phone" className={labelBase}>
                Mobile Number (+91) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Phone className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="owner_phone"
                  name="owner_phone"
                  type="tel"
                  required
                  placeholder="9876543210"
                  className={inputBase}
                />
              </div>
              <FieldError id="owner_phone-error" message={state.fieldErrors?.owner_phone} />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="owner_email" className={labelBase}>
                Owner Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="owner_email"
                  name="owner_email"
                  type="email"
                  required
                  placeholder="owner@gym.com"
                  className={inputBase}
                />
              </div>
              <FieldError id="owner_email-error" message={state.fieldErrors?.owner_email} />
            </div>
          </div>
        </section>

        <section className="space-y-5 border-t border-slate-200 pt-6 dark:border-slate-800">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Subscription & Pricing
          </h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="subscription_plan" className={labelBase}>
                Subscription Validity <span className="text-red-500">*</span>
              </label>
              <select
                id="subscription_plan"
                name="subscription_plan"
                value={plan}
                onChange={(e) => setPlan(e.target.value as any)}
                className={inputBase}
              >
                <option value="1_month">1 Month</option>
                <option value="2_months">2 Months</option>
                <option value="3_months">3 Months</option>
                <option value="custom">Custom Date</option>
              </select>
            </div>

            <div>
              <label htmlFor="subscription_price" className={labelBase}>
                Subscription Price (Override) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <IndianRupee className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="subscription_price"
                  name="subscription_price"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  placeholder="2999"
                  className={inputBase}
                />
              </div>
              <FieldError id="subscription_price-error" message={state.fieldErrors?.subscription_price} />
            </div>

            <div>
              <label htmlFor="subscription_start_date" className={labelBase}>
                Start Date
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Calendar className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="subscription_start_date"
                  name="subscription_start_date"
                  type="date"
                  defaultValue={today}
                  className={inputBase}
                />
              </div>
            </div>

            {plan === 'custom' && (
              <div>
                <label htmlFor="subscription_end_date" className={labelBase}>
                  Custom End Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Calendar className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    id="subscription_end_date"
                    name="subscription_end_date"
                    type="date"
                    className={inputBase}
                  />
                </div>
                <FieldError id="subscription_end_date-error" message={state.fieldErrors?.subscription_end_date} />
              </div>
            )}
          </div>
        </section>

        <div className="flex justify-end pt-4">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
