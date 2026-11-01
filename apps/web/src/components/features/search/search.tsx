'use client';
import { Footer, Header, HEADER_STICKY_TOP_CLASS } from '@/components/layout';
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
      <div className="mx-auto h-full w-full max-w-[82.5rem] px-5 md:px-10">
        {isPending && (
          <div className="grid min-h-[calc(100vh-180px)] grid-cols-12 gap-0 lg:gap-10">
            <div className="col-span-12 py-6 lg:col-span-7 xl:col-span-7">
              <ResultsListSkeleton />
            </div>
          </div>
        )}

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
            'grid min-h-[calc(100vh-180px)] grid-cols-12 gap-0 lg:gap-10',
            showResults ? 'grid' : 'hidden',
          )}
        >
          <div className="col-span-12 lg:col-span-7 xl:col-span-7">
            <ResultsList />
          </div>

          <div className="col-span-5 hidden lg:block xl:col-span-5">
            <div className={cn('sticky', HEADER_STICKY_TOP_CLASS)}>
              <div className="slide-up">
                <StorePreview />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <StoreDetailsDrawer />
    </Header>
  );
}
