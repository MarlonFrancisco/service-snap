'use client';

import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import {
  cn,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Separator,
} from '@repo/ui';
import { Heart, MapPin } from 'lucide-react';
import {
  PROFILE_ACTION_CLASS,
  PROFILE_ACTION_PRIMARY_CLASS,
  PROFILE_ACTIONS_CLASS,
  PROFILE_CARDS_GRID_CLASS,
  PROFILE_DIALOG_CLASS,
  PROFILE_FOCUS_CLASS,
  PROFILE_SECTION_LEAD_CLASS,
  PROFILE_SECTION_TITLE_CLASS,
} from '../../profile.styles';
import { ProfileEmptyState } from '../profile-empty-state';
import { useFavoritesSection } from './favorites-section.hook';

const REMOVE_BUTTON_CLASS = cn(
  'grid size-11 shrink-0 place-items-center rounded-full bg-white/92 text-[#0B0B0F]',
  PROFILE_FOCUS_CLASS,
);
const REMOVE_ICON_CLASS = 'h-[22px] w-[22px] fill-[#EF4444] text-[#EF4444]';
const MODAL_LABEL_CLASS = 'mb-1 text-xs text-[#5F5C6E]';

export const FavoritesSection = () => {
  const {
    favorites,
    selectedFavorite,
    setSelectedFavorite,
    handleRemoveFavorite,
    handleSchedule,
    handleRemoveSelectedFavorite,
    handleScheduleSelectedFavorite,
  } = useFavoritesSection();

  if (favorites.length === 0) {
    return (
      <ProfileEmptyState
        icon={Heart}
        title="Nenhum favorito encontrado"
        description="Você ainda não tem nenhum favorito. Clique no botão abaixo para explorar os estabelecimentos disponíveis."
        actionLabel="Explorar estabelecimentos"
      />
    );
  }

  return (
    <>
      <section>
        <h2 className={PROFILE_SECTION_TITLE_CLASS}>Favoritos</h2>
        <p className={PROFILE_SECTION_LEAD_CLASS}>
          Seus estabelecimentos salvos
        </p>
        <div className={PROFILE_CARDS_GRID_CLASS}>
          {favorites.map((favorite) => (
            <article key={favorite.id}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] bg-[#E8E7F1] md:rounded-[22px]">
                <ImageWithFallback
                  src={favorite.store.gallery[0]?.url ?? ''}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 400px, 100vw"
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveFavorite(favorite.id)}
                  aria-label={`Remover ${favorite.store.name} dos favoritos`}
                  className={cn(
                    REMOVE_BUTTON_CLASS,
                    'absolute top-1.5 right-1.5 md:top-2 md:right-2',
                  )}
                >
                  <Heart className={REMOVE_ICON_CLASS} aria-hidden />
                </button>
              </div>

              <h3 className="mt-3 line-clamp-1 text-base font-bold md:mt-3.5">
                {favorite.store.name}
              </h3>
              <p className="mt-[3px] truncate text-sm text-[#5F5C6E]">
                {favorite.store.address}
              </p>
              <p className="mt-[3px] truncate text-sm text-[#5F5C6E]">
                {favorite.store.city} - {favorite.store.state}
              </p>

              <div className={PROFILE_ACTIONS_CLASS}>
                <button
                  type="button"
                  onClick={() => handleSchedule(favorite)}
                  className={PROFILE_ACTION_PRIMARY_CLASS}
                >
                  Agendar
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFavorite(favorite)}
                  className={PROFILE_ACTION_CLASS}
                >
                  Ver mais
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Detalhes do favorito */}
      <Dialog
        open={!!selectedFavorite}
        onOpenChange={() => setSelectedFavorite(undefined)}
      >
        <DialogContent className={cn(PROFILE_DIALOG_CLASS, 'sm:max-w-2xl')}>
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold tracking-[-0.02em]">
              Detalhes do estabelecimento
            </DialogTitle>
          </DialogHeader>
          {selectedFavorite && (
            <div className="space-y-6 text-sm">
              <div className="relative aspect-video overflow-hidden rounded-[20px] bg-[#E8E7F1]">
                <ImageWithFallback
                  src={selectedFavorite.store.gallery[0]?.url ?? ''}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 640px, 100vw"
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveSelectedFavorite}
                  aria-label={`Remover ${selectedFavorite.store.name} dos favoritos`}
                  className={cn(
                    REMOVE_BUTTON_CLASS,
                    'absolute top-1.5 right-1.5 md:top-2 md:right-2',
                  )}
                >
                  <Heart className={REMOVE_ICON_CLASS} aria-hidden />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-[17px] font-bold">
                    {selectedFavorite.store.name}
                  </h3>
                  <p className="mt-1 leading-normal text-[#5F5C6E]">
                    {selectedFavorite.store.description}
                  </p>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4 font-semibold">
                  <div>
                    <div className={cn(MODAL_LABEL_CLASS, 'font-normal')}>
                      Localização
                    </div>
                    <div className="flex items-start gap-2 [overflow-wrap:anywhere]">
                      <MapPin
                        className="mt-0.5 size-4 shrink-0 text-[#5F5C6E]"
                        aria-hidden
                      />
                      {selectedFavorite.store.address}
                    </div>
                  </div>
                  <div>
                    <div className={cn(MODAL_LABEL_CLASS, 'font-normal')}>
                      Cidade
                    </div>
                    <div>
                      {selectedFavorite.store.city} -{' '}
                      {selectedFavorite.store.state}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="font-semibold">
                  <div className={cn(MODAL_LABEL_CLASS, 'font-normal')}>
                    Telefone
                  </div>
                  <div>{selectedFavorite.store.telephone}</div>
                </div>

                <p className="text-[#5F5C6E]">
                  {selectedFavorite.store.reviews?.length ?? 0} avaliações
                </p>
              </div>

              <div className="flex gap-2 border-t border-[#EBE9F0] pt-4">
                <button
                  type="button"
                  onClick={handleScheduleSelectedFavorite}
                  className={cn(PROFILE_ACTION_PRIMARY_CLASS, 'md:flex-1')}
                >
                  Agendar agora
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFavorite(undefined)}
                  className={cn(PROFILE_ACTION_CLASS, 'md:flex-1')}
                >
                  Fechar
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
