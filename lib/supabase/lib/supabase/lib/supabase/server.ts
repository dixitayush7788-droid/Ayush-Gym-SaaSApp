// lib/supabase/server.ts
//
// Server-side Supabase clients for the App Router.
//
// Two variants are exported:
//   • createClient()             → for Server Components, Server Actions,
//                                  and Route Handlers where cookies are
//                                  READ-ONLY (RSC render, GET handlers).
//   • createRouteHandlerClient() → for Route Handlers / Server Actions that
//                                  MUST be able to WRITE refreshed auth
//                                  cookies back to the response.
//
// Both use the ANON key. RLS enforces access. Never use the service role
// key here — reserve it for isolated backend jobs.

import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

// -----------------------------------------------------------------------------
// Environment validation (fail fast at module load, not at first query)
// -----------------------------------------------------------------------------
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    '[supabase/server] Missing NEXT_PUBLIC_SUPABASE_URL or ' +
      'NEXT_PUBLIC_SUPABASE_ANON_KEY. Check your .env.local file.'
  );
}

// -----------------------------------------------------------------------------
// Server Component / Server Action / Route Handler client
// -----------------------------------------------------------------------------
/**
 * Returns a Supabase client bound to the current request's cookies.
 *
 * IMPORTANT: In React Server Components the cookie store is READ-ONLY.
 * The `setAll` handler below silently swallows write attempts — that is
 * expected. If a write is actually required (e.g. refreshing an expired
 * token during a Server Action), use `createRouteHandlerClient()` instead,
 * or add a `middleware.ts` that refreshes the session for every request.
 */
export function createClient(): SupabaseClient {
  const cookieStore = cookies();

  return createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options as CookieOptions);
          });
        } catch {
          // Called from a React Server Component — cookies are read-only.
          // This is safe to ignore; a middleware or Route Handler will
          // handle the actual refresh.
        }
      },
    },
  });
}

// -----------------------------------------------------------------------------
// Route Handler / Server Action client (can write cookies)
// -----------------------------------------------------------------------------
/**
 * Returns a Supabase client that CAN persist refreshed auth cookies.
 *
 * Use in:
 *   • app/api/**/route.ts   (POST, PUT, DELETE, PATCH)
 *   • Server Actions         ("use server")
 *
 * Not needed for GET route handlers or RSC pages — use `createClient()`
 * there instead.
 */
export function createRouteHandlerClient(): SupabaseClient {
  const cookieStore = cookies();

  return createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // In Route Handlers and Server Actions, `cookies().set()` is
        // permitted and will be flushed to the outgoing response.
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options as CookieOptions);
        });
      },
    },
  });
}
