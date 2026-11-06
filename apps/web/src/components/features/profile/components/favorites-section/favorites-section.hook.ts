import { useFavoritesMutations } from '@/hooks/use-mutations/use-favorites-mutations';
import { useUserQuery } from '@/hooks/use-query/use-user-query';
import { useAnalytics } from '@/providers/analytics.provider';
import { IFavorite } from '@/types/api/favorites.types';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

export const useFavoritesSection = () => {
  const [selectedFavorite, setSelectedFavorite] = useState<
    IFavorite | undefined
  >(undefined);

  const router = useRouter();
  const analytics = useAnalytics();
  const { deleteFavorite } = useFavoritesMutations();

  const { user } = useUserQuery();

  const favorites = useMemo(() => {
    return user?.favorites ?? [];
  }, [user?.favorites]);

  const handleRemoveFavorite = useCallback(
    (favoriteId: string) => {
      const storeId = favorites.find((favorite) => favorite.id === favoriteId)
        ?.store.id;

      deleteFavorite(
        { id: favoriteId, user: { id: user!.id } },
        {
          onSuccess: () => {
            if (!storeId) return;
            analytics.track('remove_from_wishlist', {
              item_id: storeId,
              source: 'profile_favorites',
            });
          },
        },
      );
    },
    [analytics, deleteFavorite, favorites, user],
  );

  const handleSchedule = useCallback(
    (favorite: IFavorite) => {
      analytics.track('select_item', {
        item_id: favorite.store.id,
        item_list_name: 'favorites',
      });
      router.push(`/booking/${favorite.store.id}`);
    },
    [analytics, router],
  );

  const handleRemoveSelectedFavorite = useCallback(() => {
    if (!selectedFavorite) return;

    handleRemoveFavorite(selectedFavorite.id);
    setSelectedFavorite(undefined);
  }, [handleRemoveFavorite, selectedFavorite]);

  const handleScheduleSelectedFavorite = useCallback(() => {
    if (!selectedFavorite) return;

    setSelectedFavorite(undefined);
    toast.success('Redirecionando para agendamento...');
    handleSchedule(selectedFavorite);
  }, [handleSchedule, selectedFavorite]);

  return {
    favorites,
    selectedFavorite,
    setSelectedFavorite,
    handleRemoveFavorite,
    handleSchedule,
    handleRemoveSelectedFavorite,
    handleScheduleSelectedFavorite,
  };
};
