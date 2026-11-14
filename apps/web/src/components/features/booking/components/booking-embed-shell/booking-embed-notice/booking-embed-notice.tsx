import { cn, Spinner } from '@repo/ui';
import type { TBookingEmbedNoticeConfig } from './booking-embed-notice.types';

export const BookingEmbedNotice = ({
  title,
  description,
  isLoading = false,
  className,
  children,
  ...props
}: TBookingEmbedNoticeConfig) => (
  <div
    className={cn(
      'flex min-h-full flex-col items-center justify-center gap-2 px-5 py-12 text-center',
      className,
    )}
    {...props}
  >
    {isLoading ? <Spinner className="size-6 text-[#5F5C6E]" /> : null}
    <h2 className="text-lg font-extrabold tracking-[-0.02em]">{title}</h2>
    <p className="max-w-[300px] text-sm leading-normal text-[#5F5C6E]">
      {description}
    </p>
    {children ? (
      <div className="mt-3 flex w-full max-w-[300px] flex-col gap-2">
        {children}
      </div>
    ) : null}
  </div>
);
