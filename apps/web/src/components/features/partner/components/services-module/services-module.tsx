'use client';

import { cn } from '@repo/ui';
import { PARTNER_MUTED_TEXT_CLASS } from '../../partner.styles';
import { CategoryManagementModal } from './components/category-management';
import { CategorySection } from './components/category-section';
import { EmptyServicesList } from './components/empty-services-list';
import { ServiceFormModal } from './components/service-form';
import { ServicesFilters } from './components/services-filters';
import { ServicesLoadError } from './components/services-load-error';
import { ServicesSkeleton } from './components/services-skeleton';
import { ServicesStats } from './components/services-stats';
import { useServicesModule } from './services-module.hook';

export const ServicesModule = () => {
  const {
    view,
    storeName,
    sections,
    totalServices,
    activeServices,
    resultsLabel,
    isRetrying,
    handleAddService,
    handleClearFilters,
    handleRetry,
  } = useServicesModule();

  const hasContent =
    view === 'empty' || view === 'no-results' || view === 'list';

  return (
    <div className="grid gap-[18px]">
      <div>
        <h2 className="text-2xl font-extrabold tracking-[-0.025em]">
          Gestão de serviços
        </h2>
        <p className={cn('mt-0.5 text-[15px]', PARTNER_MUTED_TEXT_CLASS)}>
          {storeName
            ? `Configure e gerencie os serviços oferecidos em ${storeName}`
            : 'Configure e gerencie os serviços oferecidos na sua loja'}
        </p>
      </div>

      {view === 'loading' && <ServicesSkeleton />}

      {view === 'error' && (
        <ServicesLoadError isRetrying={isRetrying} onRetry={handleRetry} />
      )}

      {view === 'no-store' && <EmptyServicesList variant="no-store" />}

      {hasContent && (
        <>
          <ServicesStats total={totalServices} active={activeServices} />
          <ServicesFilters />
          <p
            role="status"
            className={cn(
              'text-[13px] font-semibold empty:hidden',
              PARTNER_MUTED_TEXT_CLASS,
              view === 'no-results' && 'sr-only',
            )}
          >
            {resultsLabel}
          </p>
        </>
      )}

      {view === 'empty' && (
        <EmptyServicesList variant="empty" onAddService={handleAddService} />
      )}

      {view === 'no-results' && (
        <EmptyServicesList
          variant="no-results"
          onClearFilters={handleClearFilters}
        />
      )}

      {view === 'list' &&
        sections.map((section) => (
          <CategorySection key={section.category.id} section={section} />
        ))}

      <ServiceFormModal />
      <CategoryManagementModal />
    </div>
  );
};
