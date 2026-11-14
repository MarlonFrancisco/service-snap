'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  cn,
  Spinner,
  Textarea,
} from '@repo/ui';
import {
  MODULE_ACTION_CLASS,
  MODULE_DANGER_ACTION_CLASS,
  MODULE_DIALOG_CANCEL_CLASS,
  MODULE_DIALOG_CLASS,
  MODULE_DIALOG_DANGER_CLASS,
  MODULE_DIALOG_TEXT_CLASS,
  MODULE_DIALOG_TITLE_CLASS,
  MODULE_PRIMARY_ACTION_CLASS,
} from '../../../notifications-module/notifications-module.styles';
import { REVIEW_REPLY_MAX_LENGTH } from '../../reviews-module.constants';
import { REVIEWS_REPLY_BLOCK_CLASS } from '../../reviews-module.styles';
import { useReviewItem } from './review-item.hook';
import type { TReviewItemConfig } from './review-item.types';

export const ReviewItem = ({
  review,
  storeId,
  canReply,
  onForbidden,
}: TReviewItemConfig) => {
  const {
    authorName,
    dateLabel,
    stars,
    starsLabel,
    scheduleLabel,
    hasReply,
    replyDateLabel,
    isEditing,
    draft,
    draftLength,
    canSubmitReply,
    isReplyingReview,
    textareaId,
    focusTextarea,
    handleStartReply,
    handleCancelReply,
    handleDraftChange,
    handleSubmitReply,
    isConfirmingDelete,
    handleRequestDelete,
    handleDeleteDialogChange,
    handleConfirmDelete,
  } = useReviewItem({ review, storeId, onForbidden });

  return (
    <article className="grid gap-2 border-b border-[#F0EEF4] px-5 py-[18px] last:border-0">
      <div className="flex flex-wrap justify-between gap-2 text-[15px] font-bold">
        <span className="min-w-0 break-words">{authorName}</span>
        <span className="text-[13px] font-medium text-[#5F5C6E]">
          {dateLabel}
        </span>
      </div>
      <span
        role="img"
        aria-label={starsLabel}
        className="text-[13px] font-bold tracking-[2px] text-[#B45309]"
      >
        {stars}
      </span>
      <span className="text-[13px] text-[#5F5C6E]">{scheduleLabel}</span>
      <p className="text-sm leading-[1.55] break-words">{review.comment}</p>

      {isEditing ? (
        <form onSubmit={handleSubmitReply}>
          <label
            htmlFor={textareaId}
            className="block text-[13px] font-semibold"
          >
            Responder publicamente
          </label>
          <Textarea
            id={textareaId}
            ref={focusTextarea}
            value={draft}
            onChange={handleDraftChange}
            maxLength={REVIEW_REPLY_MAX_LENGTH}
            disabled={isReplyingReview}
            className="mt-1.5 block min-h-24 w-full resize-y rounded-[14px] border-[#0B0B0F] bg-white px-3.5 py-3 text-base leading-normal font-medium text-[#0B0B0F] shadow-none focus-visible:ring-[#0B0B0F]/15 md:text-sm"
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-[#5F5C6E]">
            <span aria-live="polite">
              {draftLength}/{REVIEW_REPLY_MAX_LENGTH} · todos os clientes veem
              esta resposta
            </span>
            <span className="flex gap-1.5">
              <button
                type="button"
                onClick={handleCancelReply}
                disabled={isReplyingReview}
                className={MODULE_ACTION_CLASS}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!canReply || !canSubmitReply}
                className={MODULE_PRIMARY_ACTION_CLASS}
              >
                {isReplyingReview ? (
                  <>
                    <Spinner />
                    Publicando...
                  </>
                ) : (
                  'Publicar resposta'
                )}
              </button>
            </span>
          </div>
        </form>
      ) : hasReply ? (
        <>
          <div className={REVIEWS_REPLY_BLOCK_CLASS}>
            <b className="mb-0.5 block text-xs">
              Sua resposta{replyDateLabel ? ` · ${replyDateLabel}` : ''}
            </b>
            <p className="break-words whitespace-pre-line">{review.reply}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={handleStartReply}
              disabled={!canReply}
              className={MODULE_ACTION_CLASS}
            >
              Editar resposta
            </button>
            <button
              type="button"
              onClick={handleRequestDelete}
              disabled={!canReply}
              className={MODULE_DANGER_ACTION_CLASS}
            >
              Apagar resposta
            </button>
          </div>
        </>
      ) : (
        <div>
          <button
            type="button"
            onClick={handleStartReply}
            disabled={!canReply}
            className={MODULE_ACTION_CLASS}
          >
            Responder
          </button>
        </div>
      )}

      <AlertDialog
        open={isConfirmingDelete}
        onOpenChange={handleDeleteDialogChange}
      >
        <AlertDialogContent
          className={cn(MODULE_DIALOG_CLASS, 'sm:max-w-[480px]')}
        >
          <AlertDialogHeader className="text-left">
            <AlertDialogTitle className={MODULE_DIALOG_TITLE_CLASS}>
              Apagar sua resposta?
            </AlertDialogTitle>
            <AlertDialogDescription className={MODULE_DIALOG_TEXT_CLASS}>
              Ela sai da página da loja. A avaliação de {authorName} continua
              publicada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-2.5">
            <AlertDialogCancel
              disabled={isReplyingReview}
              className={MODULE_DIALOG_CANCEL_CLASS}
            >
              Voltar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isReplyingReview}
              onClick={handleConfirmDelete}
              className={MODULE_DIALOG_DANGER_CLASS}
            >
              {isReplyingReview ? 'Apagando...' : 'Apagar resposta'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  );
};
