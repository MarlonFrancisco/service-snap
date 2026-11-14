import { Header } from '@/components/layout';

const SKELETON_CLASS =
  'rounded-lg bg-[#EFEDF3] animate-pulse motion-reduce:animate-none';

const PLACEHOLDER_CARDS = 4;

/** Esqueleto genérico enquanto a página carrega: título e uma fileira de cartões. */
export const PageLoading = () => (
  <Header>
    <main
      role="status"
      aria-busy="true"
      className="mx-auto max-w-[1320px] px-5 pt-10 pb-16 md:px-10"
    >
      <span className="sr-only">Carregando</span>
      <div aria-hidden="true">
        <div className={`${SKELETON_CLASS} h-9 w-full max-w-80`} />
        <div className={`${SKELETON_CLASS} mt-3.5 h-4 w-full max-w-[480px]`} />
        <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
          {Array.from({ length: PLACEHOLDER_CARDS }, (_, index) => (
            <div key={index}>
              <div className={`${SKELETON_CLASS} aspect-square rounded-[22px]`} />
              <div className={`${SKELETON_CLASS} mt-3.5 h-4 w-[70%]`} />
              <div className={`${SKELETON_CLASS} mt-2 h-3.5 w-[45%]`} />
            </div>
          ))}
        </div>
      </div>
    </main>
  </Header>
);
