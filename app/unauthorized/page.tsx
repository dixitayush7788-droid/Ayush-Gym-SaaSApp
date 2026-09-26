import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <h1 className="text-3xl font-bold text-red-600">Access Denied</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        Your account does not have Super Admin privileges.
      </p>
      <Link
        href="/login"
        className="mt-6 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900"
      >
        Return to Login
      </Link>
    </main>
  );
}
