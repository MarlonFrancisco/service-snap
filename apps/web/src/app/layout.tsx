import { AuthModal } from '@/components/features/auth';
import { Config, CookieConsent, Toaster } from '@/components/layout';
import { ReviewsModal } from '@/components/layout/reviews-modal';
import {
  AnalyticsProvider,
  QueryProvider,
  UserIdentificationProvider,
} from '@/providers';
import { UsersService } from '@/service/users';
import { CACHE_QUERY_KEYS, getQueryClient } from '@/utils/helpers/query.helper';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { SOCIAL_PROFILE_URLS } from '@/utils/constants/social-profiles.constants';
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
  THEME_COLOR,
} from '@/utils/constants/site.constants';
import { serializeJsonLd } from '@/utils/helpers/json-ld.helper';
import {
  createPageMetadata,
  shouldIndexSite,
} from '@/utils/helpers/site-metadata.helper';
import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import './globals.css';

const rootMetadata = createPageMetadata({
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  path: '/',
});

export const metadata: Metadata = {
  ...rootMetadata,
  // Canonical, og:url e robots ficam com cada página: herdados daqui, a 404 e
  // qualquer página sem metadata própria apontariam para a home como "index".
  alternates: undefined,
  openGraph: { ...rootMetadata.openGraph, url: undefined },
  robots: shouldIndexSite() ? undefined : rootMetadata.robots,
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: THEME_COLOR,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const queryClient = getQueryClient();

  const cookieStore = await cookies();
  const userIdentification = cookieStore.get('user_identification')?.value;

  if (userIdentification) {
    const sessionHeaders = {
      Cookie: `access_token=${cookieStore.get('access_token')?.value}`,
    };

    await queryClient.prefetchQuery({
      queryKey: CACHE_QUERY_KEYS.user(userIdentification),
      queryFn: () => UsersService.getUser(sessionHeaders),
    });
  }

  const dehydratedState = dehydrate(queryClient);

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <UserIdentificationProvider value={userIdentification}>
          <AnalyticsProvider>
            <QueryProvider>
              <HydrationBoundary state={dehydratedState}>
                {children}
                <Config />
                <AuthModal />
                <Toaster />
                <ReviewsModal />
                <CookieConsent />
              </HydrationBoundary>
            </QueryProvider>
          </AnalyticsProvider>
        </UserIdentificationProvider>

        {/* <script> comum: o next/script só injeta via JS, fora do HTML inicial. */}
        <script
          type="application/ld+json"
          id="json-ld"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              // O Google usa `name` como nome do site nos resultados.
              name: SITE_NAME,
              alternateName: SITE_TITLE,
              description: SITE_DESCRIPTION,
              url: SITE_URL,
              image: `${SITE_URL}/og-image.png`,
              publisher: {
                '@type': 'Organization',
                name: SITE_NAME,
                url: SITE_URL,
                // Quadrado e acima de 112 px, como o Google pede para o logo.
                logo: `${SITE_URL}/icon-512.png`,
                sameAs: SOCIAL_PROFILE_URLS,
              },
              inLanguage: 'pt-BR',
              potentialAction: {
                '@type': 'SearchAction',
                target: `${SITE_URL}/booking?query={search_term_string}`,
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </body>
    </html>
  );
}
