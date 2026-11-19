'use client';

import { ImageCarousel } from '@/components/ui/image-carousel';
import { Clock, MapPin, MessageCircle, Star } from 'lucide-react';
import { useStorePreview } from './store-preview.hook';

const SECTION_TITLE_CLASS =
  'mt-6 mb-2 text-[13px] font-bold tracking-[0.06em] text-ink-muted uppercase';
const INFO_ROW_CLASS =
  'flex items-center gap-3 border-t border-surface-3 py-2.5 text-sm text-ink';

export function StorePreview() {
  const {
    selectedStore,
    formattedPrice,
    formattedHours,
    ratingSummary,
    imageAspectRatio,
    whatsAppLink,
    showCarouselControls,
    hasReviews,
    displayReviews,
    handleBookingClick,
    handleWhatsAppClick,
  } = useStorePreview();

  if (!selectedStore) return null;

  return (
    <aside
      aria-label="Prévia do espaço"
      className="flex max-h-[calc(100dvh-8rem)] flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_12px_40px_rgba(15,12,30,0.1)]"
    >
      {/* `key` volta à primeira imagem e ao topo da rolagem quando a loja muda. */}
      <div key={`summary-${selectedStore.id}`} className="shrink-0">
        <ImageCarousel
          images={selectedStore.gallery}
          alt={selectedStore.name}
          className="w-full"
          showCounter={showCarouselControls}
          showFullscreenButton={showCarouselControls}
          rounded={false}
          aspectRatio={imageAspectRatio}
        />

        <div className="border-b border-surface-3 px-7 pt-5 pb-4">
          <h2 className="text-2xl font-extrabold tracking-[-0.025em] text-ink">
            {selectedStore.name}
          </h2>

          <p className="mt-1.5 flex items-center gap-1 text-sm text-ink-muted">
            {hasReviews && (
              <Star
                className="h-3.5 w-3.5 shrink-0 fill-ink text-ink"
                aria-hidden
              />
            )}
            {ratingSummary}
          </p>

          <p className="mt-2.5 text-[22px] font-extrabold text-ink">
            {formattedPrice}{' '}
            <span className="text-sm font-medium text-ink-muted">
              / serviço
            </span>
          </p>
        </div>
      </div>

      <div
        key={`details-${selectedStore.id}`}
        tabIndex={0}
        aria-label={`Detalhes de ${selectedStore.name}`}
        className="min-h-0 flex-1 overflow-y-auto focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink"
      >
        <div className="px-7 pb-6">
          <h3 className={SECTION_TITLE_CLASS}>Sobre</h3>
          <p className="line-clamp-3 text-sm leading-[1.6] text-ink">
            {selectedStore.description}
          </p>

          <h3 className={SECTION_TITLE_CLASS}>Informações</h3>
          <a
            href={whatsAppLink}
            onClick={handleWhatsAppClick}
            target="_blank"
            rel="noopener noreferrer"
            className={`${INFO_ROW_CLASS} hover:underline`}
          >
            <MessageCircle className="h-5 w-5 shrink-0" strokeWidth={1.7} />
            Enviar mensagem
          </a>
          <div className={INFO_ROW_CLASS}>
            <MapPin className="h-5 w-5 shrink-0" strokeWidth={1.7} />
            <p className="line-clamp-2">
              {selectedStore.address}, {selectedStore.city} -{' '}
              {selectedStore.state}
            </p>
          </div>
          <div className={INFO_ROW_CLASS}>
            <Clock className="h-5 w-5 shrink-0" strokeWidth={1.7} />
            <span>{formattedHours}</span>
          </div>

          <h3 className={SECTION_TITLE_CLASS}>Avaliações recentes</h3>
          <div className="space-y-2">
            {displayReviews.map((review) => (
              <div
                key={review.id}
                className="rounded-[14px] bg-surface px-3.5 py-3 text-sm text-ink"
              >
                <b
                  role="img"
                  aria-label={`${review.rating} de 5 estrelas`}
                  className="mb-1 block text-xs tracking-[2px] text-warning-vivid"
                >
                  {'★'.repeat(review.rating)}
                  {'☆'.repeat(5 - review.rating)}
                </b>
                <p className="line-clamp-2">{review.comment}</p>
              </div>
            ))}

            {!hasReviews && (
              <p className="rounded-[14px] bg-surface px-3.5 py-3 text-center text-sm text-ink-muted">
                Nenhuma avaliação ainda
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="shrink-0 border-t border-surface-3 px-7 py-4">
        <button
          type="button"
          className="h-[54px] w-full rounded-full bg-brand text-[15px] font-bold text-white transition-colors hover:bg-brand-hover active:scale-[0.98]"
          onClick={handleBookingClick}
        >
          Ver agenda e agendar
        </button>
      </div>
    </aside>
  );
}
