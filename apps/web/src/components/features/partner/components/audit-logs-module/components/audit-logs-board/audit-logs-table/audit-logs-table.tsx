import { cn, Skeleton } from '@repo/ui';
import {
  PANEL_BUTTON_CLASS,
  PANEL_CELL_CLASS,
  PANEL_CHIP_CLASS,
  PANEL_CHIP_TONE_CLASS,
  PANEL_HEAD_CELL_CLASS,
  PANEL_NUMBER_CLASS,
  PANEL_SMALL_BUTTON_CLASS,
  PANEL_TABLE_CLASS,
  PANEL_TABLE_WRAPPER_CLASS,
} from '../../../audit-logs-module.styles';
import type { TAuditLogsTableConfig } from '../audit-logs-board.types';

const COLUMNS = [
  { label: 'Quando', isNumber: true },
  { label: 'Quem' },
  { label: 'O que fez' },
  { label: 'Área' },
];

const SKELETON_ROWS = 6;

const TableHead = () => (
  <thead>
    <tr>
      {COLUMNS.map((column) => (
        <th
          key={column.label}
          scope="col"
          className={cn(PANEL_HEAD_CELL_CLASS, column.isNumber && 'text-right')}
        >
          {column.label}
        </th>
      ))}
      <th scope="col" className={PANEL_HEAD_CELL_CLASS}>
        <span className="sr-only">Ações</span>
      </th>
    </tr>
  </thead>
);

export const AuditLogsTable = ({
  rows,
  selectedId,
  onSelectRow,
  isRefreshing,
}: TAuditLogsTableConfig) => (
  <div
    role="region"
    aria-label="Histórico de ações"
    aria-busy={isRefreshing || undefined}
    tabIndex={0}
    className={cn(PANEL_TABLE_WRAPPER_CLASS, isRefreshing && 'opacity-70')}
  >
    <table className={cn(PANEL_TABLE_CLASS, 'min-w-[720px]')}>
      <TableHead />
      <tbody>
        {rows.map((row) => {
          const isSelected = row.id === selectedId;

          return (
            <tr
              key={row.id}
              className={cn('group', isSelected && 'bg-[#F7F6FA]')}
            >
              <td className={cn(PANEL_CELL_CLASS, PANEL_NUMBER_CLASS)}>
                {row.when}
              </td>
              <td className={PANEL_CELL_CLASS}>
                <span className="flex flex-col gap-0.5">
                  <b className="text-sm">{row.actorName}</b>
                  <span>
                    <span
                      className={cn(
                        PANEL_CHIP_CLASS,
                        PANEL_CHIP_TONE_CLASS[row.actorBadge.tone],
                        'px-2 py-0.5',
                      )}
                    >
                      {row.actorBadge.label}
                    </span>
                  </span>
                </span>
              </td>
              <td
                className={cn(
                  PANEL_CELL_CLASS,
                  row.isFailure && 'text-[#8F2416]',
                )}
              >
                {row.action}
              </td>
              <td className={cn(PANEL_CELL_CLASS, 'text-[#5F5C6E]')}>
                {row.area}
              </td>
              <td className={cn(PANEL_CELL_CLASS, 'text-right')}>
                <button
                  type="button"
                  aria-pressed={isSelected}
                  aria-label={`Detalhes: ${row.action}, ${row.when}`}
                  onClick={() => onSelectRow(row.id)}
                  className={cn(PANEL_BUTTON_CLASS, PANEL_SMALL_BUTTON_CLASS)}
                >
                  Detalhes
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

export const AuditLogsTableSkeleton = () => (
  <div
    role="status"
    aria-label="Carregando histórico"
    className={PANEL_TABLE_WRAPPER_CLASS}
  >
    <table className={cn(PANEL_TABLE_CLASS, 'min-w-[720px]')}>
      <TableHead />
      <tbody>
        {Array.from({ length: SKELETON_ROWS }, (_, index) => (
          <tr key={index} className="group">
            {[...COLUMNS, { label: 'acoes' }].map((column) => (
              <td key={column.label} className={PANEL_CELL_CLASS}>
                <Skeleton className="h-4 w-full max-w-[140px] rounded-full bg-[#F0EEF4]" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
