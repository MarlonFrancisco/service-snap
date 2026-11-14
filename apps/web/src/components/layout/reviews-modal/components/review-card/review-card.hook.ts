import { getUserAvatarUrl } from '@/utils/helpers/storage.helper';
import {
  formatReviewDate,
  getReviewAuthorName,
  getReviewScheduleLabel,
} from '@/utils/helpers/review.helper';
import type { TReviewCardConfig } from './review-card.types';

export const useReviewCard = ({ review }: TReviewCardConfig) => {
  const { firstName, lastName, avatar } = review.user ?? {};

  return {
    fullName: getReviewAuthorName(review),
    // Sobrenome pode vir nulo do banco; o default do destructuring não cobre null
    initials: `${firstName?.charAt(0) ?? ''}${lastName?.charAt(0) ?? ''}`,
    avatarSrc: getUserAvatarUrl(avatar),
    formattedDate: formatReviewDate(review.createdAt),
    verifiedLabel: getReviewScheduleLabel(review),
    reply: review.reply,
    replyDate: review.repliedAt ? formatReviewDate(review.repliedAt) : null,
  };
};
