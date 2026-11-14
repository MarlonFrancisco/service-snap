'use client';

import {
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  Skeleton,
  Spinner,
  useIsMobile,
} from '@repo/ui';
import { Lock } from 'lucide-react';
import {
  CUSTOMERS_BUTTON_CLASS,
  CUSTOMERS_DIALOG_CLASS,
  CUSTOMERS_DIALOG_TITLE_CLASS,
  CUSTOMERS_SMALL_BUTTON_CLASS,
} from '../../../../customers-module/customers-module.styles';
import { PARTNER_PORTAL_CLASS } from '../../../../../partner.styles';
import {
  ANAMNESIS_CHIP_CLASS,
  ANAMNESIS_CHIP_TONE,
  ANAMNESIS_DANGER_BUTTON_CLASS,
  ANAMNESIS_LOCK_NOTE_CLASS,
  ANAMNESIS_NOTE_ICON_CLASS,
  ANAMNESIS_TEXT_CLASS,
} from '../../../anamnesis-module.styles';
import { useAnamnesisResponseDialog } from './anamnesis-response-dialog.hook';
import type { TAnamnesisResponseDialogConfig } from './anamnesis-response-dialog.types';

const DESCRIPTION =
  'Respostas da ficha de anamnese do cliente. A leitura fica no histórico da loja.';

/** Leitura protegida de uma ficha, com a exclusão a pedido do cliente. */
export const AnamnesisResponseDialog = (
  config: TAnamnesisResponseDialogConfig,
) => {
  const isMobile = useIsMobile();
  const {
    isOpen,
    title,
    consentLabel,
    contextLine,
    auditLine,
    answers,
    isLoading,
    isForbidden,
    isNotFound,
    isError,
    handleRetry,
    isConfirmingDelete,
    handleRequestDelete,
    handleDismissDelete,
    handleDelete,
    isDeleting,
  } = useAnamnesisResponseDialog(config);

  const renderBody = () => {
    if (isForbidden) {
      return (
        <div className={ANAMNESIS_LOCK_NOTE_CLASS}>
          <Lock aria-hidden="true" className={ANAMNESIS_NOTE_ICON_CLASS} />
          <p>
            <b className="block text-[#3B2A6B]">Ficha protegida</b>
            Só dono, gerente e o profissional deste atendimento abrem as
            respostas.
          </p>
        </div>
      );
    }
    if (isNotFound) {
      return (
        <p className={ANAMNESIS_TEXT_CLASS}>
          Esta ficha não existe mais. Ela pode ter sido apagada a pedido do
          cliente.
        </p>
      );
    }
    if (isError) {
      return (
        <div role="alert" className="grid gap-3">
          <p className={ANAMNESIS_TEXT_CLASS}>
            Não foi possível abrir a ficha.
          </p>
          <button
            type="button"
            onClick={handleRetry}
            className={cn(
              CUSTOMERS_BUTTON_CLASS,
              CUSTOMERS_SMALL_BUTTON_CLASS,
              'justify-self-start',
            )}
          >
            Tentar de novo
          </button>
        </div>
      );
    }
    if (isLoading) {
      return (
        <div role="status" aria-label="Abrindo a ficha" className="grid gap-3">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton
              key={index}
              className="h-12 rounded-[14px] bg-[#F0EEF4]"
            />
          ))}
        </div>
      );
    }

    return (
      <>
        {consentLabel ? (
          <span
            className={cn(
              ANAMNESIS_CHIP_CLASS,
              ANAMNESIS_CHIP_TONE.ok,
              'self-start',
            )}
          >
            {consentLabel}
          </span>
        ) : null}
        {contextLine ? (
          <p className={ANAMNESIS_TEXT_CLASS}>{contextLine}</p>
        ) : null}
        {auditLine ? (
          <div className={ANAMNESIS_LOCK_NOTE_CLASS}>
            <Lock aria-hidden="true" className={ANAMNESIS_NOTE_ICON_CLASS} />
            <p>{auditLine}</p>
          </div>
        ) : null}

        <dl className="m-0">
          {answers.map((answer) => (
            <div
              key={answer.id}
              className="grid gap-1 border-b border-[#F0EEF4] py-3"
            >
              <dt className="text-[13px] text-[#5F5C6E]">{answer.label}</dt>
              <dd
                className={cn(
                  'm-0 text-[15px] font-bold break-words whitespace-pre-line',
                  answer.isEmpty && 'font-semibold text-[#5F5C6E]',
                )}
              >
                {answer.answer}
              </dd>
            </div>
          ))}
        </dl>

        {config.canDelete && !isConfirmingDelete ? (
          <button
            type="button"
            onClick={handleRequestDelete}
            className={cn(
              CUSTOMERS_BUTTON_CLASS,
              CUSTOMERS_SMALL_BUTTON_CLASS,
              ANAMNESIS_DANGER_BUTTON_CLASS,
              'self-start',
            )}
          >
            Apagar ficha a pedido do cliente
          </button>
        ) : null}

        {config.canDelete && isConfirmingDelete ? (
          <div
            role="alertdialog"
            aria-labelledby="anamnesis-delete-title"
            className="rounded-[14px] bg-[#F7F6FA] px-4 py-3.5 text-sm leading-normal"
          >
            <b id="anamnesis-delete-title" className="block">
              Apagar esta ficha?
            </b>
            As respostas saem da loja e não dá para desfazer.
            <div className="mt-2.5 flex flex-wrap gap-2.5">
              <button
                type="button"
                autoFocus
                onClick={handleDismissDelete}
                disabled={isDeleting}
                className={cn(
                  CUSTOMERS_BUTTON_CLASS,
                  CUSTOMERS_SMALL_BUTTON_CLASS,
                )}
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className={cn(
                  CUSTOMERS_BUTTON_CLASS,
                  CUSTOMERS_SMALL_BUTTON_CLASS,
                  ANAMNESIS_DANGER_BUTTON_CLASS,
                )}
              >
                {isDeleting ? (
                  <>
                    <Spinner />
                    Apagando...
                  </>
                ) : (
                  'Apagar ficha'
                )}
              </button>
            </div>
          </div>
        ) : null}
      </>
    );
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) config.onClose();
  };

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={handleOpenChange}>
        <DrawerContent className={cn(PARTNER_PORTAL_CLASS, 'max-h-[92dvh]')}>
          <div className="flex flex-col gap-4 overflow-y-auto px-5 pt-2 pb-6">
            <DrawerTitle className={CUSTOMERS_DIALOG_TITLE_CLASS}>
              {title}
            </DrawerTitle>
            <DrawerDescription className="sr-only">
              {DESCRIPTION}
            </DrawerDescription>
            {renderBody()}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(CUSTOMERS_DIALOG_CLASS, 'flex flex-col sm:max-w-[640px]')}
      >
        <DialogTitle className={CUSTOMERS_DIALOG_TITLE_CLASS}>
          {title}
        </DialogTitle>
        <DialogDescription className="sr-only">{DESCRIPTION}</DialogDescription>
        {renderBody()}
      </DialogContent>
    </Dialog>
  );
};
