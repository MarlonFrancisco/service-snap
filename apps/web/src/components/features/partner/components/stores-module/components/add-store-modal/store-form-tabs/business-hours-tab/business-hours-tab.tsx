import { Switch, TabsContent } from '@repo/ui';
import {
  STORES_FIELDSET_CLASS,
  STORES_LEGEND_CLASS,
  STORES_TAB_PANEL_CLASS,
  STORES_TWO_COLUMNS_CLASS,
} from '../../../../stores-module.styles';
import { StoreTextField } from '../store-text-field';
import { useBusinessHoursTab } from './business-hours-tab.hook';

export const BusinessHoursTab = () => {
  const { days, handleDayToggle } = useBusinessHoursTab();

  return (
    <TabsContent value="hours" className={STORES_TAB_PANEL_CLASS}>
      <fieldset className={STORES_FIELDSET_CLASS}>
        <legend className={STORES_LEGEND_CLASS}>
          Horário de funcionamento
        </legend>
        <div className={STORES_TWO_COLUMNS_CLASS}>
          <StoreTextField name="openTime" label="Abertura *" type="time" />
          <StoreTextField name="closeTime" label="Fechamento *" type="time" />
        </div>
      </fieldset>

      <fieldset className={STORES_FIELDSET_CLASS}>
        <legend className={STORES_LEGEND_CLASS}>
          Horário de almoço (opcional)
        </legend>
        <div className={STORES_TWO_COLUMNS_CLASS}>
          <StoreTextField name="lunchStartTime" label="Início" type="time" />
          <StoreTextField name="lunchEndTime" label="Fim" type="time" />
        </div>
      </fieldset>

      <fieldset className={STORES_FIELDSET_CLASS}>
        <legend className={STORES_LEGEND_CLASS}>Dias de funcionamento</legend>
        <div className="grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-2">
          {days.map((day) => (
            <label
              key={day.key}
              className="flex min-h-12 cursor-pointer items-center justify-between rounded-[14px] bg-[#F7F6FA] px-3.5 text-sm font-semibold"
            >
              {day.label}
              <Switch
                checked={day.isOpen}
                onCheckedChange={() => handleDayToggle(day.key)}
                className="data-[state=checked]:bg-[#0B0B0F]"
              />
            </label>
          ))}
        </div>
      </fieldset>
    </TabsContent>
  );
};
