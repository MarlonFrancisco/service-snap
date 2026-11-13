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
import { ModuleErrorState } from '../../../../notifications-module/components/module-state';
import {
  MANAGEMENT_CAPTION_CLASS,
  MANAGEMENT_DIALOG_CLASS,
  MANAGEMENT_DIALOG_TITLE_CLASS,
  MANAGEMENT_MUTED_CLASS,
  MANAGEMENT_NOTE_CLASS,
  MANAGEMENT_SUMMARY_CLASS,
  MANAGEMENT_SUMMARY_ROW_CLASS,
  MANAGEMENT_SUMMARY_TOTAL_CLASS,
  MANAGEMENT_TEXT_CLASS,
  MANAGEMENT_WIDE_DIALOG_CLASS,
} from '../../../cash-module.styles';
import { CashPaymentsTable } from '../../cash-overview/cash-payments-table';
import { useCashSessionDialog } from './cash-session-dialog.hook';
import type {
  TCashSessionDetailRow,
  TCashSessionDialogConfig,
} from './cash-session-dialog.types';

const SummaryList = ({ rows }: { rows: TCashSessionDetailRow[] }) => (
  <dl className={MANAGEMENT_SUMMARY_CLASS}>
    {rows.map((row) => (
      <div
        key={row.label}
        className={cn(
          MANAGEMENT_SUMMARY_ROW_CLASS,
          row.isTotal && MANAGEMENT_SUMMARY_TOTAL_CLASS,
        )}
      >
        <dt className={row.isTotal ? undefined : MANAGEMENT_MUTED_CLASS}>
          {row.label}
        </dt>
        <dd className="text-right font-semibold tabular-nums">{row.value}</dd>
      </div>
    ))}
  </dl>
);

export const CashSessionDialog = ({
  onClose,
  ...config
}: TCashSessionDialogConfig) => {
  const {
    title,
    people,
    notes,
    cashRows,
    methodRows,
    paymentRows,
    isLoading,
    isError,
    handleRetry,
  } = useCashSessionDialog(config);

  const renderBody = () => {
    if (isLoading) {
      return (
        <div
          role="status"
          aria-label="Carregando o caixa"
          className="grid gap-3"
        >
          <Skeleton className="h-28 rounded-2xl bg-[#F0EEF4]" />
          <Skeleton className="h-40 rounded-2xl bg-[#F0EEF4]" />
        </div>
      );
    }
    if (isError) {
      return <ModuleErrorState headingLevel="h3" onRetry={handleRetry} />;
    }

    return (
      <>
        <div className="grid gap-5 sm:grid-cols-2">
          <SummaryList rows={cashRows} />
          <SummaryList rows={methodRows} />
        </div>

        {notes ? (
          <div className={MANAGEMENT_NOTE_CLASS}>
            <p>
              <b className="block text-[#0B0B0F]">Observação</b>
              {notes}
            </p>
          </div>
        ) : null}

        <h3 className={MANAGEMENT_CAPTION_CLASS}>Pagamentos</h3>
        {paymentRows.length ? (
          <CashPaymentsTable
            rows={paymentRows}
            label="Pagamentos deste caixa"
          />
        ) : (
          <p className={MANAGEMENT_TEXT_CLASS}>
            Nenhum pagamento entrou neste caixa.
          </p>
        )}
      </>
    );
  };

  return (
    <Dialog
      open={!!config.sessionId}
      onOpenChange={(isOpen) => (isOpen ? undefined : onClose())}
    >
      <DialogContent
        className={cn(MANAGEMENT_DIALOG_CLASS, MANAGEMENT_WIDE_DIALOG_CLASS)}
      >
        <DialogHeader className="text-left">
          <DialogTitle className={MANAGEMENT_DIALOG_TITLE_CLASS}>
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-[#5F5C6E]">
            {people || 'Totais e pagamentos do caixa'}
          </DialogDescription>
        </DialogHeader>
        {renderBody()}
      </DialogContent>
    </Dialog>
  );
};
