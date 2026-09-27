import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@/lib/supabase/middleware';

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

export async function middleware(request: NextRequest) {
  // Keep public entry points independent of auth/network failures during SSR.
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');

  if (!isAdminRoute) {
    return NextResponse.next();
  }

  try {
    const { supabase, response } = createMiddlewareClient(request);

    try {
      const { error } = await supabase.auth.getUser();

      if (error) {
        console.warn('[middleware] Supabase session check failed:', error.message);
      }
    } catch (error) {
      console.error('[middleware] Supabase session check threw:', error);
    }

    return response;
  } catch (error) {
    // Never turn an auth infrastructure problem into a site-wide 500.
    // The protected Server Component guard will redirect unauthenticated requests.
    console.error('[middleware] Supabase middleware unavailable:', error);
    return NextResponse.next();
  }
}
