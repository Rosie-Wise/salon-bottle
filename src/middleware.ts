import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { isSupabaseConfigured } from '@/lib/supabase/config';

/**
 * Public site is open to anyone — no login required for homepage, studio, or create flow.
 * Admin routes still need Supabase when configured.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let response = NextResponse.next({ request });

  // Refresh session cookies when Supabase is configured (does not block visitors)
  if (isSupabaseConfigured()) {
    response = await updateSession(request, response);
  }

  // Only /admin is restricted; everything else stays publicly reachable
  if (pathname.startsWith('/admin')) {
    if (!isSupabaseConfigured()) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('admin', 'unavailable');
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
