import type { TReviewCardConfig } from './review-card.types';

export const useReviewCard = ({ review }: TReviewCardConfig) => {
  const { firstName, lastName, avatar } = review.user;

  return {
    fullName: `${firstName} ${lastName}`,
    initials: `${firstName.charAt(0)}${lastName.charAt(0)}`,
    avatarSrc: `${process.env.NEXT_PUBLIC_CDN_URL}${avatar}`,
    formattedDate: new Date(review.createdAt).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }),
  };
};
