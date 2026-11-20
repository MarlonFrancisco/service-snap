import { Header } from '@/components/layout';
import { Skeleton } from '@repo/ui';

const PLACEHOLDER_CARDS = 4;

/** Esqueleto neutro para as páginas que não têm um loading.tsx próprio. */
export const PageLoading = () => (
  <Header>
    <main
      role="status"
      aria-busy="true"
      className="mx-auto max-w-[82.5rem] px-5 pt-10 pb-16 md:px-10"
    >
      <span className="sr-only">Carregando</span>
      <div aria-hidden="true">
        <Skeleton className="h-9 w-full max-w-80 rounded-lg" />
        <Skeleton className="mt-3.5 h-4 w-full max-w-[480px] rounded-lg" />
        <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
          {Array.from({ length: PLACEHOLDER_CARDS }, (_, index) => (
            <div key={index}>
              <Skeleton className="aspect-square rounded-[22px]" />
              <Skeleton className="mt-3.5 h-4 w-[70%] rounded-lg" />
              <Skeleton className="mt-2 h-3.5 w-[45%] rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </main>
  </Header>
);
