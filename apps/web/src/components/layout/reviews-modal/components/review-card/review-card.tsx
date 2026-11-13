import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui';
import { StarRating } from '../star-rating';
import { useReviewCard } from './review-card.hook';
import type { TReviewCardConfig } from './review-card.types';

export const ReviewCard = ({ review }: TReviewCardConfig) => {
  const {
    fullName,
    initials,
    avatarSrc,
    formattedDate,
    verifiedLabel,
    reply,
    replyDate,
  } = useReviewCard({ review });

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

        {verifiedLabel && (
          <span className="mb-1.5 inline-flex items-center gap-[5px] rounded-full bg-white px-[9px] py-[3px] text-xs font-semibold text-[#0A6B44]">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="size-[13px] shrink-0 fill-none stroke-current stroke-[2.4] [stroke-linecap:round] [stroke-linejoin:round]"
            >
              <path d="M5 12l5 5 9-10" />
            </svg>
            {verifiedLabel}
          </span>
        )}

        <p className="text-sm leading-[1.5] break-words">{review.comment}</p>

        {reply && (
          <div className="mt-2.5 rounded-r-[10px] border-l-[3px] border-[#0B0B0F] bg-white px-3 py-2.5 text-sm leading-[1.5]">
            <b className="mb-0.5 block text-xs">
              Resposta da loja{' '}
              {replyDate && (
                <span className="font-medium text-[#5F5C6E]">
                  · {replyDate}
                </span>
              )}
            </b>
            <p className="break-words whitespace-pre-line">{reply}</p>
          </div>
        )}
      </div>
    </article>
  );
};
