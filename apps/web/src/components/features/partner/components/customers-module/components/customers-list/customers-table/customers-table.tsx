import { cn, Skeleton } from '@repo/ui';
import Link from 'next/link';
import { PARTNER_FOCUS_CLASS } from '../../../../../partner.styles';
import {
  CUSTOMERS_MUTED_CLASS,
  CUSTOMERS_TAG_CLASS,
} from '../../../customers-module.styles';
import type { TCustomersTableConfig } from './customers-table.types';

const TABLE_WRAPPER_CLASS = cn(
  'overflow-x-auto rounded-[22px] border border-[#EBE9F0]',
  PARTNER_FOCUS_CLASS,
);
const HEAD_CELL_CLASS =
  'border-b border-[#EBE9F0] bg-[#F7F6FA] px-[18px] py-3.5 text-left text-xs font-bold whitespace-nowrap text-[#5F5C6E]';
const CELL_CLASS =
  'border-b border-[#F0EEF4] px-[18px] py-3.5 align-middle group-last:border-b-0';
const NUMBER_CLASS = 'text-right whitespace-nowrap tabular-nums';

const COLUMNS = [
  { label: 'Nome' },
  { label: 'Contato' },
  { label: 'Visitas', isNumber: true },
  { label: 'Última visita' },
  { label: 'Próxima' },
  { label: 'Total gasto', isNumber: true },
  { label: 'Etiquetas' },
];

const SKELETON_ROWS = 6;

const TableHead = () => (
  <thead>
    <tr>
      {COLUMNS.map((column) => (
        <th
          key={column.label}
          scope="col"
          className={cn(HEAD_CELL_CLASS, column.isNumber && 'text-right')}
        >
          {column.label}
        </th>
      ))}
    </tr>
  </thead>
);

export const CustomersTable = ({
  rows,
  isRefreshing,
}: TCustomersTableConfig) => (
  <div
    role="region"
    aria-label="Lista de clientes"
    aria-busy={isRefreshing || undefined}
    tabIndex={0}
    className={cn(TABLE_WRAPPER_CLASS, isRefreshing && 'opacity-70')}
  >
    <table className="w-full min-w-[1040px] border-collapse text-sm">
      <TableHead />
      <tbody>
        {rows.map((row) => (
          <tr key={row.id} className="group">
            <td className={CELL_CLASS}>
              <Link
                href={row.href}
                className={cn(
                  'inline-flex min-h-11 items-center font-bold underline decoration-[#D6D3DE] underline-offset-[3px] hover:decoration-[#0B0B0F]',
                  PARTNER_FOCUS_CLASS,
                )}
              >
                {row.name}
              </Link>
            </td>
            <td className={CELL_CLASS}>
              <span className="block font-semibold break-all">
                {row.contact.primary}
              </span>
              <span
                className={cn(
                  'mt-0.5 block text-[13px] break-all',
                  CUSTOMERS_MUTED_CLASS,
                )}
              >
                {row.contact.secondary}
              </span>
            </td>
            <td className={cn(CELL_CLASS, NUMBER_CLASS)}>{row.visits}</td>
            <td
              className={cn(
                CELL_CLASS,
                'whitespace-nowrap',
                row.isLastVisitEmpty && CUSTOMERS_MUTED_CLASS,
              )}
            >
              {row.lastVisit}
            </td>
            <td
              className={cn(
                CELL_CLASS,
                'whitespace-nowrap',
                row.isNextVisitEmpty && CUSTOMERS_MUTED_CLASS,
              )}
            >
              {row.nextVisit}
            </td>
            <td className={cn(CELL_CLASS, NUMBER_CLASS)}>{row.totalSpent}</td>
            <td className={CELL_CLASS}>
              <div className="flex flex-wrap gap-1.5">
                {row.tags.map((tag) => (
                  <span key={tag} className={CUSTOMERS_TAG_CLASS}>
                    {tag}
                  </span>
                ))}
                {row.hiddenTags > 0 ? (
                  <span
                    className={CUSTOMERS_TAG_CLASS}
                    aria-label={`Mais ${row.hiddenTags} etiquetas`}
                  >
                    +{row.hiddenTags}
                  </span>
                ) : null}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const CustomersTableSkeleton = () => (
  <div
    role="status"
    aria-label="Carregando clientes"
    className="overflow-x-auto rounded-[22px] border border-[#EBE9F0]"
  >
    <table className="w-full min-w-[1040px] border-collapse text-sm">
      <TableHead />
      <tbody>
        {Array.from({ length: SKELETON_ROWS }, (_, index) => (
          <tr key={index} className="group">
            {COLUMNS.map((column) => (
              <td key={column.label} className={CELL_CLASS}>
                <Skeleton className="h-4 w-full max-w-[140px] rounded-full bg-[#F0EEF4]" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
