'use client';

import { useReviewsMutations } from '@/hooks/use-mutations/use-reviews-mutations';
import {
  formatReviewDate,
  formatStars,
  getHttpStatus,
  getReviewAuthorName,
  getReviewScheduleLabel,
  getStarsLabel,
} from '@/utils/helpers/review.helper';
import {
  useCallback,
  useId,
  useState,
  type ChangeEvent,
  type FormEvent,
  type MouseEvent,
} from 'react';
import { REVIEW_LEGACY_LABEL } from '../../reviews-module.constants';
import { hasReply } from '../../reviews-module.helpers';
import type { TReviewItemConfig } from './review-item.types';

export const useReviewItem = ({
  review,
  storeId,
  onForbidden,
}: Omit<TReviewItemConfig, 'canReply'>) => {
  const { replyReview, isReplyingReview } = useReviewsMutations();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const textareaId = useId();

  const currentReply = review.reply?.trim() ?? '';
  const trimmedDraft = draft.trim();

  // Leva o foco para o campo assim que o formulário abre
  const focusTextarea = useCallback((node: HTMLTextAreaElement | null) => {
    node?.focus();
  }, []);

  const saveReply = useCallback(
    (reply: string, onDone: () => void, onFail?: () => void) => {
      replyReview(
        { storeId, reviewId: review.id, reply },
        {
          onSuccess: onDone,
          onError: (error) => {
            if (getHttpStatus(error) === 403) onForbidden();
            onFail?.();
          },
        },
      );
    },
    [replyReview, storeId, review.id, onForbidden],
  );

  const handleStartReply = useCallback(() => {
    setDraft(currentReply);
    setIsEditing(true);
  }, [currentReply]);

  const handleCancelReply = useCallback(() => {
    setIsEditing(false);
    setDraft('');
  }, []);

  const handleDraftChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      setDraft(event.target.value);
    },
    [],
  );

  const handleSubmitReply = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!trimmedDraft || trimmedDraft === currentReply) return;

      saveReply(trimmedDraft, handleCancelReply);
    },
    [trimmedDraft, currentReply, saveReply, handleCancelReply],
  );

  const handleRequestDelete = useCallback(() => {
    setIsConfirmingDelete(true);
  }, []);

  const handleDeleteDialogChange = useCallback(
    (isOpen: boolean) => {
      if (!isReplyingReview) setIsConfirmingDelete(isOpen);
    },
    [isReplyingReview],
  );

  const handleConfirmDelete = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      // Sem isto o diálogo fecharia antes de a API responder
      event.preventDefault();
      const closeDialog = () => setIsConfirmingDelete(false);
      // Texto vazio apaga a resposta na API
      saveReply('', closeDialog, closeDialog);
    },
    [saveReply],
  );

  return {
    authorName: getReviewAuthorName(review),
    dateLabel: formatReviewDate(review.createdAt),
    stars: formatStars(review.rating),
    starsLabel: getStarsLabel(review.rating),
    scheduleLabel:
      getReviewScheduleLabel(review, { withProfessional: true }) ??
      REVIEW_LEGACY_LABEL,
    hasReply: hasReply(review),
    replyDateLabel: review.repliedAt ? formatReviewDate(review.repliedAt) : '',
    isEditing,
    draft,
    draftLength: draft.length,
    canSubmitReply:
      Boolean(trimmedDraft) &&
      trimmedDraft !== currentReply &&
      !isReplyingReview,
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
  };
};
