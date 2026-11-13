import { PARTNER_FOCUS_CLASS } from '@/components/features/partner/partner.styles';
import { cn } from '@repo/ui';
import { BellOff } from 'lucide-react';
import {
  getRetentionChipClass,
  RETENTION_CHECK_INPUT_CLASS,
  RETENTION_NUMBER_CLASS,
  RETENTION_TABLE_CLASS,
  RETENTION_TABLE_WRAP_CLASS,
  RETENTION_TD_CLASS,
  RETENTION_TH_CLASS,
} from '../../../packages-module/packages-module.styles';
import type { TInactiveCustomersTableConfig } from './inactive-customers-table.types';

const OPT_OUT_BUTTON_CLASS = cn(
  'grid size-11 cursor-pointer place-items-center rounded-full text-[#5F5C6E] transition-colors hover:bg-[#F4F3F7] hover:text-[#0B0B0F] disabled:cursor-not-allowed disabled:opacity-50',
  PARTNER_FOCUS_CLASS,
);

export const InactiveCustomersTable = ({
  rows,
  isRefreshing,
  areAllSelected,
  canToggleAll,
  onToggleAll,
  onToggle,
  onOptOut,
  optingOutId,
}: TInactiveCustomersTableConfig) => (
  <div
    aria-busy={isRefreshing || undefined}
    className={cn(RETENTION_TABLE_WRAP_CLASS, isRefreshing && 'opacity-70')}
  >
    <table className={RETENTION_TABLE_CLASS}>
      <caption className="sr-only">Clientes sem visita no período</caption>
      <thead>
        <tr>
          <th scope="col" className={cn(RETENTION_TH_CLASS, 'w-12')}>
            <label className="flex">
              <input
                type="checkbox"
                checked={areAllSelected}
                disabled={!canToggleAll}
                onChange={onToggleAll}
                className={RETENTION_CHECK_INPUT_CLASS}
              />
              <span className="sr-only">Incluir todos</span>
            </label>
          </th>
          <th scope="col" className={RETENTION_TH_CLASS}>
            Cliente
          </th>
          <th scope="col" className={cn(RETENTION_TH_CLASS, 'text-right')}>
            Última visita
          </th>
          <th scope="col" className={cn(RETENTION_TH_CLASS, 'text-right')}>
            Sumido há
          </th>
          <th scope="col" className={RETENTION_TH_CLASS}>
            Canal
          </th>
          <th scope="col" className={cn(RETENTION_TH_CLASS, 'w-14')}>
            <span className="sr-only">Pedido para não receber</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td className={RETENTION_TD_CLASS}>
              <label className="flex">
                <input
                  type="checkbox"
                  checked={row.isSelected}
                  disabled={!row.canReceive}
                  onChange={() => onToggle(row.id)}
                  className={RETENTION_CHECK_INPUT_CLASS}
                />
                <span className="sr-only">Incluir {row.name}</span>
              </label>
            </td>
            <td className={RETENTION_TD_CLASS}>
              <b className="break-words">{row.name}</b>
            </td>
            <td className={cn(RETENTION_TD_CLASS, RETENTION_NUMBER_CLASS)}>
              {row.lastVisit}
            </td>
            <td className={cn(RETENTION_TD_CLASS, RETENTION_NUMBER_CLASS)}>
              {row.daysAway}
            </td>
            <td className={RETENTION_TD_CLASS}>
              <span className="flex flex-wrap gap-1.5">
                {row.chips.map((chip) => (
                  <span
                    key={chip.label}
                    className={getRetentionChipClass(chip.tone)}
                  >
                    {chip.label}
                  </span>
                ))}
              </span>
            </td>
            <td className={cn(RETENTION_TD_CLASS, 'py-1')}>
              <button
                type="button"
                onClick={() => onOptOut(row.id)}
                disabled={optingOutId === row.id}
                aria-label={`${row.name} pediu para não receber campanhas`}
                title="Pediu para não receber"
                className={OPT_OUT_BUTTON_CLASS}
              >
                <BellOff aria-hidden="true" className="size-[18px] stroke-2" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
