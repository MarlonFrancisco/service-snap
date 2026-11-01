import { Skeleton } from '@repo/ui';
import {
  MODULE_LEAD_CLASS,
  MODULE_RAISED_CARD_CLASS,
} from '../../notifications-module.styles';
import { ModuleErrorState, NoStoreState } from '../module-state';
import type { TReminderChannelLayoutConfig } from './reminder-channel-card.types';

const ReminderChannelSkeleton = () => (
  <div
    role="status"
    aria-label="Carregando configurações"
    className={MODULE_RAISED_CARD_CLASS}
  >
    <div className="flex items-center justify-between gap-3">
      <div className="grid flex-1 gap-2">
        <Skeleton className="h-5 w-48 max-w-full rounded-[14px]" />
        <Skeleton className="h-4 w-72 max-w-full rounded-[14px]" />
      </div>
      <Skeleton className="h-6 w-24 rounded-full" />
    </div>
    <Skeleton className="h-[50px] w-full rounded-[14px]" />
    <Skeleton className="h-[100px] w-full rounded-[14px]" />
    <div className="flex justify-between gap-3">
      <Skeleton className="h-12 w-40 rounded-full" />
      <Skeleton className="h-12 w-44 rounded-full" />
    </div>
  </div>
);

export const ReminderChannelLayout = ({
  title,
  description,
  loadState,
  onRetry,
  isRetrying,
  children,
}: TReminderChannelLayoutConfig) => (
  <div className="grid max-w-[860px] gap-4">
    <div>
      <h2 className="sr-only">{title}</h2>
      <p className={MODULE_LEAD_CLASS}>{description}</p>
    </div>

    {loadState === 'loading' ? <ReminderChannelSkeleton /> : null}
    {loadState === 'no-store' ? <NoStoreState headingLevel="h3" /> : null}
    {loadState === 'error' ? (
      <ModuleErrorState
        headingLevel="h3"
        onRetry={onRetry}
        isRetrying={isRetrying}
      />
    ) : null}
    {loadState === 'ready' ? children : null}
  </div>
);
