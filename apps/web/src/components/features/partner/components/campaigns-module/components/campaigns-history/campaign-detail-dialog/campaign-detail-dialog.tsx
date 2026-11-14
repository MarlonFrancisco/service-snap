'use client';

import {
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Skeleton,
} from '@repo/ui';
import {
  getRetentionChipClass,
  RETENTION_BUTTON_CLASS,
  RETENTION_DIALOG_CLASS,
  RETENTION_DIALOG_TITLE_CLASS,
  RETENTION_SMALL_BUTTON_CLASS,
  RETENTION_TABLE_CLASS,
  RETENTION_TABLE_WRAP_CLASS,
  RETENTION_TD_CLASS,
  RETENTION_TEXT_CLASS,
  RETENTION_TH_CLASS,
} from '../../../../packages-module/packages-module.styles';
import { useCampaignDetailDialog } from './campaign-detail-dialog.hook';
import type { TCampaignDetailDialogConfig } from './campaign-detail-dialog.types';

export const CampaignDetailDialog = (config: TCampaignDetailDialogConfig) => {
  const {
    isOpen,
    title,
    summary,
    templateName,
    message,
    recipients,
    isLoading,
    isError,
    handleRetry,
  } = useCampaignDetailDialog(config);

  const renderBody = () => {
    if (isLoading) {
      return (
        <Skeleton
          role="status"
          aria-label="Carregando envios"
          className="h-[180px] rounded-[20px] bg-[#F0EEF4]"
        />
      );
    }
    if (isError) {
      return (
        <div role="alert" className="grid justify-items-start gap-2.5">
          <p className={RETENTION_TEXT_CLASS}>
            Não foi possível carregar os envios.
          </p>
          <button
            type="button"
            onClick={handleRetry}
            className={cn(RETENTION_BUTTON_CLASS, RETENTION_SMALL_BUTTON_CLASS)}
          >
            Tentar novamente
          </button>
        </div>
      );
    }

    return (
      <>
        {templateName ? (
          <p className={RETENTION_TEXT_CLASS}>
            Template{' '}
            <code className="font-mono text-[13px]">{templateName}</code>
          </p>
        ) : null}
        {message ? (
          <p className="rounded-2xl bg-[#F7F6FA] px-4 py-3.5 text-sm leading-normal whitespace-pre-line text-[#2C2A36]">
            {message}
          </p>
        ) : null}
        <div className={RETENTION_TABLE_WRAP_CLASS}>
          <table className={RETENTION_TABLE_CLASS}>
            <caption className="sr-only">Situação de cada envio</caption>
            <thead>
              <tr>
                <th scope="col" className={RETENTION_TH_CLASS}>
                  Cliente
                </th>
                <th scope="col" className={RETENTION_TH_CLASS}>
                  Situação
                </th>
                <th scope="col" className={RETENTION_TH_CLASS}>
                  Detalhe
                </th>
              </tr>
            </thead>
            <tbody>
              {recipients.map((recipient) => (
                <tr key={recipient.id}>
                  <td className={RETENTION_TD_CLASS}>
                    <b className="break-words">{recipient.name}</b>
                  </td>
                  <td className={RETENTION_TD_CLASS}>
                    <span
                      className={getRetentionChipClass(recipient.chip.tone)}
                    >
                      {recipient.chip.label}
                    </span>
                  </td>
                  <td
                    className={cn(
                      RETENTION_TD_CLASS,
                      'text-[13px] break-words text-[#5F5C6E]',
                    )}
                  >
                    {recipient.detail}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={config.onOpenChange}>
      <DialogContent className={cn(RETENTION_DIALOG_CLASS, 'sm:max-w-[640px]')}>
        <DialogHeader className="text-left">
          <DialogTitle className={RETENTION_DIALOG_TITLE_CLASS}>
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-[#5F5C6E]">
            {summary || 'Andamento de cada envio'}
          </DialogDescription>
        </DialogHeader>
        {renderBody()}
      </DialogContent>
    </Dialog>
  );
};
