import {
  cn,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui';
import { PARTNER_PORTAL_CLASS } from '../../../../../partner.styles';
import {
  AUDIT_ALL_OPTION,
  AUDIT_AREA_OPTIONS,
} from '../../../audit-logs-module.helpers';
import {
  PANEL_FIELD_CLASS,
  PANEL_FIELD_LABEL_CLASS,
  PANEL_SELECT_TRIGGER_CLASS,
  PANEL_TEXT_CLASS,
} from '../../../audit-logs-module.styles';
import type { TAuditLogsFiltersConfig } from '../audit-logs-board.types';

const FIELD_CLASS = cn(
  PANEL_FIELD_LABEL_CLASS,
  'min-w-0 flex-[1_1_160px] sm:max-w-[220px]',
);

export const AuditLogsFilters = ({
  from,
  to,
  onFromChange,
  onToChange,
  area,
  onAreaChange,
  actorOptions,
  actor = AUDIT_ALL_OPTION,
  onActorChange,
  rangeHint,
}: TAuditLogsFiltersConfig) => (
  <div className="grid gap-2">
    <div
      role="group"
      aria-label="Filtros do histórico"
      className="flex flex-wrap items-end gap-2.5"
    >
      <label className={FIELD_CLASS}>
        De
        <Input
          type="date"
          value={from}
          max={to || undefined}
          onChange={(event) => onFromChange(event.target.value)}
          className={PANEL_FIELD_CLASS}
        />
      </label>
      <label className={FIELD_CLASS}>
        Até
        <Input
          type="date"
          value={to}
          min={from || undefined}
          onChange={(event) => onToChange(event.target.value)}
          className={PANEL_FIELD_CLASS}
        />
      </label>

      {actorOptions && onActorChange ? (
        <div className={FIELD_CLASS}>
          <span id="audit-filter-actor">Pessoa</span>
          <Select value={actor} onValueChange={onActorChange}>
            <SelectTrigger
              aria-labelledby="audit-filter-actor"
              className={PANEL_SELECT_TRIGGER_CLASS}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className={PARTNER_PORTAL_CLASS}>
              <SelectItem value={AUDIT_ALL_OPTION}>Todas</SelectItem>
              {actorOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <div className={FIELD_CLASS}>
        <span id="audit-filter-area">Área</span>
        <Select value={area} onValueChange={onAreaChange}>
          <SelectTrigger
            aria-labelledby="audit-filter-area"
            className={PANEL_SELECT_TRIGGER_CLASS}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className={PARTNER_PORTAL_CLASS}>
            {AUDIT_AREA_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>

    {rangeHint ? (
      <p role="status" className={PANEL_TEXT_CLASS}>
        {rangeHint}
      </p>
    ) : null}
  </div>
);
