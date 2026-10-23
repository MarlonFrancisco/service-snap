import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export const useCategoriesGrid = () => {
  const router = useRouter();

  const handleCategoryClick = useCallback(
    (categoryName: string) => {
      const params = new URLSearchParams({
        query: categoryName,
        category: categoryName,
      });
      router.push(`/booking?${params.toString()}`);
    },
    [router],
  );

  return {
    handleCategoryClick,
  };
};
