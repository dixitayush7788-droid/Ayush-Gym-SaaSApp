// lib/supabase/client.ts
//
// Browser-side Supabase client.
// Use inside Client Components ("use client"), hooks, event handlers, and
// any code that runs in the user's browser.
//
// Security: uses the ANON key — row-level security on the database is what
// actually protects data. This client can only do what the current auth
// session + RLS policies allow.

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Creates a fresh browser Supabase client.
 *
 * Safe to call multiple times — @supabase/ssr returns a cached singleton
 * per browser tab, so calling it in multiple components is fine.
 */
export function createClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      '[supabase/client] Missing NEXT_PUBLIC_SUPABASE_URL or ' +
        'NEXT_PUBLIC_SUPABASE_ANON_KEY. Check your .env.local file.'
    );
  }

  return createBrowserClient(url, anonKey, {
    auth: {
      // Persist the session in cookies (not localStorage) so that the
      // server-side client can read it during SSR.
      flowType: 'pkce',
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
}

/**
 * Convenience singleton for client components that only need to read the
 * current session. Prefer calling `createClient()` inside the component so
 * each module boundary stays independent and tree-shakeable.
 */
export const supabase = createClient();
