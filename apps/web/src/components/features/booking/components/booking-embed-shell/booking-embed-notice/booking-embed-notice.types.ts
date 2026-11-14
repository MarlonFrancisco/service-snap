import type { HTMLAttributes, ReactNode } from 'react';

export type TBookingEmbedNoticeConfig = HTMLAttributes<HTMLDivElement> & {
  title: string;
  description: string;
  isLoading?: boolean;
  children?: ReactNode;
};
