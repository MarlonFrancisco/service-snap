import { PARTNER_MUTED_TEXT_CLASS } from '@/components/features/partner/partner.styles';
import { cn, Skeleton } from '@repo/ui';
import { StoreCardSkeleton } from './components/store-card/store-card.skeleton';

const SKELETON_CARDS = ['first', 'second'] as const;

export const StoresModuleSkeleton = () => (
  <div className="grid gap-[18px]" role="status" aria-label="Carregando lojas">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-2xl font-extrabold tracking-[-0.025em]">
          Gestão de lojas
        </h2>
        <p className={cn('mt-0.5 text-[15px]', PARTNER_MUTED_TEXT_CLASS)}>
          Gerencie suas lojas, equipes e configurações
        </p>
      </div>

      <Skeleton className="h-12 w-full rounded-full bg-[#EBE9F0] sm:w-40" />
    </div>

    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-3.5">
      <Skeleton className="h-[106px] rounded-[22px] bg-[#EBE9F0]" />
      <Skeleton className="h-[106px] rounded-[22px] bg-[#EBE9F0]" />
    </div>

    <div className="grid gap-[18px]">
      {SKELETON_CARDS.map((card) => (
        <StoreCardSkeleton key={card} />
      ))}
    </div>
  </div>
);
