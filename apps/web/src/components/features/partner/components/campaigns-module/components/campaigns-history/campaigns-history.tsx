'use client';

import { PARTNER_FOCUS_CLASS } from '@/components/features/partner/partner.styles';
import { cn, Skeleton } from '@repo/ui';
import { ModuleErrorState } from '../../../notifications-module/components/module-state';
import {
  getRetentionChipClass,
  RETENTION_CAPTION_CLASS,
  RETENTION_NUMBER_CLASS,
  RETENTION_TABLE_CLASS,
  RETENTION_TABLE_WRAP_CLASS,
  RETENTION_TD_CLASS,
  RETENTION_TEXT_CLASS,
  RETENTION_TH_CLASS,
} from '../../../packages-module/packages-module.styles';
import { CampaignDetailDialog } from './campaign-detail-dialog';
import { useCampaignsHistory } from './campaigns-history.hook';
import type { TCampaignsHistoryConfig } from './campaigns-history.types';

const NAME_BUTTON_CLASS = cn(
  'cursor-pointer text-left font-bold underline-offset-[3px] hover:underline',
  PARTNER_FOCUS_CLASS,
);

export const CampaignsHistory = (config: TCampaignsHistoryConfig) => {
  const {
    rows,
    isLoading,
    isError,
    isRetrying,
    handleRetry,
    openCampaignId,
    handleOpenCampaign,
    handleDetailOpenChange,
  } = useCampaignsHistory(config);

  const renderBody = () => {
    if (isLoading) {
      return (
        <Skeleton
          role="status"
          aria-label="Carregando campanhas"
          className="h-[140px] rounded-[20px] bg-[#F0EEF4]"
        />
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
        <p className={RETENTION_TEXT_CLASS}>
          Nenhuma campanha enviada ainda. As próximas aparecem aqui, com o
          andamento de cada envio.
        </p>
      );
    }

    return (
      <div className={RETENTION_TABLE_WRAP_CLASS}>
        <table className={RETENTION_TABLE_CLASS}>
          <caption className="sr-only">Campanhas enviadas</caption>
          <thead>
            <tr>
              <th scope="col" className={RETENTION_TH_CLASS}>
                Campanha
              </th>
              <th scope="col" className={cn(RETENTION_TH_CLASS, 'text-right')}>
                Data
              </th>
              <th scope="col" className={cn(RETENTION_TH_CLASS, 'text-right')}>
                Enviadas
              </th>
              <th scope="col" className={cn(RETENTION_TH_CLASS, 'text-right')}>
                Falhas
              </th>
              <th scope="col" className={RETENTION_TH_CLASS}>
                Situação
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td className={RETENTION_TD_CLASS}>
                  <button
                    type="button"
                    onClick={() => handleOpenCampaign(row.id)}
                    className={NAME_BUTTON_CLASS}
                  >
                    {row.name}
                    <span className="sr-only">: ver envios</span>
                  </button>
                  <span className="block text-[13px] text-[#5F5C6E]">
                    {row.channel}
                  </span>
                </td>
                <td className={cn(RETENTION_TD_CLASS, RETENTION_NUMBER_CLASS)}>
                  {row.date}
                </td>
                <td className={cn(RETENTION_TD_CLASS, RETENTION_NUMBER_CLASS)}>
                  {row.sent}
                </td>
                <td className={cn(RETENTION_TD_CLASS, RETENTION_NUMBER_CLASS)}>
                  {row.failed}
                </td>
                <td className={RETENTION_TD_CLASS}>
                  <span className={getRetentionChipClass(row.chip.tone)}>
                    {row.chip.label}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <section aria-labelledby="campaigns-history-title" className="grid gap-3">
      <h3
        id="campaigns-history-title"
        className={cn(RETENTION_CAPTION_CLASS, 'mt-3')}
      >
        Campanhas enviadas
      </h3>
      {renderBody()}
      <CampaignDetailDialog
        storeId={config.storeId}
        timeZone={config.timeZone}
        campaignId={openCampaignId}
        onOpenChange={handleDetailOpenChange}
      />
    </section>
  );
};
