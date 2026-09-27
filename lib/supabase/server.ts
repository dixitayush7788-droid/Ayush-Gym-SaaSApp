// lib/supabase/server.ts
//
// Server-side Supabase clients for the App Router.
//
// Two variants are exported:
//   • createClient()             → for Server Components, Server Actions,
//                                  and Route Handlers where cookies are
//                                  READ-ONLY.
//   • createRouteHandlerClient() → for Route Handlers / Server Actions that
//                                  MUST be able to WRITE refreshed auth
//                                  cookies back to the response.
//
// Both use the ANON key. RLS enforces access. Never use the service role
// key here — reserve it for isolated backend jobs.

import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

type SupabaseCookieToSet = {
  name: string;
  value: string;
  options: CookieOptions;
};

type SupabaseConfig = {
  url: string;
  anonKey: string;
};

function getSupabaseConfig(): SupabaseConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      '[supabase/server] Missing NEXT_PUBLIC_SUPABASE_URL or ' +
        'NEXT_PUBLIC_SUPABASE_ANON_KEY. Check your deployment environment.'
    );
  }

  return { url, anonKey };
}

export function createClient(): SupabaseClient {
  const { url, anonKey } = getSupabaseConfig();
  const cookieStore = cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: SupabaseCookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // React Server Components cannot persist refreshed cookies.
          // Middleware/Route Handlers handle the actual refresh.
        }
      },
    },
  });
}

export function createRouteHandlerClient(): SupabaseClient {
  const { url, anonKey } = getSupabaseConfig();
  const cookieStore = cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: SupabaseCookieToSet[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });
}
