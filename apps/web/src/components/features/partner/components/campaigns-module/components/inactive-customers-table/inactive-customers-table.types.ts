import type { TInactiveCustomerRow } from '../../campaigns-module.types';

export type TInactiveCustomersTableConfig = {
  rows: TInactiveCustomerRow[];
  isRefreshing: boolean;
  areAllSelected: boolean;
  canToggleAll: boolean;
  onToggleAll: () => void;
  onToggle: (customerId: string) => void;
  onOptOut: (customerId: string) => void;
  /** Cliente cujo pedido de saída está sendo gravado. */
  optingOutId: string | null | undefined;
};
