'use client';

import useSearchStore from '@/store/search/search.store';
import { IStoreSearchListItem } from '@/store/search/search.types';
import { motion } from 'motion/react';
import { StoreCard } from '../store-card';
import { useVirtualizedResultsList } from './virtualized-results-list.hook';

interface VirtualizedResultsListProps {
  stores: IStoreSearchListItem[];
}

export function VirtualizedResultsList({
  stores,
}: VirtualizedResultsListProps) {
  const selectedStore = useSearchStore((state) => state.selectedStore);
  const {
    query,
    countLabel,
    visibleStores,
    hasMore,
    summary,
    showMore,
    selectStore,
  } = useVirtualizedResultsList(stores);

  return (
    <div className="min-w-0 pt-6 pb-10 lg:pt-0 lg:pb-0">
      <p className="text-[13px] text-[#5F5C6E] md:text-sm">{countLabel}</p>
      <h1 className="mt-1 mb-5 text-2xl font-extrabold tracking-[-0.03em] text-[#0B0B0F] md:mb-6 md:text-[30px]">
        Resultados para &ldquo;{query}&rdquo;
      </h1>

      <motion.div
        role="list"
        aria-label="Lista de serviços encontrados"
        className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 md:gap-y-9 xl:grid-cols-3"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.05,
            },
          },
        }}
      >
        {visibleStores.map((store, index) => (
          <motion.div
            key={store.id}
            role="listitem"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <StoreCard
              store={store}
              isSelected={selectedStore?.id === store.id}
              onClick={() => selectStore(store, index)}
            />
          </motion.div>
        ))}
      </motion.div>

      {stores.length > 0 && (
        <div className="pt-8 text-center text-[13px] text-[#5F5C6E] md:pt-12 md:text-sm">
          <p aria-live="polite">{summary}</p>
          {hasMore && (
            <button
              type="button"
              onClick={showMore}
              className="mt-3 h-[50px] w-full rounded-full border border-[#0B0B0F] bg-white px-7 text-sm font-bold text-[#0B0B0F] transition-colors hover:bg-[#F4F3F7] md:mt-3.5 md:h-12 md:w-auto"
            >
              Carregar mais
            </button>
          )}
        </div>
      )}
    </div>
  );
}
