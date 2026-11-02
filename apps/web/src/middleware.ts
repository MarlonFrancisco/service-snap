import { NextResponse, type NextRequest } from 'next/server';

/**
 * Bare `/booking` has no indexable page. Search (`?query=`) and `/booking/:id`
 * stay. 301 is the SEO status the checklist asks for; Next's `redirect()` is 307.
 */
export function middleware(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('query')?.trim();
  if (query) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = '/';
  url.search = '';
  return NextResponse.redirect(url, 301);
}

export const config = {
  matcher: '/booking',
};
