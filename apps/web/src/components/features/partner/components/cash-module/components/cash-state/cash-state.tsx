import { Lock } from 'lucide-react';
import Link from 'next/link';
import { ModuleStatePanel } from '../../../notifications-module/components/module-state';
import { MANAGEMENT_PRIMARY_BUTTON_CLASS } from '../../cash-module.styles';
import type { TCashStateConfig } from './cash-state.types';

export const CashNoAccess = ({ headingLevel = 'h2' }: TCashStateConfig) => (
  <ModuleStatePanel
    icon={Lock}
    headingLevel={headingLevel}
    title="Sem acesso ao caixa"
    description="Só o dono e o gerente abrem, fecham e acompanham o caixa. O que você recebe de um atendimento entra quando você fecha o atendimento na agenda."
  >
    <Link href="/partner/agenda" className={MANAGEMENT_PRIMARY_BUTTON_CLASS}>
      Ir para a agenda
    </Link>
  </ModuleStatePanel>
);
