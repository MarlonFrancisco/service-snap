'use client';
import { plusJakartaSans } from '@/utils/fonts/plus-jakarta-sans';
import {
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@repo/ui';
import { ReviewsContent, ReviewsModalSkeleton } from './components';
import { useReviewsModal } from './reviews-modal.hook';
import { REVIEWS_FOCUS_RING_CLASS } from './reviews-modal.styles';

export const ReviewsModal = () => {
  const {
    isOpen,
    isMobile,
    isPendingReviews,
    businessName,
    handleOpenChange,
    handleClose,
  } = useReviewsModal();

  const content = (
    <>
      {isPendingReviews ? <ReviewsModalSkeleton /> : <ReviewsContent />}
      <button
        type="button"
        aria-label="Fechar"
        onClick={handleClose}
        className={cn(
          'absolute top-3.5 right-3.5 flex size-11 cursor-pointer items-center justify-center rounded-full bg-[#F4F3F7] text-lg text-[#0B0B0F]',
          REVIEWS_FOCUS_RING_CLASS,
        )}
      >
        ×
      </button>
    </>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className={cn(
            plusJakartaSans.className,
            'h-[90vh] gap-0 overflow-hidden rounded-t-[28px] border-t-0 p-0 text-[#0B0B0F]',
          )}
        >
          <SheetTitle className="sr-only">Avaliações de clientes</SheetTitle>
          <SheetDescription className="sr-only">
            Veja as avaliações e comentários de outros clientes sobre{' '}
            {businessName}
          </SheetDescription>
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          plusJakartaSans.className,
          'flex max-h-[85vh] flex-col gap-0 overflow-hidden rounded-[28px] border-0 bg-white p-0 text-[#0B0B0F] shadow-[0_20px_60px_rgba(15,12,30,0.18)] sm:max-w-[860px] [&>button:last-child]:hidden',
        )}
      >
        <DialogTitle className="sr-only">Avaliações de clientes</DialogTitle>
        <DialogDescription className="sr-only">
          Veja as avaliações e comentários de outros clientes sobre{' '}
          {businessName}
        </DialogDescription>
        {content}
      </DialogContent>
    </Dialog>
  );
};
