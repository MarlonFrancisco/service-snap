import { useReviewsQuery } from '@/hooks/use-query/use-reviews-query';
import { useReviewsStore } from '@/store';
import { useIsMobile } from '@repo/ui';
import { useCallback, useEffect, useMemo } from 'react';

export const useReviewsModal = () => {
  const {
    isOpen,
    toggleReviewsModalAction,
    setReviewsAttributesAction,
    businessName,
    storeId,
  } = useReviewsStore();

  const isMobile = useIsMobile();
  const { reviews, isPendingReviews } = useReviewsQuery({ storeId });

  useEffect(() => {
    if (reviews) {
      setReviewsAttributesAction({ reviews });
    }
  }, [reviews, setReviewsAttributesAction]);

  const handleOpenChange = useMemo(
    () => toggleReviewsModalAction,
    [toggleReviewsModalAction],
  );

  const handleClose = useCallback(() => {
    toggleReviewsModalAction(false);
  }, [toggleReviewsModalAction]);

  return {
    isOpen,
    isMobile,
    isPendingReviews,
    businessName,
    handleOpenChange,
    handleClose,
  };
};
