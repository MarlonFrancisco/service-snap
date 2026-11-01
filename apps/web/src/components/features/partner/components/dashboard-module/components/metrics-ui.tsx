'use client';

import { PARTNER_MUTED_TEXT_CLASS } from '@/components/features/partner/partner.styles';
import { cn } from '@repo/ui';
import {
  METRICS_CARD_CLASS,
  METRICS_SECTION_SUBTITLE_CLASS,
} from '../dashboard-module.styles';
import type {
  TMetricCardConfig,
  TMetricsChartTableConfig,
  TMetricsPageHeaderConfig,
  TMetricsRowConfig,
  TMetricsSectionConfig,
} from '../dashboard-module.types';

export const MetricCard = ({
  label,
  value,
  detail,
  comparison,
}: TMetricCardConfig) => (
  <div className={METRICS_CARD_CLASS}>
    <p
      className={cn(
        'text-xs font-semibold md:text-[13px]',
        PARTNER_MUTED_TEXT_CLASS,
      )}
    >
      {label}
    </p>
    <p className="mt-1 text-[22px] font-extrabold tracking-[-0.02em] [overflow-wrap:anywhere] md:mt-1.5 md:text-[28px] md:tracking-[-0.03em]">
      {value}
    </p>
    {detail && (
      <p
        className={cn('mt-0.5 text-xs md:mt-1 md:text-[13px]', PARTNER_MUTED_TEXT_CLASS)}
      >
        {detail}
        {comparison && (
          <span className="hidden md:inline"> {comparison}</span>
        )}
      </p>
    )}
  </div>
);

export const MetricsSection = ({
  title,
  subtitle,
  headingAs: Heading = 'h3',
  className,
  children,
}: TMetricsSectionConfig) => (
  <section className={cn(METRICS_CARD_CLASS, className)}>
    <Heading className="text-base font-extrabold tracking-[-0.015em] md:text-[17px]">
      {title}
    </Heading>
    {subtitle ? (
      <p className={METRICS_SECTION_SUBTITLE_CLASS}>{subtitle}</p>
    ) : (
      <div className="mb-3.5" />
    )}
    {children}
  </section>
);

export const MetricsRow = ({ label, sublabel, value }: TMetricsRowConfig) => (
  <div className="flex items-center justify-between gap-3.5 border-b border-[#F0EEF4] py-[11px] text-sm last:border-b-0">
    <div className="min-w-0 [overflow-wrap:anywhere]">
      {label}
      {sublabel && (
        <p className={cn('text-[13px]', PARTNER_MUTED_TEXT_CLASS)}>{sublabel}</p>
      )}
    </div>
    <div className="shrink-0 text-right font-bold">{value}</div>
  </div>
);

export const MetricsSectionEmpty = ({ message }: { message: string }) => (
  <p
    className={cn(
      'rounded-[14px] bg-[#F7F6FA] px-4 py-8 text-center text-sm',
      PARTNER_MUTED_TEXT_CLASS,
    )}
  >
    {message}
  </p>
);

export const MetricsChartTable = ({
  caption,
  headers,
  rows,
}: TMetricsChartTableConfig) => (
  <table className="sr-only">
    <caption>{caption}</caption>
    <thead>
      <tr>
        {headers.map((header) => (
          <th key={header} scope="col">
            {header}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {rows.map((row) => (
        <tr key={row.join('|')}>
          {row.map((cell, index) => (
            <td key={headers[index]}>{cell}</td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

export const MetricsPageHeader = ({
  title,
  summary,
  children,
}: TMetricsPageHeaderConfig) => (
  <div className="flex flex-wrap items-center justify-between gap-3">
    <div className="min-w-0">
      <h2 className="text-2xl font-extrabold tracking-[-0.025em]">{title}</h2>
      {summary && (
        <p className={cn('mt-0.5 text-[15px]', PARTNER_MUTED_TEXT_CLASS)}>
          {summary}
        </p>
      )}
    </div>
    {children}
  </div>
);

export const MetricsRefreshAlert = () => (
  <p
    role="status"
    className="rounded-[14px] bg-[#FFF1E0] px-4 py-3 text-sm text-[#6E3B00]"
  >
    Não foi possível atualizar. Estes são os últimos dados carregados.
  </p>
);
