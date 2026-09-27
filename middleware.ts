import { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@/lib/supabase/middleware';

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient(request);

  // Refresh the Supabase session before protected Server Components render.
  await supabase.auth.getUser();

  return response;
}
