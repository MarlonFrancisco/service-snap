import { cn, Skeleton } from '@repo/ui';
import {
  MANAGEMENT_BUTTON_CLASS,
  MANAGEMENT_CELL_CLASS,
  MANAGEMENT_CHIP_CLASS,
  MANAGEMENT_CHIP_TONE,
  MANAGEMENT_HEAD_CELL_CLASS,
  MANAGEMENT_MUTED_CLASS,
  MANAGEMENT_NUMBER_CLASS,
  MANAGEMENT_SMALL_BUTTON_CLASS,
  MANAGEMENT_TABLE_CLASS,
  MANAGEMENT_TABLE_WRAPPER_CLASS,
} from '../../../cash-module.styles';
import type { TCashPaymentsTableConfig } from './cash-payments-table.types';

const SKELETON_ROWS = 4;

const COLUMNS = [
  { label: 'Hora', isNumber: true },
  { label: 'Cliente' },
  { label: 'Origem' },
  { label: 'Forma' },
  { label: 'Valor', isNumber: true },
  { label: 'Registrado por' },
];

const TableHead = ({ withActions }: { withActions: boolean }) => (
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
      {withActions ? (
        <th scope="col" className={MANAGEMENT_HEAD_CELL_CLASS}>
          <span className="sr-only">Ações</span>
        </th>
      ) : null}
    </tr>
  </thead>
);

export const CashPaymentsTable = ({
  rows,
  isRefreshing,
  onVoid,
  label = 'Pagamentos do caixa',
}: TCashPaymentsTableConfig) => (
  <div
    role="region"
    aria-label={label}
    aria-busy={isRefreshing || undefined}
    tabIndex={0}
    className={cn(MANAGEMENT_TABLE_WRAPPER_CLASS, isRefreshing && 'opacity-70')}
  >
    <table className={cn(MANAGEMENT_TABLE_CLASS, 'min-w-[860px]')}>
      <TableHead withActions={!!onVoid} />
      <tbody>
        {rows.map((row) => (
          <tr key={row.id} className="group">
            <td className={cn(MANAGEMENT_CELL_CLASS, MANAGEMENT_NUMBER_CLASS)}>
              {row.time}
            </td>
            <td className={cn(MANAGEMENT_CELL_CLASS, 'font-bold')}>
              {row.customer}
            </td>
            <td className={MANAGEMENT_CELL_CLASS}>{row.origin}</td>
            <td className={MANAGEMENT_CELL_CLASS}>{row.method}</td>
            <td
              className={cn(
                MANAGEMENT_CELL_CLASS,
                MANAGEMENT_NUMBER_CLASS,
                row.isVoided && 'text-[#6F6C7E] line-through',
              )}
            >
              {row.isVoided ? (
                <span className="sr-only">Estornado: </span>
              ) : null}
              {row.amount}
            </td>
            <td className={cn(MANAGEMENT_CELL_CLASS, MANAGEMENT_MUTED_CLASS)}>
              {row.registeredBy}
            </td>
            {onVoid ? (
              <td className={MANAGEMENT_CELL_CLASS}>
                {row.isVoided ? (
                  <span
                    title={row.voidReason ?? undefined}
                    className={cn(
                      MANAGEMENT_CHIP_CLASS,
                      MANAGEMENT_CHIP_TONE.error,
                    )}
                  >
                    Estornado
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onVoid(row.payment)}
                    aria-label={`Estornar ${row.amount} de ${row.customer}`}
                    className={cn(
                      MANAGEMENT_BUTTON_CLASS,
                      MANAGEMENT_SMALL_BUTTON_CLASS,
                    )}
                  >
                    Estornar
                  </button>
                )}
              </td>
            ) : null}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const CashPaymentsTableSkeleton = () => (
  <div
    role="status"
    aria-label="Carregando pagamentos"
    className={MANAGEMENT_TABLE_WRAPPER_CLASS}
  >
    <table className={cn(MANAGEMENT_TABLE_CLASS, 'min-w-[860px]')}>
      <TableHead withActions />
      <tbody>
        {Array.from({ length: SKELETON_ROWS }, (_, index) => (
          <tr key={index} className="group">
            {[...COLUMNS, { label: 'Ações' }].map((column) => (
              <td key={column.label} className={MANAGEMENT_CELL_CLASS}>
                <Skeleton className="h-4 w-full max-w-[120px] rounded-full bg-[#F0EEF4]" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
