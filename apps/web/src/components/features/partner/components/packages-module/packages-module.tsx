'use client';

import { cn, Skeleton } from '@repo/ui';
import { Lock, Package, Plus } from 'lucide-react';
import Link from 'next/link';
import {
  ModuleErrorState,
  ModuleStatePanel,
  NoStoreState,
} from '../notifications-module/components/module-state';
import { PackageFormDialog } from './components/package-form-dialog';
import { SellPackageDialog } from './components/sell-package-dialog';
import { usePackagesModule } from './packages-module.hook';
import {
  getRetentionChipClass,
  RETENTION_BUTTON_CLASS,
  RETENTION_BUTTON_ICON_CLASS,
  RETENTION_CARD_CLASS,
  RETENTION_CARD_TITLE_CLASS,
  RETENTION_ITEM_CLASS,
  RETENTION_ITEM_LINES_CLASS,
  RETENTION_PRIMARY_BUTTON_CLASS,
  RETENTION_SMALL_BUTTON_CLASS,
  RETENTION_TEXT_CLASS,
} from './packages-module.styles';

const LEAD =
  'Vendidos e cobrados fora do app. O ServiceSnap controla o saldo de sessões e dá baixa quando o atendimento é fechado.';

export const PackagesModule = () => {
  const {
    storeId,
    view,
    rows,
    isRetrying,
    handleRetry,
    handleCreate,
    handleEdit,
    handleSell,
    formTarget,
    handleFormOpenChange,
    sellTarget,
    handleSellOpenChange,
  } = usePackagesModule();

  if (view === 'no-store') return <NoStoreState />;
  if (view === 'no-access') {
    return (
      <ModuleStatePanel
        icon={Lock}
        title="Sem acesso aos pacotes"
        description="Só o dono e o gerente da loja criam e vendem pacotes por aqui. O saldo de cada cliente aparece no fechamento do atendimento."
      >
        <Link href="/partner/agenda" className={RETENTION_PRIMARY_BUTTON_CLASS}>
          Ir para a agenda
        </Link>
      </ModuleStatePanel>
    );
  }

  const renderList = () => {
    if (view === 'loading') {
      return (
        <div
          role="status"
          aria-label="Carregando pacotes"
          className="grid gap-3"
        >
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton
              key={index}
              className="h-[86px] rounded-2xl bg-[#F0EEF4]"
            />
          ))}
        </div>
      );
    }
    if (view === 'error') {
      return (
        <ModuleErrorState
          headingLevel="h3"
          onRetry={handleRetry}
          isRetrying={isRetrying}
        />
      );
    }
    if (rows.length === 0) {
      return (
        <ModuleStatePanel
          icon={Package}
          headingLevel="h3"
          title="Nenhum pacote ainda"
          description="Crie um pacote, como 4 cortes em 30 dias, e venda para os seus clientes."
        >
          <button
            type="button"
            onClick={handleCreate}
            className={cn(
              RETENTION_PRIMARY_BUTTON_CLASS,
              RETENTION_SMALL_BUTTON_CLASS,
            )}
          >
            Novo pacote
          </button>
        </ModuleStatePanel>
      );
    }

    return (
      <ul className="m-0 grid list-none gap-3 p-0">
        {rows.map((row) => (
          <li key={row.id} className={RETENTION_ITEM_CLASS}>
            <div className={RETENTION_ITEM_LINES_CLASS}>
              <b>{row.name}</b>
              <span>{row.summary}</span>
              <span>{row.price}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className={getRetentionChipClass(row.chip.tone)}>
                {row.chip.label}
              </span>
              {row.isActive ? (
                <button
                  type="button"
                  onClick={() => handleSell(row.source)}
                  className={cn(
                    RETENTION_PRIMARY_BUTTON_CLASS,
                    RETENTION_SMALL_BUTTON_CLASS,
                  )}
                >
                  Vender
                  <span className="sr-only"> {row.name}</span>
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => handleEdit(row.source)}
                className={cn(
                  RETENTION_BUTTON_CLASS,
                  RETENTION_SMALL_BUTTON_CLASS,
                )}
              >
                Editar
                <span className="sr-only"> {row.name}</span>
              </button>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="grid max-w-[860px] gap-4">
      <section
        aria-labelledby="packages-title"
        className={RETENTION_CARD_CLASS}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="packages-title" className={RETENTION_CARD_TITLE_CLASS}>
            Pacotes
          </h2>
          <button
            type="button"
            onClick={handleCreate}
            disabled={view !== 'ready'}
            className={cn(RETENTION_BUTTON_CLASS, RETENTION_SMALL_BUTTON_CLASS)}
          >
            <Plus aria-hidden="true" className={RETENTION_BUTTON_ICON_CLASS} />
            Novo pacote
          </button>
        </div>
        <p className={RETENTION_TEXT_CLASS}>{LEAD}</p>
        {renderList()}
      </section>

      <PackageFormDialog
        storeId={storeId}
        isOpen={!!formTarget}
        onOpenChange={handleFormOpenChange}
        servicePackage={formTarget?.servicePackage ?? null}
      />
      <SellPackageDialog
        storeId={storeId}
        servicePackage={sellTarget}
        onOpenChange={handleSellOpenChange}
      />
    </div>
  );
};
