'use client';

import useSearchStore from '@/store/search/search.store';
import { IStoreSearchListItem } from '@/store/search/search.types';
import { cn } from '@repo/ui/index';
import { motion } from 'motion/react';
import { useSearchParams } from 'next/navigation';
import { StoreCard } from '../store-card';

interface VirtualizedResultsListProps {
  stores: IStoreSearchListItem[];
}

export function VirtualizedResultsList({
  stores,
}: VirtualizedResultsListProps) {
  const selectedStore = useSearchStore((state) => state.selectedStore);
  const setSelectedStore = useSearchStore((state) => state.setSelectedStore);

  const query = useSearchParams().get('query');

  return (
    <div className="space-y-6 py-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-sm text-[#71717A]">
            {stores.length > 100 ? 'Mais de 100' : stores.length} lojas
          </p>
          <h1 className="text-2xl leading-tight font-bold tracking-tight text-[#0A0A0A]">
            Resultados para &ldquo;{query}&rdquo;
          </h1>
        </div>
      </div>

      <motion.div
        role="list"
        aria-label="Lista de serviços encontrados"
        className={cn(
          'grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 sm:gap-y-10 lg:grid-cols-3',
        )}
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
        {stores.map((store) => (
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
              onClick={() => setSelectedStore(store)}
            />
          </motion.div>
        ))}
      </motion.div>

      {stores.length > 0 && (
        <div className="border-t border-[#EDEDED] py-8 text-center">
          <p className="text-sm text-[#71717A]">
            Mostrando todos os {stores.length} resultados
          </p>
        </div>
      )}
    </div>
  );
}
