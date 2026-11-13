'use client';

import {
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Spinner,
} from '@repo/ui';
import { Info } from 'lucide-react';
import {
  MANAGEMENT_ACTIONS_CLASS,
  MANAGEMENT_BUTTON_CLASS,
  MANAGEMENT_DIALOG_CLASS,
  MANAGEMENT_DIALOG_TITLE_CLASS,
  MANAGEMENT_ERROR_CLASS,
  MANAGEMENT_FIELD_CLASS,
  MANAGEMENT_FIELD_HINT_CLASS,
  MANAGEMENT_FIELD_LABEL_CLASS,
  MANAGEMENT_MUTED_CLASS,
  MANAGEMENT_NOTE_CLASS,
  MANAGEMENT_NOTE_ICON_CLASS,
  MANAGEMENT_NOTE_TONE,
  MANAGEMENT_PRIMARY_BUTTON_CLASS,
  MANAGEMENT_SUMMARY_CLASS,
  MANAGEMENT_SUMMARY_ROW_CLASS,
  MANAGEMENT_SUMMARY_TOTAL_CLASS,
  MANAGEMENT_TEXTAREA_CLASS,
} from '../../../cash-module.styles';
import { useCloseCashDialog } from './close-cash-dialog.hook';
import { MAX_CLOSE_NOTES_LENGTH } from './close-cash-dialog.schema';
import type { TCloseCashDialogConfig } from './close-cash-dialog.types';

const VALUE_CLASS = 'text-right font-semibold tabular-nums';

export const CloseCashDialog = (config: TCloseCashDialogConfig) => {
  const {
    form,
    errors,
    summary,
    difference,
    submitError,
    isSubmitting,
    handleOpenChange,
    handleSubmit,
  } = useCloseCashDialog(config);

  return (
    <Dialog open={config.isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className={MANAGEMENT_DIALOG_CLASS}>
        <DialogHeader className="text-left">
          <DialogTitle className={MANAGEMENT_DIALOG_TITLE_CLASS}>
            Fechar caixa
          </DialogTitle>
          <DialogDescription className="sr-only">
            Conte o dinheiro da gaveta e confira a diferença para o esperado.
          </DialogDescription>
        </DialogHeader>

        <form
          noValidate
          onSubmit={handleSubmit}
          aria-label="Fechar caixa"
          className="grid gap-4"
        >
          <dl className={MANAGEMENT_SUMMARY_CLASS}>
            <div className={MANAGEMENT_SUMMARY_ROW_CLASS}>
              <dt className={MANAGEMENT_MUTED_CLASS}>Troco inicial</dt>
              <dd className={VALUE_CLASS}>{summary.openingAmount}</dd>
            </div>
            <div className={MANAGEMENT_SUMMARY_ROW_CLASS}>
              <dt className={MANAGEMENT_MUTED_CLASS}>Recebido em dinheiro</dt>
              <dd className={VALUE_CLASS}>{summary.cashReceived}</dd>
            </div>
            <div
              className={cn(
                MANAGEMENT_SUMMARY_ROW_CLASS,
                MANAGEMENT_SUMMARY_TOTAL_CLASS,
              )}
            >
              <dt>Esperado na gaveta</dt>
              <dd className="text-right tabular-nums">
                {summary.expectedCash}
              </dd>
            </div>
          </dl>

          <label className={MANAGEMENT_FIELD_LABEL_CLASS}>
            Dinheiro contado
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder={summary.expectedCash}
              aria-invalid={!!errors.countedCash || undefined}
              aria-describedby={difference ? 'cash-difference' : undefined}
              className={MANAGEMENT_FIELD_CLASS}
              {...form.register('countedCash')}
            />
          </label>
          {errors.countedCash ? (
            <p role="alert" className={MANAGEMENT_ERROR_CLASS}>
              {errors.countedCash.message}
            </p>
          ) : null}

          {difference ? (
            <div
              id="cash-difference"
              role="status"
              className={cn(
                MANAGEMENT_NOTE_CLASS,
                MANAGEMENT_NOTE_TONE[difference.tone],
              )}
            >
              <Info aria-hidden="true" className={MANAGEMENT_NOTE_ICON_CLASS} />
              <p>
                <b className="block">{difference.title}</b>
                {difference.description}
              </p>
            </div>
          ) : null}

          <label className={MANAGEMENT_FIELD_LABEL_CLASS}>
            <span>
              Observação{' '}
              <span className={MANAGEMENT_FIELD_HINT_CLASS}>Opcional</span>
            </span>
            <textarea
              maxLength={MAX_CLOSE_NOTES_LENGTH}
              placeholder="Ex.: troco dado a mais"
              aria-invalid={!!errors.notes || undefined}
              className={MANAGEMENT_TEXTAREA_CLASS}
              {...form.register('notes')}
            />
          </label>
          {errors.notes ? (
            <p role="alert" className={MANAGEMENT_ERROR_CLASS}>
              {errors.notes.message}
            </p>
          ) : null}

          <dl className={MANAGEMENT_SUMMARY_CLASS}>
            <div className={MANAGEMENT_SUMMARY_ROW_CLASS}>
              <dt className={MANAGEMENT_MUTED_CLASS}>PIX</dt>
              <dd className={VALUE_CLASS}>{summary.pix}</dd>
            </div>
            <div className={MANAGEMENT_SUMMARY_ROW_CLASS}>
              <dt className={MANAGEMENT_MUTED_CLASS}>Cartões</dt>
              <dd className={VALUE_CLASS}>{summary.cards}</dd>
            </div>
            <div className={MANAGEMENT_SUMMARY_ROW_CLASS}>
              <dt className={MANAGEMENT_MUTED_CLASS}>Outro</dt>
              <dd className={VALUE_CLASS}>{summary.other}</dd>
            </div>
          </dl>

          {submitError ? (
            <p role="alert" className={MANAGEMENT_ERROR_CLASS}>
              {submitError}
            </p>
          ) : null}

          <div className={cn(MANAGEMENT_ACTIONS_CLASS, 'justify-end')}>
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
              className={MANAGEMENT_BUTTON_CLASS}
            >
              Voltar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={MANAGEMENT_PRIMARY_BUTTON_CLASS}
            >
              {isSubmitting ? <Spinner className="size-4" /> : null}
              Fechar caixa
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
