'use client';
import {
  Footer,
  Header,
  HEADER_STICKY_TOP_CLASS,
  MobileTabBar,
} from '@/components/layout';
import { NotFound } from '@/components/ui';
import { useSearchQuery } from '@/hooks/use-query/use-search-query';
import { cn } from '@repo/ui/index';
import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ResultsList,
  ResultsListSkeleton,
  StoreDetailsDrawer,
  StorePreview,
} from './components';
import { MobileSearchPill } from './components/mobile-search-pill';

export function SearchResults() {
  const router = useRouter();
  const params = useSearchParams();
  const { data, isPending, isError } = useSearchQuery({
    query: params.get('query')!,
    location: params.get('location'),
    category: params.get('category'),
  });

  const hasResults = Boolean(data && data.length > 0);
  const showEmpty = !isPending && !isError && !hasResults;
  const showResults = !isPending && hasResults;

  return (
    <Header showSearchBar>
      {/* A altura mínima mantém a barra inferior do mobile no fim da tela. */}
      <div className="flex min-h-[calc(100dvh-5rem)] flex-col md:min-h-[calc(100dvh-6rem)]">
        <MobileSearchPill />

        <div className="mx-auto w-full max-w-[82.5rem] flex-1 px-5 md:px-10 lg:pt-4">
          {isPending && <ResultsListSkeleton />}

          {isError && (
            <NotFound
              className="flex py-20"
              icon={Search}
              title="Não foi possível buscar agora"
              description="Tente novamente em instantes ou volte à página inicial."
              actionLabel="Voltar para a página inicial"
              onAction={() => router.push('/')}
            />
          )}

          {showEmpty && (
            <NotFound
              className="flex py-20"
              icon={Search}
              title="Nenhum resultado encontrado"
              description={
                params.get('category') || params.get('location')
                  ? 'Nada bate com essa categoria ou local. Tente outro termo ou região — não mostramos resultados irrelevantes.'
                  : 'Tente outros termos, outra categoria ou outra região. Se a rede ainda estiver chegando aí, indique um profissional pelo contato.'
              }
              actionLabel="Voltar para a página inicial"
              onAction={() => router.push('/')}
            />
          )}

          <div
            className={cn(
              'grid-cols-1 gap-10 lg:grid-cols-[1fr_420px]',
              showResults ? 'grid' : 'hidden',
            )}
          >
            <ResultsList />

            <div className="hidden lg:block">
              <div className={cn('sticky', HEADER_STICKY_TOP_CLASS)}>
                <div className="slide-up">
                  <StorePreview />
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer compact />
        <MobileTabBar />
      </div>

      <StoreDetailsDrawer />
    </Header>
  );
}
