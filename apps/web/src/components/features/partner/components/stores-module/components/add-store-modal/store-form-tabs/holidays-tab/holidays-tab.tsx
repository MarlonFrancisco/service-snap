import { PARTNER_FOCUS_CLASS } from '@/components/features/partner/partner.styles';
import { cn, Input, Label, Skeleton, Spinner, TabsContent } from '@repo/ui';
import { AlertCircle, AlertTriangle, Trash2 } from 'lucide-react';
import {
  STORES_COMPACT_PRIMARY_BUTTON_CLASS,
  STORES_FIELD_CLASS,
  STORES_FIELDSET_CLASS,
  STORES_LABEL_CLASS,
  STORES_LEGEND_CLASS,
  STORES_TAB_PANEL_CLASS,
} from '../../../../stores-module.styles';
import { StatePanel } from '../../../state-panel';
import { useHolidaysTab } from './holidays-tab.hook';

const DATE_INPUT_ID = 'store-holiday-date';
const DATE_ERROR_ID = 'store-holiday-date-error';
const NAME_INPUT_ID = 'store-holiday-name';

export const HolidaysTab = () => {
  const {
    draft,
    dateError,
    minDate,
    groups,
    isEmpty,
    isLoading,
    isError,
    isAdding,
    removingId,
    refetchHolidays,
    handleDateChange,
    handleNameChange,
    handleAdd,
    handleInputKeyDown,
    handleRemove,
  } = useHolidaysTab();

  return (
    <TabsContent
      value="holidays"
      className={cn(
        STORES_TAB_PANEL_CLASS,
        'items-start gap-7 lg:grid-cols-[340px_minmax(0,1fr)]',
      )}
    >
      <div className="grid content-start gap-[18px]">
        <fieldset className={STORES_FIELDSET_CLASS}>
          <legend className={STORES_LEGEND_CLASS}>Adicionar dia fechado</legend>

          <div className="grid gap-1.5">
            <Label htmlFor={DATE_INPUT_ID} className={STORES_LABEL_CLASS}>
              Data
            </Label>
            <Input
              id={DATE_INPUT_ID}
              type="date"
              min={minDate}
              value={draft.date}
              aria-invalid={!!dateError}
              aria-describedby={dateError ? DATE_ERROR_ID : undefined}
              onChange={(event) => handleDateChange(event.target.value)}
              onKeyDown={handleInputKeyDown}
              className={cn(
                STORES_FIELD_CLASS,
                dateError && 'border-[1.5px] border-[#A4231A]',
              )}
            />
            {dateError ? (
              <span
                id={DATE_ERROR_ID}
                role="alert"
                className="flex items-center gap-1.5 text-[13px] font-semibold text-[#A4231A]"
              >
                <AlertCircle aria-hidden="true" className="size-4 shrink-0" />
                {dateError}
              </span>
            ) : null}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor={NAME_INPUT_ID} className={STORES_LABEL_CLASS}>
              Nome{' '}
              <span className="font-medium text-[#5F5C6E]">(opcional)</span>
            </Label>
            <Input
              id={NAME_INPUT_ID}
              type="text"
              maxLength={100}
              placeholder="Ex.: Natal"
              value={draft.name}
              onChange={(event) => handleNameChange(event.target.value)}
              onKeyDown={handleInputKeyDown}
              className={STORES_FIELD_CLASS}
            />
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={isAdding}
            className={cn(STORES_COMPACT_PRIMARY_BUTTON_CLASS, 'min-h-12 text-sm')}
          >
            {isAdding ? (
              <>
                <Spinner />
                Adicionando...
              </>
            ) : (
              'Adicionar'
            )}
          </button>
        </fieldset>

        <p className="rounded-[14px] bg-[#F7F6FA] px-3.5 py-3 text-[13px] leading-normal">
          Nesses dias a loja não aparece com horários para agendar, nem no site
          nem no WhatsApp.
        </p>
      </div>

      <section aria-label="Próximos dias fechados" className="min-w-0">
        <h3 className={STORES_LEGEND_CLASS}>Próximos dias fechados</h3>

        {isLoading ? (
          <div className="grid gap-2" role="status" aria-label="Carregando feriados">
            <Skeleton className="h-16 rounded-[20px] bg-[#EBE9F0]" />
            <Skeleton className="h-16 rounded-[20px] bg-[#EBE9F0]" />
          </div>
        ) : isError ? (
          <StatePanel
            tone="error"
            icon={AlertTriangle}
            title="Não foi possível carregar os feriados"
            description="Verifique a conexão e tente de novo."
            actionLabel="Tentar novamente"
            onAction={() => void refetchHolidays()}
          />
        ) : isEmpty ? (
          <div
            role="status"
            className="grid gap-1 rounded-[20px] bg-[#F7F6FA] p-[18px] text-[13px] leading-normal text-[#5F5C6E]"
          >
            <b className="text-sm text-[#0B0B0F]">Nenhum feriado cadastrado</b>
            Adicione os dias em que a loja fica fechada inteira.
          </div>
        ) : (
          <div className="grid gap-3">
            {groups.map((group) => (
              <div key={group.year} className="grid gap-2">
                <p className="text-[13px] font-bold text-[#5F5C6E]">
                  {group.year}
                </p>
                <ul className="grid gap-2">
                  {group.items.map((holiday) => (
                    <li
                      key={holiday.id}
                      className="flex min-h-16 items-center gap-3.5 rounded-[20px] border border-[#EBE9F0] py-2 pr-2 pl-4"
                    >
                      <span
                        aria-hidden="true"
                        className="grid size-12 shrink-0 place-content-center rounded-[14px] bg-[#F4F3F7] text-center text-[17px] leading-none font-extrabold"
                      >
                        {holiday.dayLabel}
                        <span className="block text-[11px] font-bold tracking-[0.04em] text-[#5F5C6E] uppercase">
                          {holiday.monthShortLabel}
                        </span>
                      </span>
                      <div className="min-w-0 flex-1">
                        <b className="block text-[15px]">{holiday.dateLabel}</b>
                        <span className="block truncate text-[13px] text-[#5F5C6E]">
                          {holiday.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        aria-label={holiday.removeLabel}
                        disabled={removingId === holiday.id}
                        onClick={() => handleRemove(holiday.id)}
                        className={cn(
                          'grid size-11 shrink-0 place-items-center rounded-full text-[#A4231A] transition-colors hover:bg-[#FBE8E6] disabled:opacity-50',
                          PARTNER_FOCUS_CLASS,
                        )}
                      >
                        {removingId === holiday.id ? (
                          <Spinner />
                        ) : (
                          <Trash2 aria-hidden="true" className="size-[18px] stroke-[1.8]" />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </TabsContent>
  );
};
