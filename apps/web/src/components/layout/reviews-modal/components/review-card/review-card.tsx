import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui';
import { StarRating } from '../star-rating';
import { useReviewCard } from './review-card.hook';
import type { TReviewCardConfig } from './review-card.types';

export const ReviewCard = ({ review }: TReviewCardConfig) => {
  const { fullName, initials, avatarSrc, formattedDate } = useReviewCard({
    review,
  });

  return (
    <article className="grid grid-cols-[44px_1fr] gap-3 rounded-[14px] bg-[#F7F6FA] p-3.5">
      <Avatar aria-hidden="true" className="size-11">
        <AvatarImage src={avatarSrc} />
        <AvatarFallback className="bg-white text-sm font-bold text-[#0B0B0F]">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0">
        <div className="flex justify-between gap-3 text-sm font-bold">
          <span className="min-w-0 break-words">{fullName}</span>
          <span className="shrink-0 text-[13px] font-medium text-[#5F5C6E]">
            {formattedDate}
          </span>
        </div>

        <div className="my-[3px]">
          <StarRating rating={review.rating} size="small" />
        </div>

        <p className="text-sm leading-[1.5] break-words">{review.comment}</p>
      </div>
    </article>
  );
};
