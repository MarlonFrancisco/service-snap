import { Lock, UserX } from 'lucide-react';
import Link from 'next/link';
import { ModuleStatePanel } from '../../../notifications-module/components/module-state';
import { CUSTOMERS_PRIMARY_BUTTON_CLASS } from '../../customers-module.styles';
import type { TCustomersStateConfig } from './customers-state.types';

export const CustomersNoAccess = ({
  headingLevel = 'h2',
}: TCustomersStateConfig) => (
  <ModuleStatePanel
    icon={Lock}
    headingLevel={headingLevel}
    title="Sem acesso aos clientes"
    description="Só o dono e o gerente da loja veem a lista de clientes. Os clientes dos seus atendimentos aparecem na agenda."
  >
    <Link href="/partner/agenda" className={CUSTOMERS_PRIMARY_BUTTON_CLASS}>
      Ir para a agenda
    </Link>
  </ModuleStatePanel>
);

export const CustomerNotFound = ({
  headingLevel = 'h2',
}: TCustomersStateConfig) => (
  <ModuleStatePanel
    icon={UserX}
    headingLevel={headingLevel}
    title="Cliente não encontrado"
    description="Este cliente não é da loja selecionada ou o endereço está errado."
  >
    <Link href="/partner/clientes" className={CUSTOMERS_PRIMARY_BUTTON_CLASS}>
      Ver clientes
    </Link>
  </ModuleStatePanel>
);
