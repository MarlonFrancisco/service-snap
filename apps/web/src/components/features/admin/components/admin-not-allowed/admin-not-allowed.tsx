import { cn } from '@repo/ui';
import { Lock } from 'lucide-react';
import Link from 'next/link';
import { PARTNER_SHELL_CLASS } from '../../../partner/partner.styles';
import { PANEL_PRIMARY_BUTTON_CLASS } from '../../../partner/components/audit-logs-module/audit-logs-module.styles';
import { ModuleStatePanel } from '../../../partner/components/notifications-module/components/module-state';

/** Quem não está na lista de admins da plataforma (a API devolve 403). */
export const AdminNotAllowed = () => (
  <main
    className={cn(
      PARTNER_SHELL_CLASS,
      'grid min-h-dvh place-items-center bg-[#F4F3F7] p-5',
    )}
  >
    <div className="w-full max-w-[480px] rounded-[24px] bg-white">
      <ModuleStatePanel
        icon={Lock}
        headingLevel="h2"
        title="Área da equipe ServiceSnap"
        description="Esta página é só para quem cuida da plataforma. Sua conta não tem esse acesso."
      >
        <Link href="/" className={PANEL_PRIMARY_BUTTON_CLASS}>
          Voltar ao início
        </Link>
      </ModuleStatePanel>
    </div>
  </main>
);
