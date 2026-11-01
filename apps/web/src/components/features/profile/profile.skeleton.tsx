'use client';

import { Footer, Header, MobileTabBar } from '@/components/layout';
import { Skeleton } from '@repo/ui';
import type { TProfileConfig } from './profile.types';

const TAB_PLACEHOLDERS = ['w-20 md:w-32', 'w-24', 'w-24'];
const DETAIL_PLACEHOLDERS = ['date', 'time', 'total', 'place'];
const HISTORY_PLACEHOLDERS = ['first', 'second'];

export const ProfileSkeleton = ({ className }: TProfileConfig) => {
  return (
    <Header>
      <main className="mx-auto w-full max-w-[82.5rem] px-5 max-md:min-h-[calc(100dvh-9rem)] md:px-10">
        <div className={className}>
          {/* Cabeçalho */}
          <div className="flex items-center gap-3.5 pt-2 md:gap-5 md:pt-6">
            <Skeleton className="size-[68px] shrink-0 rounded-full md:size-[88px]" />
            <div className="min-w-0 flex-1 pl-1.5 md:pl-0">
              <Skeleton className="h-7 w-44 md:h-10 md:w-72" />
              <Skeleton className="mt-1.5 h-4 w-40 md:w-80" />
            </div>
          </div>

          {/* Abas */}
          <div className="-mx-5 mt-[22px] flex gap-6 border-b border-[#EBE9F0] px-5 md:mx-0 md:mt-8 md:gap-8 md:px-0">
            {TAB_PLACEHOLDERS.map((width) => (
              <div key={width} className="flex min-h-12 items-center">
                <Skeleton className={`h-5 ${width}`} />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 items-start gap-9 pt-6 pb-8 md:gap-10 md:pt-8 md:pb-0 min-[1021px]:grid-cols-[minmax(0,1fr)_380px]">
            <div className="min-w-0">
              {/* Próximos agendamentos */}
              <Skeleton className="h-7 w-56 md:h-8" />
              <Skeleton className="mt-1 mb-3.5 h-5 w-52 md:mb-[18px]" />
              <div className="grid grid-cols-1 rounded-[22px] border border-[#E3E1EA] px-3 pt-3 pb-4 md:grid-cols-[150px_minmax(0,1fr)] md:gap-5 md:rounded-3xl md:p-4">
                <Skeleton className="aspect-video w-full rounded-[14px] md:aspect-auto md:min-h-[150px] md:rounded-2xl" />
                <div className="min-w-0">
                  <Skeleton className="mx-1 mt-3 h-6 w-3/4 md:mx-0 md:mt-0" />
                  <Skeleton className="mx-1 mt-1 h-5 w-1/2 md:mx-0" />
                  <div className="mx-1 mt-3 grid grid-cols-2 gap-x-3.5 gap-y-2.5 md:mx-0 md:mt-3.5 md:grid-cols-[repeat(auto-fit,minmax(150px,1fr))] md:gap-x-[18px]">
                    {DETAIL_PLACEHOLDERS.map((detail) => (
                      <div key={detail}>
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="mt-1 h-5 w-24" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex gap-2 md:mt-3.5">
                    <Skeleton className="h-[46px] flex-1 rounded-full md:h-11 md:w-28 md:flex-none" />
                    <Skeleton className="h-[46px] flex-1 rounded-full md:h-11 md:w-24 md:flex-none" />
                  </div>
                </div>
              </div>

              {/* Histórico */}
              <div className="mt-9 md:mt-11">
                <Skeleton className="h-7 w-32 md:h-8" />
                <Skeleton className="mt-1 mb-3.5 h-5 w-52 md:mb-[18px]" />
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
                  {HISTORY_PLACEHOLDERS.map((card, index) => (
                    <div
                      key={card}
                      className={index > 0 ? 'hidden md:block' : undefined}
                    >
                      <Skeleton className="aspect-video w-full rounded-[14px] md:aspect-[4/3] md:rounded-[20px]" />
                      <Skeleton className="mt-2.5 h-5 w-2/3 md:mt-3" />
                      <Skeleton className="mt-1 h-5 w-1/2" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Indicação */}
            <div className="rounded-3xl p-5 shadow-[0_10px_32px_rgba(15,12,30,0.1)] md:rounded-[28px] md:p-6 md:shadow-[0_12px_40px_rgba(15,12,30,0.1)]">
              <Skeleton className="h-7 w-52" />
              <Skeleton className="mt-1 mb-3.5 h-10 w-full md:mb-[18px]" />
              <Skeleton className="h-[60px] w-full rounded-[14px]" />
              <div className="hidden md:block">
                <Skeleton className="mt-4 mb-1.5 h-4 w-40" />
                <Skeleton className="h-[50px] w-full rounded-full" />
                <Skeleton className="mt-4 mb-1.5 h-4 w-36" />
                <Skeleton className="h-[50px] w-full rounded-full" />
              </div>
              <Skeleton className="mt-3 h-[50px] w-full rounded-full md:mt-[18px] md:h-[52px]" />
            </div>
          </div>
        </div>
      </main>

      <Footer compact />
      <MobileTabBar />
    </Header>
  );
};
