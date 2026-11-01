import {
  PARTNER_MUTED_TEXT_CLASS,
  PARTNER_PRIMARY_ACTION_CLASS,
} from '@/components/features/partner/partner.styles';
import { cn } from '@repo/ui';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import type { TMetricsHeading } from '../dashboard-module.types';
import { METRICS_AGENDA_HREF } from '../utils/metrics.constants';

export type TMetricsNotFoundConfig = {
  title: string;
  description: string;
  icon: LucideIcon;
  actionLabel?: string;
  actionHref?: string;
  titleAs?: TMetricsHeading;
};

export const METRICS_STATE_PANEL_CLASS =
  'flex min-h-[230px] flex-col items-center justify-center gap-2 rounded-[24px] border border-[#EBE9F0] bg-white p-6 text-center';

export const MetricsNotFound = ({
  title,
  description,
  icon: Icon,
  actionLabel = 'Ir para a agenda',
  actionHref = METRICS_AGENDA_HREF,
  titleAs: Title = 'h3',
}: TMetricsNotFoundConfig) => (
  <div className={METRICS_STATE_PANEL_CLASS}>
    <span
      aria-hidden="true"
      className="grid size-12 place-items-center rounded-full bg-[#F4F3F7]"
    >
      <Icon className="size-[22px] stroke-[1.8]" />
    </span>
    <Title className="text-lg font-extrabold tracking-[-0.02em]">{title}</Title>
    <p
      className={cn(
        'max-w-[340px] text-sm leading-normal',
        PARTNER_MUTED_TEXT_CLASS,
      )}
    >
      {description}
    </p>
    <Link
      href={actionHref}
      className={cn(PARTNER_PRIMARY_ACTION_CLASS, 'mt-1.5 px-[18px]')}
    >
      {actionLabel}
    </Link>
  </div>
);
