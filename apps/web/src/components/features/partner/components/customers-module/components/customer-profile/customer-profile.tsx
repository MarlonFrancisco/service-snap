'use client';

import { cn, Skeleton } from '@repo/ui';
import { ArrowLeft, MessageCircle, Plus, User } from 'lucide-react';
import Link from 'next/link';
import { PARTNER_FOCUS_CLASS } from '../../../../partner.styles';
import { AddAppointmentResponsive } from '../../../agenda-module/components/add-appointment-responsive/add-appointment-responsive';
import {
  ModuleErrorState,
  NoStoreState,
} from '../../../notifications-module/components/module-state';
import {
  CUSTOMERS_BUTTON_CLASS,
  CUSTOMERS_BUTTON_ICON_CLASS,
  CUSTOMERS_CARD_CLASS,
  CUSTOMERS_PRIMARY_BUTTON_CLASS,
} from '../../customers-module.styles';
import { CustomerNotFound, CustomersNoAccess } from '../customers-state';
import { CustomerHistory } from './customer-history';
import { CustomerNotes } from './customer-notes';
import { useCustomerProfile } from './customer-profile.hook';
import type { TCustomerProfileConfig } from './customer-profile.types';
import { CustomerTags } from './customer-tags';

const BackLink = () => (
  <Link
    href="/partner/clientes"
    className={cn(
      'inline-flex min-h-11 items-center gap-1.5 justify-self-start text-sm font-semibold',
      PARTNER_FOCUS_CLASS,
    )}
  >
    <ArrowLeft aria-hidden="true" className="size-4" />
    Clientes
  </Link>
);

const ProfileSkeleton = () => (
  <div role="status" aria-label="Carregando cliente" className="grid gap-5">
    <div className="flex items-center gap-[18px]">
      <Skeleton className="size-[72px] rounded-full bg-[#F0EEF4]" />
      <div className="grid gap-2">
        <Skeleton className="h-7 w-56 rounded-full bg-[#F0EEF4]" />
        <Skeleton className="h-4 w-72 rounded-full bg-[#F0EEF4]" />
      </div>
    </div>
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(200px,100%),1fr))] gap-3.5">
      {Array.from({ length: 4 }, (_, index) => (
        <Skeleton
          key={index}
          className="h-[104px] rounded-[22px] bg-[#F0EEF4]"
        />
      ))}
    </div>
  </div>
);

export const CustomerProfile = ({ userId }: TCustomerProfileConfig) => {
  const {
    storeId,
    storeState,
    hasNoAccess,
    isLoading,
    isError,
    isNotFound,
    isRetrying,
    handleRetry,
    customer,
    name,
    contactLine,
    visitsLine,
    whatsappLink,
    stats,
    handleNewAppointment,
    history,
  } = useCustomerProfile({ userId });

  const renderBody = () => {
    if (storeState === 'no-store') return <NoStoreState headingLevel="h2" />;
    if (hasNoAccess) return <CustomersNoAccess />;
    if (isNotFound) return <CustomerNotFound />;
    if (isError) {
      return <ModuleErrorState onRetry={handleRetry} isRetrying={isRetrying} />;
    }
    if (isLoading || !customer) return <ProfileSkeleton />;

    return (
      <>
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex min-w-0 items-center gap-[18px]">
            <span
              aria-hidden="true"
              className="grid size-[72px] shrink-0 place-items-center rounded-full bg-[#F4F3F7]"
            >
              <User className="size-[30px] stroke-[1.8] text-[#5F5C6E]" />
            </span>
            <div className="min-w-0">
              <h2 className="text-[28px] font-extrabold tracking-[-0.03em] break-words">
                {name}
              </h2>
              <p className="mt-1 text-sm break-all text-[#5F5C6E]">
                {contactLine}
              </p>
              <p className="mt-1 text-sm text-[#5F5C6E]">{visitsLine}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {whatsappLink ? (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className={CUSTOMERS_BUTTON_CLASS}
              >
                <MessageCircle
                  aria-hidden="true"
                  className={CUSTOMERS_BUTTON_ICON_CLASS}
                />
                Conversar no WhatsApp
                <span className="sr-only">(abre em outra aba)</span>
              </a>
            ) : null}
            <button
              type="button"
              onClick={handleNewAppointment}
              className={CUSTOMERS_PRIMARY_BUTTON_CLASS}
            >
              <Plus
                aria-hidden="true"
                className={CUSTOMERS_BUTTON_ICON_CLASS}
              />
              Novo agendamento
            </button>
          </div>
        </div>

        <dl className="grid grid-cols-[repeat(auto-fit,minmax(min(200px,100%),1fr))] gap-3.5">
          {stats.map((stat) => (
            <div key={stat.label} className={CUSTOMERS_CARD_CLASS}>
              <dt className="text-[13px] font-semibold text-[#5F5C6E]">
                {stat.label}
              </dt>
              <dd className="mt-1.5 text-[28px] font-extrabold tracking-[-0.03em]">
                {stat.value}
              </dd>
              {stat.hint ? (
                <dd className="mt-1 text-[13px] text-[#5F5C6E]">{stat.hint}</dd>
              ) : null}
            </div>
          ))}
        </dl>

        <div className="grid items-start gap-5 min-[1180px]:grid-cols-[minmax(0,1fr)_380px]">
          <CustomerHistory {...history} />
          <div className="grid gap-5">
            <CustomerTags
              storeId={storeId}
              userId={customer.id}
              tags={customer.tags}
            />
            <CustomerNotes
              storeId={storeId}
              userId={customer.id}
              notes={customer.notes}
            />
          </div>
        </div>

        <AddAppointmentResponsive />
      </>
    );
  };

  return (
    <div className="grid gap-5">
      <BackLink />
      {renderBody()}
    </div>
  );
};
