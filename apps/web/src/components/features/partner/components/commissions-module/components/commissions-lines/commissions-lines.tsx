import { cn } from '@repo/ui';
import {
  MANAGEMENT_CELL_CLASS,
  MANAGEMENT_CHIP_CLASS,
  MANAGEMENT_CHIP_TONE,
  MANAGEMENT_HEAD_CELL_CLASS,
  MANAGEMENT_NUMBER_CLASS,
  MANAGEMENT_TABLE_CLASS,
  MANAGEMENT_TABLE_WRAPPER_CLASS,
} from '../../../cash-module/cash-module.styles';
import type { TCommissionsLinesConfig } from './commissions-lines.types';

const COLUMNS = [
  { label: 'Dia', isNumber: true },
  { label: 'Serviço' },
  { label: 'Cliente' },
  { label: 'Base', isNumber: true },
  { label: 'De onde veio' },
  { label: 'Regra' },
  { label: 'Comissão', isNumber: true },
];

export const CommissionsLines = ({
  rows,
  label,
  isRefreshing,
}: TCommissionsLinesConfig) => (
  <div
    role="region"
    aria-label={label}
    aria-busy={isRefreshing || undefined}
    tabIndex={0}
    className={cn(MANAGEMENT_TABLE_WRAPPER_CLASS, isRefreshing && 'opacity-70')}
  >
    <table className={cn(MANAGEMENT_TABLE_CLASS, 'min-w-[760px]')}>
      <thead>
        <tr>
          {COLUMNS.map((column) => (
            <th
              key={column.label}
              scope="col"
              className={cn(
                MANAGEMENT_HEAD_CELL_CLASS,
                column.isNumber && 'text-right',
              )}
            >
              {column.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id} className="group">
            <td className={cn(MANAGEMENT_CELL_CLASS, MANAGEMENT_NUMBER_CLASS)}>
              {row.day}
            </td>
            <td className={MANAGEMENT_CELL_CLASS}>{row.serviceName}</td>
            <td className={MANAGEMENT_CELL_CLASS}>{row.customerName}</td>
            <td className={cn(MANAGEMENT_CELL_CLASS, MANAGEMENT_NUMBER_CLASS)}>
              {row.base}
            </td>
            <td className={MANAGEMENT_CELL_CLASS}>
              <span
                className={cn(
                  MANAGEMENT_CHIP_CLASS,
                  MANAGEMENT_CHIP_TONE[row.source.tone],
                )}
              >
                {row.source.label}
              </span>
            </td>
            <td className={cn(MANAGEMENT_CELL_CLASS, 'whitespace-nowrap')}>
              {row.rule}
            </td>
            <td
              className={cn(
                MANAGEMENT_CELL_CLASS,
                MANAGEMENT_NUMBER_CLASS,
                'font-bold',
              )}
            >
              {row.commission}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
