'use client';

import { PARTNER_MUTED_TEXT_CLASS } from '@/components/features/partner/partner.styles';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  cn,
} from '@repo/ui';
import { Images } from 'lucide-react';
import {
  STORES_COMPACT_BUTTON_CLASS,
  STORES_COMPACT_PRIMARY_BUTTON_CLASS,
  STORES_DANGER_TEXT_CLASS,
} from '../../stores-module.styles';
import { STORE_DELETE_CONSEQUENCE } from '../../utils/stores-module.constants';
import { ConfirmDialog } from '../confirm-dialog';
import { StorePublicPresence } from '../store-public-presence';
import { useStoreCard } from './store-card.hook';
import { StoreCardSkeleton } from './store-card.skeleton';
import type { TStoreCardConfig } from './store-card.types';

const IMAGE_SIZES = '(min-width: 768px) 320px, 100vw';
const DETAIL_LABEL_CLASS = cn('text-xs', PARTNER_MUTED_TEXT_CLASS);
const DETAIL_VALUE_CLASS = 'mt-0.5 font-semibold break-words';

export const StoreCard = ({ store }: TStoreCardConfig) => {
  const {
    isLoading,
    orderedGallery,
    hoursLabel,
    locationLabel,
    handleEditStore,
    handleToggleStatus,
    handleDeleteStore,
    handleViewDetails,
  } = useStoreCard(store);

  if (isLoading) return <StoreCardSkeleton />;

  return (
    <article className="grid overflow-hidden rounded-[28px] bg-white shadow-[0_12px_40px_rgba(15,12,30,0.1)] md:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
      <div className="relative min-h-[220px] bg-[#F4F3F7] md:min-h-[280px]">
        <div className={cn('absolute inset-0', !store.isActive && 'opacity-60')}>
          {orderedGallery.length > 0 ? (
            <Carousel
              aria-label={`Fotos da loja ${store.name}`}
              className="h-full [&_[data-slot=carousel-content]]:h-full"
            >
              <CarouselContent className="ml-0 h-full">
                {orderedGallery.map((image, index) => (
                  <CarouselItem key={image.id} className="relative h-full pl-0">
                    <ImageWithFallback
                      src={image.url}
                      alt={`Foto ${index + 1} da loja ${store.name}`}
                      fill
                      sizes={IMAGE_SIZES}
                      className="object-cover"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              {orderedGallery.length > 1 ? (
                <>
                  <CarouselPrevious
                    type="button"
                    aria-label="Foto anterior"
                    className="left-2 size-11 border-0 bg-white"
                  />
                  <CarouselNext
                    type="button"
                    aria-label="Próxima foto"
                    className="right-2 size-11 border-0 bg-white"
                  />
                </>
              ) : null}
            </Carousel>
          ) : (
            <ImageWithFallback
              useFallback
              alt={`Loja ${store.name} sem foto cadastrada`}
              fill
              sizes={IMAGE_SIZES}
              className="object-cover"
            />
          )}
        </div>

        <span className="absolute top-3.5 left-3.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold">
          {store.isActive ? 'Ativa' : 'Pausada'}
        </span>

        {orderedGallery.length > 1 ? (
          <span className="absolute bottom-3.5 left-3.5 inline-flex items-center gap-1 rounded-full bg-[#0B0B0F] px-2.5 py-1 text-xs font-bold text-white">
            <Images aria-hidden="true" className="size-3" />
            {orderedGallery.length} fotos
          </span>
        ) : null}
      </div>

      <div className="min-w-0 p-5 md:p-[26px]">
        <h3 className="text-[22px] font-extrabold tracking-[-0.02em] break-words">
          {store.name}
        </h3>
        <p
          className={cn(
            'mt-1 mb-4 line-clamp-2 text-sm',
            PARTNER_MUTED_TEXT_CLASS,
          )}
        >
          {store.description}
        </p>

        <dl className="m-0 grid grid-cols-[repeat(auto-fit,minmax(min(170px,100%),1fr))] gap-3.5 text-sm">
          <div>
            <dt className={DETAIL_LABEL_CLASS}>Endereço</dt>
            <dd className={DETAIL_VALUE_CLASS}>{locationLabel}</dd>
          </div>
          <div>
            <dt className={DETAIL_LABEL_CLASS}>Horário</dt>
            <dd className={DETAIL_VALUE_CLASS}>{hoursLabel}</dd>
          </div>
          <div>
            <dt className={DETAIL_LABEL_CLASS}>Telefone</dt>
            <dd className={DETAIL_VALUE_CLASS}>{store.telephone}</dd>
          </div>
        </dl>

        <StorePublicPresence
          storeId={store.id}
          slug={store.slug}
          instagram={store.instagram}
        />

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleEditStore}
            aria-label={`Editar ${store.name}`}
            className={STORES_COMPACT_PRIMARY_BUTTON_CLASS}
          >
            Editar
          </button>
          <button
            type="button"
            onClick={handleToggleStatus}
            aria-label={`${store.isActive ? 'Pausar' : 'Ativar'} ${store.name}`}
            className={STORES_COMPACT_BUTTON_CLASS}
          >
            {store.isActive ? 'Pausar' : 'Ativar'}
          </button>
          <button
            type="button"
            onClick={handleViewDetails}
            aria-label={`Ver detalhes de ${store.name}`}
            className={cn(STORES_COMPACT_BUTTON_CLASS, 'md:hidden')}
          >
            Ver detalhes
          </button>
          <ConfirmDialog
            title={`Excluir a loja ${store.name}?`}
            description={STORE_DELETE_CONSEQUENCE}
            cancelLabel="Manter loja"
            confirmLabel="Excluir loja"
            onConfirm={handleDeleteStore}
            trigger={
              <button
                type="button"
                aria-label={`Excluir loja ${store.name}`}
                className={cn(
                  STORES_COMPACT_BUTTON_CLASS,
                  STORES_DANGER_TEXT_CLASS,
                )}
              >
                Excluir loja
              </button>
            }
          />
        </div>
      </div>
    </article>
  );
};
