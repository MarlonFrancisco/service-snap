import { useFavoritesMutations } from '@/hooks/use-mutations/use-favorites-mutations';
import { useUserQuery } from '@/hooks/use-query/use-user-query';
import { useAnalytics } from '@/providers/analytics.provider';
import { useCallback, useMemo, useState } from 'react';

/** `source` identifica onde o coração foi clicado nos eventos de analytics. */
export function useStoreCardFavorite(storeId: string, source = 'store_card') {
  const analytics = useAnalytics();
  const { isLoggedIn, user } = useUserQuery();
  const { createFavorite, deleteFavorite } = useFavoritesMutations();
  const [isAnimating, setIsAnimating] = useState(false);

  const favorited = useMemo(() => {
    return user?.favorites.find((favorite) => favorite.store.id === storeId);
  }, [user?.favorites, storeId]);

  const isFavorite = Boolean(favorited);

  const toggleFavorite = useCallback(() => {
    if (!isLoggedIn || !user) return;

    // Animação do coração
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);

    if (isFavorite && favorited) {
      deleteFavorite(
        { id: favorited.id, user: { id: user.id } },
        {
          onSuccess: () =>
            analytics.track('remove_from_wishlist', {
              item_id: storeId,
              source,
            }),
        },
      );
    } else {
      createFavorite(
        { store: { id: storeId }, user: { id: user.id } },
        {
          onSuccess: () =>
            analytics.track('add_to_wishlist', { item_id: storeId, source }),
        },
      );
    }
  }, [
    isLoggedIn,
    user,
    isFavorite,
    favorited,
    storeId,
    createFavorite,
    deleteFavorite,
    analytics,
    source,
  ]);

  return {
    isLoggedIn,
    isFavorite,
    isAnimating,
    toggleFavorite,
  };
}
