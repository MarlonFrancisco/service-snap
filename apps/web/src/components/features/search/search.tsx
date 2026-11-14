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
import { useRouter } from 'next/navigation';
import {
  ResultsList,
  ResultsListSkeleton,
  StoreDetailsDrawer,
  StorePreview,
} from './components';
import { MobileSearchPill } from './components/mobile-search-pill';
import { SearchFilters } from './components/search-filters';
import {
  useSearchFiltersNavigation,
  useSearchResultsAnalytics,
  useSearchUrlState,
} from './search.hook';

export function SearchResults() {
  const router = useRouter();
  const { query, location, category, filters, hasActiveFilters, searchParams } =
    useSearchUrlState();
  const { clearFilters } = useSearchFiltersNavigation();
  const { data, isPending, isError } = useSearchQuery(searchParams);
  useSearchResultsAnalytics({
    query,
    category: category ?? null,
    location: location ?? null,
    filters,
    data,
    isPending,
    isError,
  });

  const hasResults = Boolean(data && data.length > 0);
  const showEmpty = !isPending && !isError && !hasResults;
  const showResults = !isPending && hasResults;

  return (
    <Header showSearchBar>
      {/* A altura mínima mantém a barra inferior do mobile no fim da tela. */}
      <div className="flex min-h-[calc(100dvh-5rem)] flex-col md:min-h-[calc(100dvh-6rem)]">
        <MobileSearchPill />

        <div className="mx-auto hidden w-full max-w-[82.5rem] px-10 md:block">
          <SearchFilters />
        </div>

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

          {showEmpty && hasActiveFilters && (
            <NotFound
              className="flex py-20"
              icon={Search}
              title="Nenhum resultado encontrado"
              description="Nenhuma loja bate com esses filtros. Limpe os filtros para ver todos os resultados desta busca."
              actionLabel="Limpar filtros"
              onAction={clearFilters}
            />
          )}

          {showEmpty && !hasActiveFilters && (
            <NotFound
              className="flex py-20"
              icon={Search}
              title="Nenhum resultado encontrado"
              description={
                category || location
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
