import { NextResponse, type NextRequest } from 'next/server';

/**
 * Bare `/booking` has no indexable page. Search (`?query=`) and `/booking/:id`
 * stay. 301 is the SEO status the checklist asks for; Next's `redirect()` is 307.
 */
export function middleware(request: NextRequest) {
  // O prefetch da árvore de rotas do router pede `/booking` sem a query; um 301
  // nele fica em cache e faz o cliente levar toda `/booking?query=` para `/`.
  // Requisições do router trazem `next-url` (o `rsc` não chega aqui). Sem
  // query, a própria página já redireciona com `permanentRedirect('/')`.
  if (request.headers.has('next-url')) {
    return NextResponse.next();
  }

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
