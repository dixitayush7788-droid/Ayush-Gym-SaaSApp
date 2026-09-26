'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { Dumbbell, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import {
  loginAction,
  INITIAL_LOGIN_STATE,
  type LoginActionState,
} from './actions';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="group relative inline-flex w-full items-center justify-center gap-2
                 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white
                 shadow-sm transition
                 hover:bg-slate-800
                 focus-visible:outline focus-visible:outline-2
                 focus-visible:outline-offset-2 focus-visible:outline-slate-900
                 disabled:cursor-not-allowed disabled:opacity-60
                 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100
                 dark:focus-visible:outline-white"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Signing in…
        </>
      ) : (
        <>
          <Lock className="h-4 w-4" aria-hidden="true" />
          Sign in
        </>
      )}
    </button>
  );
}

function PasswordField({ error }: { error?: string }) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label
        htmlFor="password"
        className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
      >
        Password
      </label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Lock className="h-4 w-4 text-slate-400" aria-hidden="true" />
        </div>
        <input
          id="password"
          name="password"
          type={visible ? 'text' : 'password'}
          autoComplete="current-password"
          required
          placeholder="••••••••"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'password-error' : undefined}
          className="block w-full rounded-lg border border-slate-300 bg-white py-2.5
                     pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400
                     shadow-sm transition
                     focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900
                     dark:border-slate-700 dark:bg-slate-900 dark:text-white
                     dark:placeholder:text-slate-500
                     dark:focus:border-white dark:focus:ring-white"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400
                     transition hover:text-slate-600 dark:hover:text-slate-200"
        >
          {visible ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>
      {error && (
        <p
          id="password-error"
          className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') ?? '/admin';

  const [state, formAction] = useFormState<LoginActionState, FormData>(
    loginAction,
    INITIAL_LOGIN_STATE
  );

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <input type="hidden" name="redirectTo" value={redirectTo} />

      {state.status === 'error' && state.message && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm
                     text-red-800
                     dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
        >
          {state.message}
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Email address
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Mail className="h-4 w-4 text-slate-400" aria-hidden="true" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="admin@yourdomain.com"
            aria-invalid={Boolean(state.fieldErrors?.email)}
            aria-describedby={
              state.fieldErrors?.email ? 'email-error' : undefined
            }
            className="block w-full rounded-lg border border-slate-300 bg-white py-2.5
                       pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400
                       shadow-sm transition
                       focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900
                       dark:border-slate-700 dark:bg-slate-900 dark:text-white
                       dark:placeholder:text-slate-500
                       dark:focus:border-white dark:focus:ring-white"
          />
        </div>
        {state.fieldErrors?.email && (
          <p
            id="email-error"
            className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400"
          >
            {state.fieldErrors.email}
          </p>
        )}
      </div>

      <PasswordField error={state.fieldErrors?.password} />

      <SubmitButton />

      <p className="text-center text-xs text-slate-500 dark:text-slate-400">
        Restricted area. Super Admin access only.
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main
      className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12
                 dark:bg-slate-950"
    >
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div
            className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl
                       bg-slate-900 text-white shadow-lg
                       dark:bg-white dark:text-slate-900"
          >
            <Dumbbell className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Super Admin
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Sign in to manage gym tenants
          </p>
        </div>

        <div
          className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm
                     dark:border-slate-800 dark:bg-slate-900"
        >
          <Suspense
            fallback={
              <div className="flex h-40 items-center justify-center">
                <Loader2
                  className="h-5 w-5 animate-spin text-slate-400"
                  aria-hidden="true"
                />
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
          &copy; {new Date().getFullYear()} Gym Management SaaS. All rights reserved.
        </p>
      </div>
    </main>
  );
}
