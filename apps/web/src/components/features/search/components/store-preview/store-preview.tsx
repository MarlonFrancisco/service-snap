'use client';

import { ImageCarousel } from '@/components/ui/image-carousel';
import { Calendar, Clock, MapPin, MessageCircle, Star } from 'lucide-react';
import { useStorePreview } from './store-preview.hook';

export function StorePreview() {
  const {
    selectedStore,
    formattedPrice,
    formattedHours,
    whatsAppLink,
    showCarouselControls,
    hasReviews,
    displayReviews,
    handleBookingClick,
  } = useStorePreview();

  if (!selectedStore) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#EDEDED] bg-white shadow-sm">
      <div className="relative">
        <ImageCarousel
          images={selectedStore.gallery}
          alt={selectedStore.name}
          className="w-full"
          showCounter={showCarouselControls}
          showFullscreenButton={showCarouselControls}
          rounded={false}
          aspectRatio={4 / 3}
        />
      </div>

      <div className="space-y-5 p-5">
        <div className="space-y-2">
          <h3 className="text-lg leading-tight font-semibold tracking-tight text-[#0A0A0A]">
            {selectedStore.name}
          </h3>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-[#F59E0B] text-[#F59E0B]" />
              <span className="text-sm font-semibold text-[#0A0A0A]">
                {selectedStore.rating}
              </span>
            </div>
            <span className="text-sm text-[#71717A]">
              ({selectedStore.reviewCount} avaliações)
            </span>
          </div>

          <div className="pt-1">
            <span className="text-xl font-semibold tracking-tight text-[#0A0A0A]">
              {formattedPrice}
            </span>
            <span className="ml-1 text-sm text-[#71717A]">/ serviço</span>
          </div>
        </div>

        <div className="h-px bg-[#EDEDED]" />

        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-[#0A0A0A]">Sobre</h4>
          <p className="line-clamp-3 text-sm leading-relaxed text-[#2B2B2B]">
            {selectedStore.description}
          </p>
        </div>

        <div className="h-px bg-[#EDEDED]" />

        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-[#0A0A0A]">Informações</h4>

          <div className="space-y-2.5">
            <a
              href={whatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-xl bg-[#F4F4F5] px-3 py-2.5 text-sm transition-colors hover:bg-[#E4E4E7]"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#047857]">
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-[#0A0A0A]">
                  Enviar mensagem
                </span>
                <span className="text-xs text-[#71717A]">
                  {selectedStore.telephone}
                </span>
              </div>
            </a>

            <div className="flex items-start gap-3 px-3 py-2 text-sm">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#A1A1AA]" />
              <p className="line-clamp-2 text-[#2B2B2B]">
                {selectedStore.address}, {selectedStore.city} -{' '}
                {selectedStore.state}
              </p>
            </div>

            <div className="flex items-center gap-3 px-3 py-2 text-sm text-[#2B2B2B]">
              <Clock className="h-4 w-4 shrink-0 text-[#A1A1AA]" />
              <span>{formattedHours}</span>
            </div>
          </div>
        </div>

        <div className="h-px bg-[#EDEDED]" />

        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-[#0A0A0A]">
            Avaliações recentes
          </h4>

          <div className="space-y-2">
            {displayReviews.map((review) => (
              <div
                key={review.id}
                className="space-y-1.5 rounded-xl bg-[#F4F4F5] p-3"
              >
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < review.rating
                            ? 'fill-[#F59E0B] text-[#F59E0B]'
                            : 'fill-[#E4E4E7] text-[#E4E4E7]'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="line-clamp-2 text-sm leading-relaxed text-[#2B2B2B]">
                  {review.comment}
                </p>
              </div>
            ))}

            {!hasReviews && (
              <div className="rounded-xl bg-[#F4F4F5] p-4 text-center">
                <span className="text-sm text-[#71717A]">
                  Nenhuma avaliação ainda
                </span>
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#0A0A0A] text-sm font-semibold text-white shadow-lg shadow-black/20 transition-all active:scale-[0.98] hover:bg-[#2B2B2B]"
          onClick={handleBookingClick}
        >
          <Calendar className="h-4 w-4" />
          Ver agenda e agendar
        </button>
      </div>
    </div>
  );
}
