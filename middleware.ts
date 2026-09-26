import { NextResponse, type NextRequest } from 'next/server';
import { createMiddlewareClient } from '@/lib/supabase/middleware';

const PROTECTED_PREFIXES = ['/admin'] as const;
const AUTH_ROUTES = ['/login', '/forgot-password', '/reset-password'] as const;

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient(request);
  const { pathname, search } = request.nextUrl;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthRoute = AUTH_ROUTES.some((p) => pathname.startsWith(p));

  if (!user) {
    if (isProtected) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirectTo', pathname + search);
      return NextResponse.redirect(url);
    }
    return response;
  }

  const needsRoleCheck = isProtected || isAuthRoute;

  if (needsRoleCheck) {
    const { data: adminRow, error } = await supabase
      .from('super_admins')
      .select('id, is_active')
      .eq('id', user.id)
      .maybeSingle();

    const isSuperAdmin = !error && adminRow?.is_active === true;

    if (isProtected && !isSuperAdmin) {
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = '/unauthorized';
      url.search = '';
      return NextResponse.redirect(url);
    }

    if (isAuthRoute && isSuperAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      url.search = '';
      return NextResponse.redirect(url);
    }
  }

  return response;
}
