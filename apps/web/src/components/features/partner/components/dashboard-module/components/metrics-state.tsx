'use client';

import {
  PARTNER_MUTED_TEXT_CLASS,
  PARTNER_PRIMARY_ACTION_CLASS,
} from '@/components/features/partner/partner.styles';
import { cn } from '@repo/ui';
import { Store, TriangleAlert } from 'lucide-react';
import { METRICS_CARD_CLASS } from '../dashboard-module.styles';
import type {
  TMetricsHeading,
  TMetricsStateConfig,
} from '../dashboard-module.types';
import { METRICS_STORES_HREF } from '../utils/metrics.constants';
import {
  METRICS_STATE_PANEL_CLASS,
  MetricsNotFound,
} from './metrics-not-found';

const BONE_CLASS = 'rounded-[14px] bg-[#EBE9F0] motion-safe:animate-pulse';

const KPI_BONES = ['first', 'second', 'third', 'fourth'];

const MetricsSkeleton = () => (
  <div role="status" aria-label="Carregando métricas" className="grid gap-3.5">
    <div className="grid grid-cols-2 gap-2.5 md:gap-3.5 lg:grid-cols-4">
      {KPI_BONES.map((bone) => (
        <div key={bone} className={cn(BONE_CLASS, 'h-[78px] md:h-[118px]')} />
      ))}
    </div>
    <div className={METRICS_CARD_CLASS}>
      <div className={cn(BONE_CLASS, 'h-5 w-40')} />
      <div className={cn(BONE_CLASS, 'mt-4 h-[220px]')} />
    </div>
  </div>
);

const MetricsError = ({
  onRetry,
  titleAs: Title = 'h3',
}: {
  onRetry: () => void;
  titleAs?: TMetricsHeading;
}) => (
  <div role="alert" className={METRICS_STATE_PANEL_CLASS}>
    <span
      aria-hidden="true"
      className="grid size-12 place-items-center rounded-full bg-[#FBE8E6] text-[#A4231A]"
    >
      <TriangleAlert className="size-[22px] stroke-[1.8]" />
    </span>
    <Title className="text-lg font-extrabold tracking-[-0.02em]">
      Não foi possível carregar
    </Title>
    <p
      className={cn(
        'max-w-[340px] text-sm leading-normal',
        PARTNER_MUTED_TEXT_CLASS,
      )}
    >
      Seus dados continuam salvos. Verifique a conexão e tente de novo.
    </p>
    <button
      type="button"
      onClick={onRetry}
      className={cn(PARTNER_PRIMARY_ACTION_CLASS, 'mt-1.5 px-[18px]')}
    >
      Tentar novamente
    </button>
  </div>
);

export const MetricsState = ({
  view,
  empty,
  onRetry,
  titleAs,
}: TMetricsStateConfig) => {
  if (view === 'loading') return <MetricsSkeleton />;
  if (view === 'error') {
    return <MetricsError onRetry={onRetry} titleAs={titleAs} />;
  }
  if (view === 'no-store') {
    return (
      <MetricsNotFound
        title="Nenhuma loja cadastrada"
        description="Você ainda não cadastrou nenhuma loja. Adicione a primeira para começar a receber agendamentos."
        actionLabel="Adicionar nova loja"
        actionHref={METRICS_STORES_HREF}
        icon={Store}
        titleAs="h2"
      />
    );
  }
  return <>{empty}</>;
};
