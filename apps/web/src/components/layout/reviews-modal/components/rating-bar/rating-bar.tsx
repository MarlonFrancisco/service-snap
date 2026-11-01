import type { TRatingBarConfig } from './rating-bar.types';

export const RatingBar = ({ rating, percentage }: TRatingBarConfig) => {
  return (
    <div className="mb-2 grid grid-cols-[16px_1fr_38px] items-center gap-2.5 text-[13px] font-semibold">
      <span>{rating}</span>
      <i className="block h-2 overflow-hidden rounded-full bg-[#F0EEF4]">
        <span
          className="block h-full bg-[#0B0B0F]"
          style={{ width: `${percentage}%` }}
        />
      </i>
      <span className="text-right font-medium text-[#5F5C6E]">
        {percentage}%
      </span>
    </div>
  );
};
