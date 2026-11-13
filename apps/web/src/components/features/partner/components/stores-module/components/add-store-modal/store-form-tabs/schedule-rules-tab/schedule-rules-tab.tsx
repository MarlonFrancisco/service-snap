import { cn, TabsContent } from '@repo/ui';
import { MessageSquare, Users } from 'lucide-react';
import {
  STORES_FIELDSET_CLASS,
  STORES_LEGEND_CLASS,
  STORES_TAB_PANEL_CLASS,
  STORES_TWO_COLUMNS_CLASS,
} from '../../../../stores-module.styles';
import { RuleNumberField } from './rule-number-field';
import { RuleSelectField } from './rule-select-field';
import {
  MAX_ADVANCE_DAYS_OPTIONS,
  MIN_ADVANCE_OPTIONS,
  SLOT_INTERVAL_OPTIONS,
} from './schedule-rules-tab.constants';
import {
  formatAdvanceLabel,
  formatDaysLabel,
  formatMinutesLabel,
} from './schedule-rules-tab.helpers';
import { useScheduleRulesTab } from './schedule-rules-tab.hook';

const PREVIEW_TITLE_ID = 'schedule-rules-preview-title';
const NOTE_CLASS = 'flex items-start gap-2.5 text-[13px] leading-normal';
const NOTE_ICON_CLASS = 'mt-px size-[18px] shrink-0 stroke-[1.8]';

export const ScheduleRulesTab = () => {
  const { preview } = useScheduleRulesTab();

  return (
    <TabsContent
      value="schedule"
      className={cn(
        STORES_TAB_PANEL_CLASS,
        'items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]',
      )}
    >
      <div className="grid min-w-0 gap-[22px]">
        <fieldset className={STORES_FIELDSET_CLASS}>
          <legend className={STORES_LEGEND_CLASS}>Horários oferecidos</legend>
          <div className={STORES_TWO_COLUMNS_CLASS}>
            <RuleSelectField
              name="slotIntervalMinutes"
              label="Tamanho do horário"
              hint="De quanto em quanto tempo os horários aparecem para o cliente."
              options={SLOT_INTERVAL_OPTIONS}
              formatValue={formatMinutesLabel}
            />
            <RuleNumberField
              name="bufferMinutes"
              label="Intervalo entre atendimentos"
              hint="Pausa entre um atendimento e outro do mesmo profissional. De 0 a 240 min."
              unit="min"
              min={0}
              max={240}
              step={5}
            />
          </div>
        </fieldset>

        <fieldset className={STORES_FIELDSET_CLASS}>
          <legend className={STORES_LEGEND_CLASS}>
            Quando o cliente pode marcar
          </legend>
          <div className={STORES_TWO_COLUMNS_CLASS}>
            <RuleSelectField
              name="minAdvanceMinutes"
              label="Antecedência mínima"
              hint="Quanto tempo antes do horário o cliente ainda consegue marcar."
              options={MIN_ADVANCE_OPTIONS}
              formatValue={formatAdvanceLabel}
            />
            <RuleSelectField
              name="maxAdvanceDays"
              label="Até quantos dias à frente"
              hint="Até onde a agenda fica aberta para o cliente."
              options={MAX_ADVANCE_DAYS_OPTIONS}
              formatValue={formatDaysLabel}
            />
          </div>
        </fieldset>

        <fieldset className={STORES_FIELDSET_CLASS}>
          <legend className={STORES_LEGEND_CLASS}>
            Cancelamento e remarcação
          </legend>
          <div className={STORES_TWO_COLUMNS_CLASS}>
            <RuleNumberField
              name="cancellationNoticeHours"
              label="Cancelar até"
              hint="Use 0 para permitir até o início do horário."
              unit="horas antes"
              min={0}
              max={720}
            />
            <RuleNumberField
              name="rescheduleNoticeHours"
              label="Remarcar até"
              hint="Use 0 para permitir até o início do horário."
              unit="horas antes"
              min={0}
              max={720}
            />
          </div>
        </fieldset>
      </div>

      <aside
        aria-labelledby={PREVIEW_TITLE_ID}
        className="grid gap-3 rounded-[24px] bg-[#F7F6FA] p-5"
      >
        <h3 id={PREVIEW_TITLE_ID} className={cn(STORES_LEGEND_CLASS, 'mb-0')}>
          Como o cliente vê
        </h3>
        <div
          aria-live="polite"
          className="grid gap-2 rounded-2xl border border-[#EBE9F0] bg-white p-4 text-[15px] leading-normal font-medium"
        >
          <p>{preview.booking}</p>
          <p>{preview.policy}</p>
        </div>
        <p className={cn(NOTE_CLASS, 'text-[#5F5C6E]')}>
          <MessageSquare aria-hidden="true" className={NOTE_ICON_CLASS} />
          Vale para o agendamento pelo site e pelo WhatsApp.
        </p>
        <p className={NOTE_CLASS}>
          <Users aria-hidden="true" className={NOTE_ICON_CLASS} />A sua equipe
          pode remarcar e encaixar a qualquer hora.
        </p>
      </aside>
    </TabsContent>
  );
};
