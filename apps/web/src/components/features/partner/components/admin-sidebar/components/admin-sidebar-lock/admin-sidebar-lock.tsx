import { Lock } from 'lucide-react';

export const LOCKED_LABEL = 'requer upgrade do plano';

/** Cadeado no fim do item: o módulo abre, mas mostra o aviso de upgrade. */
export const AdminSidebarLock = () => (
  <span className="ml-auto flex shrink-0 items-center">
    <Lock aria-hidden="true" className="size-3.5 stroke-2" />
    <span className="sr-only">({LOCKED_LABEL})</span>
  </span>
);
