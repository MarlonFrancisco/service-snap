import { useFavoritesMutations } from '@/hooks/use-mutations/use-favorites-mutations';
import { useUserQuery } from '@/hooks/use-query/use-user-query';
import { IFavorite } from '@/types/api/favorites.types';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

export const useFavoritesSection = () => {
  const [selectedFavorite, setSelectedFavorite] = useState<
    IFavorite | undefined
  >(undefined);

  const router = useRouter();
  const { deleteFavorite } = useFavoritesMutations();

  const { user } = useUserQuery();

  const favorites = useMemo(() => {
    return user?.favorites ?? [];
  }, [user?.favorites]);

  const handleRemoveFavorite = useCallback(
    (favoriteId: string) => {
      deleteFavorite({ id: favoriteId, user: { id: user!.id } });
    },
    [deleteFavorite, user],
  );

  const handleSchedule = useCallback(
    (favorite: IFavorite) => {
      router.push(`/booking/${favorite.store.id}`);
    },
    [router],
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
