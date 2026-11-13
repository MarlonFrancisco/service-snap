'use client';

import { cn, Progress } from '@repo/ui';
import { CreditCard, Store } from 'lucide-react';
import Link from 'next/link';
import {
  PARTNER_ICON_BUTTON_CLASS,
  PARTNER_MUTED_TEXT_CLASS,
  PARTNER_NAV_ICON_CLASS,
  PARTNER_PRIMARY_ACTION_CLASS,
  PARTNER_SOFT_SURFACE_CLASS,
} from '../../../../partner.styles';
import { useAdminSidebarFooter } from './admin-sidebar-footer.hook';

type TAdminSidebarFooterConfig = {
  isCollapsed: boolean;
};

const getUsageBarClass = (percentage: number) => {
  if (percentage >= 100) return '[&>div]:bg-red-500';
  if (percentage >= 80) return '[&>div]:bg-amber-500';
  return '[&>div]:bg-[#0B0B0F]';
};

export const AdminSidebarFooter = ({
  isCollapsed,
}: TAdminSidebarFooterConfig) => {
  const {
    memberCard,
    currentPlan,
    isHidden,
    usageRows,
    isNearLimit,
    isAtLimit,
    planAction,
    handlePlanActionClick,
  } = useAdminSidebarFooter();

  if (memberCard) {
    if (isCollapsed) {
      return (
        <span
          title={`${memberCard.storeName} · ${memberCard.roleLabel}`}
          className={cn(PARTNER_ICON_BUTTON_CLASS, 'mt-auto')}
        >
          <Store className={PARTNER_NAV_ICON_CLASS} aria-hidden="true" />
          <span className="sr-only">
            {memberCard.storeName}, {memberCard.roleLabel}
          </span>
        </span>
      );
    }

    return (
      <div
        className={cn(
          PARTNER_SOFT_SURFACE_CLASS,
          'mt-auto flex shrink-0 flex-col gap-1.5 p-4 text-[13px]',
          PARTNER_MUTED_TEXT_CLASS,
        )}
      >
        <p className="truncate text-sm font-bold text-[#0B0B0F]">
          {memberCard.storeName}
        </p>
        <span className="self-start rounded-full border border-[#E3E1EA] bg-white px-[9px] py-[3px] text-xs font-bold text-[#0B0B0F]">
          {memberCard.roleLabel}
        </span>
        <p>Seu acesso nesta loja</p>
      </div>
    );
  }

  if (!currentPlan || isHidden) {
    return null;
  }

  if (isCollapsed) {
    return (
      <Link
        href={planAction.href}
        onClick={handlePlanActionClick}
        aria-label={`${currentPlan.planName}: ${planAction.label}`}
        title={currentPlan.planName}
        className={cn(PARTNER_ICON_BUTTON_CLASS, 'mt-auto')}
      >
        <CreditCard className={PARTNER_NAV_ICON_CLASS} aria-hidden="true" />
      </Link>
    );
  }

  return (
    <div
      className={cn(
        PARTNER_SOFT_SURFACE_CLASS,
        'mt-auto shrink-0 p-4 text-[13px]',
      )}
    >
      <p className="truncate text-sm font-bold">{currentPlan.planName}</p>
      <p>Plano atual</p>

      {usageRows.map(({ id, label, usage }) => (
        <div key={id} className="mt-2.5">
          <p
            className={cn(
              'flex justify-between gap-2',
              PARTNER_MUTED_TEXT_CLASS,
            )}
          >
            {label}
            <span>
              {usage.current}/{usage.isUnlimited ? '∞' : usage.limit}
            </span>
          </p>
          {usage.isUnlimited ? (
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-emerald-100">
              <div className="h-full w-full bg-gradient-to-r from-emerald-400 to-emerald-600 motion-safe:animate-pulse" />
            </div>
          ) : (
            <Progress
              aria-label={`Uso de ${label.toLowerCase()} do plano`}
              value={Math.min(usage.percentage, 100)}
              className={cn(
                'mt-1.5 h-1.5 bg-[#EBE9F0]',
                getUsageBarClass(usage.percentage),
              )}
            />
          )}
        </div>
      ))}

      {isAtLimit && (
        <div
          role="status"
          className="mt-3 rounded-[14px] border border-red-200 bg-red-50 p-2 text-xs"
        >
          <p className="font-semibold text-red-800">
            Limite do plano atingido!
          </p>
          <p className="mt-0.5 text-red-700">
            Faça upgrade para continuar criando
          </p>
        </div>
      )}

      {!isAtLimit && isNearLimit && (
        <p
          role="status"
          className="mt-3 rounded-[14px] border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800"
        >
          Você está próximo do limite do seu plano
        </p>
      )}

      <Link
        href={planAction.href}
        onClick={handlePlanActionClick}
        className={cn(PARTNER_PRIMARY_ACTION_CLASS, 'mt-3')}
      >
        {planAction.label}
      </Link>
    </div>
  );
};
