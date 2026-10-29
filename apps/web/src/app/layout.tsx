import { AuthModal } from '@/components/features/auth';
import { Config, MobileSearchOverlay, Toaster } from '@/components/layout';
import { ReviewsModal } from '@/components/layout/reviews-modal';
import { QueryProvider } from '@/providers';
import { UsersService } from '@/service/users';
import { CACHE_QUERY_KEYS, getQueryClient } from '@/utils/helpers/query.helper';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { SITE_URL, THEME_COLOR } from '@/utils/constants/site.constants';
import { createPageMetadata } from '@/utils/helpers/site-metadata.helper';
import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { cookies } from 'next/headers';
import Script from 'next/script';
import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
});
const monaSans = localFont({
  src: [
    // Regular weights
    {
      path: './fonts/Mona_Sans/static/MonaSans-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/Mona_Sans/static/MonaSans-Italic.ttf',
      weight: '400',
      style: 'italic',
    },

    // Medium weight
    {
      path: './fonts/Mona_Sans/static/MonaSans-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/Mona_Sans/static/MonaSans-MediumItalic.ttf',
      weight: '500',
      style: 'italic',
    },

    // SemiBold weight
    {
      path: './fonts/Mona_Sans/static/MonaSans-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: './fonts/Mona_Sans/static/MonaSans-SemiBoldItalic.ttf',
      weight: '600',
      style: 'italic',
    },

    // Bold weight
    {
      path: './fonts/Mona_Sans/static/MonaSans-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: './fonts/Mona_Sans/static/MonaSans-BoldItalic.ttf',
      weight: '700',
      style: 'italic',
    },

    // ExtraBold weight
    {
      path: './fonts/Mona_Sans/static/MonaSans-ExtraBold.ttf',
      weight: '800',
      style: 'normal',
    },
    {
      path: './fonts/Mona_Sans/static/MonaSans-ExtraBoldItalic.ttf',
      weight: '800',
      style: 'italic',
    },

    // Black weight
    {
      path: './fonts/Mona_Sans/static/MonaSans-Black.ttf',
      weight: '900',
      style: 'normal',
    },
    {
      path: './fonts/Mona_Sans/static/MonaSans-BlackItalic.ttf',
      weight: '900',
      style: 'italic',
    },

    // Light weights
    {
      path: './fonts/Mona_Sans/static/MonaSans-Light.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: './fonts/Mona_Sans/static/MonaSans-LightItalic.ttf',
      weight: '300',
      style: 'italic',
    },

    {
      path: './fonts/Mona_Sans/static/MonaSans-ExtraLight.ttf',
      weight: '200',
      style: 'normal',
    },
    {
      path: './fonts/Mona_Sans/static/MonaSans-ExtraLightItalic.ttf',
      weight: '200',
      style: 'italic',
    },

    // Condensed variations
    {
      path: './fonts/Mona_Sans/static/MonaSans_Condensed-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/Mona_Sans/static/MonaSans_Condensed-Bold.ttf',
      weight: '700',
      style: 'normal',
    },

    // Expanded variations
    {
      path: './fonts/Mona_Sans/static/MonaSans_Expanded-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/Mona_Sans/static/MonaSans_Expanded-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-mona-sans',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

export const metadata: Metadata = {
  ...createPageMetadata({
    title: 'ServiceSnap — Agende serviços perto de você',
    description:
      'Encontre e agende com profissionais perto de você. Simples, rápido e confiável.',
    path: '/',
  }),
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
    UsersService.headers = {
      Cookie: `access_token=${cookieStore.get('access_token')?.value}`,
    };

    await queryClient.prefetchQuery({
      queryKey: CACHE_QUERY_KEYS.user(userIdentification),
      queryFn: () => UsersService.getUser(),
    });
  }

  const dehydratedState = dehydrate(queryClient);

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${monaSans.variable} ${geistSans.variable} ${geistMono.variable}`}
      >
        <QueryProvider>
          <HydrationBoundary state={dehydratedState}>
            {children}
            <Config />
            <AuthModal />
            <Toaster />
            <ReviewsModal />
            <MobileSearchOverlay />
          </HydrationBoundary>
        </QueryProvider>

        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="lazyOnload"
          async
        />

        <Script
          type="application/ld+json"
          id="json-ld"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'ServiceSnap — Agende serviços perto de você',
              description:
                'Encontre e agende com profissionais perto de você. Simples, rápido e confiável.',
              url: 'https://ssnap.io',
              image: `${SITE_URL}/og-image.png`,
              publisher: {
                '@type': 'Organization',
                name: 'ServiceSnap',
                url: 'https://ssnap.io',
              },
              inLanguage: 'pt-BR',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://ssnap.io?query={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </body>
    </html>
  );
}
