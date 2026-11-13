'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  cn,
  Skeleton,
} from '@repo/ui';
import { KeyRound, Plus } from 'lucide-react';
import {
  ModuleErrorState,
  ModuleStatePanel,
} from '../../../notifications-module/components/module-state';
import {
  MODULE_DIALOG_CANCEL_CLASS,
  MODULE_DIALOG_CLASS,
  MODULE_DIALOG_DANGER_CLASS,
  MODULE_DIALOG_TEXT_CLASS,
  MODULE_DIALOG_TITLE_CLASS,
} from '../../../notifications-module/notifications-module.styles';
import {
  PANEL_BUTTON_CLASS,
  PANEL_BUTTON_ICON_CLASS,
  PANEL_CARD_CLASS,
  PANEL_CARD_TITLE_CLASS,
  PANEL_CELL_CLASS,
  PANEL_CHIP_CLASS,
  PANEL_CHIP_TONE_CLASS,
  PANEL_CODE_CLASS,
  PANEL_DANGER_BUTTON_CLASS,
  PANEL_HEAD_CELL_CLASS,
  PANEL_NUMBER_CLASS,
  PANEL_SMALL_BUTTON_CLASS,
  PANEL_TABLE_CLASS,
  PANEL_TABLE_WRAPPER_CLASS,
  PANEL_TEXT_CLASS,
} from '../../../audit-logs-module/audit-logs-module.styles';
import { OneTimeSecret } from '../one-time-secret';
import { useApiKeysCard } from './api-keys-card.hook';
import type {
  TApiKeysCardConfig,
  TApiKeysTableConfig,
} from './api-keys-card.types';
import { NewApiKeyDialog } from './new-api-key-dialog';

const ApiKeysTable = ({ rows, onRevoke }: TApiKeysTableConfig) => (
  <div
    role="region"
    aria-label="Chaves de API"
    tabIndex={0}
    className={PANEL_TABLE_WRAPPER_CLASS}
  >
    <table className={cn(PANEL_TABLE_CLASS, 'min-w-[560px]')}>
      <thead>
        <tr>
          <th scope="col" className={PANEL_HEAD_CELL_CLASS}>
            Nome
          </th>
          <th scope="col" className={PANEL_HEAD_CELL_CLASS}>
            Começa com
          </th>
          <th scope="col" className={cn(PANEL_HEAD_CELL_CLASS, 'text-right')}>
            Criada
          </th>
          <th scope="col" className={cn(PANEL_HEAD_CELL_CLASS, 'text-right')}>
            Último uso
          </th>
          <th scope="col" className={PANEL_HEAD_CELL_CLASS}>
            <span className="sr-only">Ações</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr
            key={row.id}
            className={cn('group', row.isRevoked && 'text-[#5F5C6E]')}
          >
            <td className={PANEL_CELL_CLASS}>
              <b className="break-words">{row.name}</b>
            </td>
            <td className={PANEL_CELL_CLASS}>
              <code className={PANEL_CODE_CLASS}>{row.prefix}</code>
            </td>
            <td className={cn(PANEL_CELL_CLASS, PANEL_NUMBER_CLASS)}>
              {row.createdAt}
            </td>
            <td className={cn(PANEL_CELL_CLASS, PANEL_NUMBER_CLASS)}>
              {row.lastUsed}
            </td>
            <td className={cn(PANEL_CELL_CLASS, 'text-right')}>
              {row.isRevoked ? (
                <span
                  className={cn(
                    PANEL_CHIP_CLASS,
                    PANEL_CHIP_TONE_CLASS.neutral,
                  )}
                >
                  Revogada
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onRevoke(row)}
                  aria-label={`Revogar a chave ${row.name}`}
                  className={cn(
                    PANEL_DANGER_BUTTON_CLASS,
                    PANEL_SMALL_BUTTON_CLASS,
                  )}
                >
                  Revogar
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const ApiKeysCard = ({ storeId }: TApiKeysCardConfig) => {
  const {
    rows,
    isLoading,
    isError,
    isRetrying,
    handleRetry,
    isNewKeyOpen,
    setIsNewKeyOpen,
    createdKey,
    handleKeyCreated,
    dismissCreatedKey,
    pendingRevoke,
    setPendingRevoke,
    handleRevokeOpenChange,
    handleConfirmRevoke,
    isRevoking,
  } = useApiKeysCard({ storeId });

  const renderContent = () => {
    if (isLoading) {
      return (
        <div
          role="status"
          aria-label="Carregando chaves"
          className="grid gap-2"
        >
          <Skeleton className="h-12 w-full rounded-2xl bg-[#F0EEF4]" />
          <Skeleton className="h-12 w-full rounded-2xl bg-[#F0EEF4]" />
        </div>
      );
    }
    if (isError) {
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
          icon={KeyRound}
          headingLevel="h3"
          title="Nenhuma chave ainda"
          description="Crie uma chave para o site da loja ou outro sistema usar a API."
        />
      );
    }

    return <ApiKeysTable rows={rows} onRevoke={setPendingRevoke} />;
  };

  return (
    <>
      <div className={PANEL_CARD_CLASS}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-[1_1_240px]">
            <h3 className={PANEL_CARD_TITLE_CLASS}>Chaves de API</h3>
            <p className={PANEL_TEXT_CLASS}>
              Para o site da loja ou outro sistema ler a agenda e criar
              agendamentos. Cada chave enxerga só esta loja.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsNewKeyOpen(true)}
            className={cn(PANEL_BUTTON_CLASS, PANEL_SMALL_BUTTON_CLASS)}
          >
            <Plus aria-hidden="true" className={PANEL_BUTTON_ICON_CLASS} />
            Nova chave
          </button>
        </div>

        {renderContent()}
      </div>

      {createdKey ? (
        <OneTimeSecret
          title="Chave criada"
          value={createdKey.key}
          onDismiss={dismissCreatedKey}
          warning={
            <>
              <b>Copie agora.</b> Por segurança ela não aparece de novo; se
              perder, revogue e crie outra.
            </>
          }
        >
          <p className={PANEL_TEXT_CLASS}>
            Envie no cabeçalho{' '}
            <code className={PANEL_CODE_CLASS}>Authorization: Bearer</code> ou{' '}
            <code className={PANEL_CODE_CLASS}>X-Api-Key</code>.
          </p>
        </OneTimeSecret>
      ) : null}

      <NewApiKeyDialog
        storeId={storeId}
        isOpen={isNewKeyOpen}
        onOpenChange={setIsNewKeyOpen}
        onCreated={handleKeyCreated}
      />

      <AlertDialog open={!!pendingRevoke} onOpenChange={handleRevokeOpenChange}>
        <AlertDialogContent className={MODULE_DIALOG_CLASS}>
          <AlertDialogHeader className="text-left">
            <AlertDialogTitle className={MODULE_DIALOG_TITLE_CLASS}>
              Revogar a chave {pendingRevoke?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription className={MODULE_DIALOG_TEXT_CLASS}>
              Quem usa esta chave perde o acesso na hora. Não dá para desfazer:
              a integração vai precisar de uma chave nova.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-2.5">
            <AlertDialogCancel
              disabled={isRevoking}
              className={MODULE_DIALOG_CANCEL_CLASS}
            >
              Voltar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isRevoking}
              onClick={(event) => {
                event.preventDefault();
                handleConfirmRevoke();
              }}
              className={MODULE_DIALOG_DANGER_CLASS}
            >
              {isRevoking ? 'Revogando...' : 'Revogar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
