'use client';

import { formatBusinessHours } from '@/utils/helpers/business-hours.helper';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@repo/ui';
import { Calendar, Clock, MapPin, Phone, Star } from 'lucide-react';
import { ImageCarousel } from '../image-carousel';
import { useStoreDetailsDrawer } from './store-details-drawer.hook';

export function StoreDetailsDrawer() {
  const {
    selectedStore,
    mobileDrawerOpen,
    setMobileDrawerOpen,
    handleBooking,
    handlePhoneClick,
  } = useStoreDetailsDrawer();

  if (!selectedStore) return null;

  return (
    <Drawer open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
      <DrawerContent className="border-[#EDEDED] p-0">
        <DrawerHeader className="sr-only">
          <DrawerTitle>Detalhes da Loja</DrawerTitle>
        </DrawerHeader>

        <div className="overflow-y-auto">
          <div className="space-y-4 pb-6">
            <ImageCarousel
              images={selectedStore.gallery}
              alt={selectedStore.name}
              className="w-full rounded-t-none rounded-b-none!"
              showCounter={selectedStore.gallery.length > 1}
              showFullscreenButton={selectedStore.gallery.length > 1}
              aspectRatio={16 / 9}
            />

            <div className="space-y-3 px-4">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl leading-tight font-semibold tracking-tight text-[#0A0A0A]">
                  {selectedStore.name}
                </h2>
                <span className="shrink-0 rounded-full bg-[#0A0A0A] px-2.5 py-1 text-xs font-semibold text-white">
                  {selectedStore.price}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 rounded-md bg-[#F4F4F5] px-2 py-1">
                  <Star className="h-4 w-4 fill-[#F59E0B] text-[#F59E0B]" />
                  <span className="text-sm font-semibold text-[#0A0A0A]">
                    {selectedStore.rating}
                  </span>
                </div>
                <span className="text-sm text-[#71717A]">
                  ({selectedStore.reviewCount} avaliações)
                </span>
              </div>
            </div>

            <div className="mx-4 h-px bg-[#EDEDED]" />

            <div className="space-y-2 px-4">
              <h3 className="text-sm font-semibold text-[#0A0A0A]">Sobre</h3>
              <p className="text-sm leading-relaxed text-[#2B2B2B]">
                {selectedStore.description}
              </p>
            </div>

            <div className="mx-4 h-px bg-[#EDEDED]" />

            {selectedStore.services && selectedStore.services.length > 0 && (
              <>
                <div className="space-y-3 px-4">
                  <h3 className="text-sm font-semibold text-[#0A0A0A]">
                    Serviços
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedStore.services.map((service) => (
                      <span
                        key={service.id}
                        className="rounded-full bg-[#F4F4F5] px-2.5 py-1 text-xs font-medium text-[#2B2B2B]"
                      >
                        {service.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mx-4 h-px bg-[#EDEDED]" />
              </>
            )}

            <div className="space-y-3 px-4">
              <h3 className="text-sm font-semibold text-[#0A0A0A]">
                Informações
              </h3>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 shrink-0 text-[#A1A1AA]" />
                  <a
                    href={`tel:${selectedStore.telephone}`}
                    onClick={handlePhoneClick}
                    className="font-medium text-[#0A0A0A] hover:underline"
                  >
                    {selectedStore.telephone}
                  </a>
                </div>

                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#A1A1AA]" />
                  <div className="text-[#2B2B2B]">
                    <p>
                      {selectedStore.address}, {selectedStore.city} -{' '}
                      {selectedStore.state}
                    </p>
                    <p className="mt-0.5 text-xs text-[#71717A]">
                      {selectedStore.zipCode}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm text-[#2B2B2B]">
                  <Clock className="h-4 w-4 shrink-0 text-[#A1A1AA]" />
                  <span>
                    {formatBusinessHours(
                      selectedStore.openTime,
                      selectedStore.closeTime,
                      selectedStore.businessDays,
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="mx-4 h-px bg-[#EDEDED]" />

            <div className="space-y-3 px-4">
              <h3 className="text-sm font-semibold text-[#0A0A0A]">
                Avaliações Recentes
              </h3>

              <div className="space-y-2.5">
                {selectedStore.reviews && selectedStore.reviews.length > 0 ? (
                  selectedStore.reviews.slice(0, 3).map((review) => (
                    <div
                      key={review.id}
                      className="rounded-xl bg-[#F4F4F5] p-3"
                    >
                      <div className="mb-1.5 flex items-center gap-2">
                        <div className="flex">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star
                              key={i}
                              className="h-3.5 w-3.5 fill-[#F59E0B] text-[#F59E0B]"
                            />
                          ))}
                        </div>
                        <span className="text-xs font-medium text-[#71717A]">
                          Usuário Anônimo
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-[#2B2B2B]">
                        {review.comment}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl bg-[#F4F4F5] p-4 text-center">
                    <p className="text-sm text-[#71717A]">
                      Nenhuma avaliação disponível
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#EDEDED] bg-white p-4 shadow-lg">
          <button
            type="button"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#0A0A0A] text-sm font-semibold text-white transition-all active:scale-[0.98] hover:bg-[#2B2B2B]"
            onClick={handleBooking}
          >
            <Calendar className="h-5 w-5" />
            Ver Agenda e Agendar
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
