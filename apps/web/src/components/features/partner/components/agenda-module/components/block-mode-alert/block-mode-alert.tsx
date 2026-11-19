import { useAgendaStore } from '@/store/admin/agenda';
import { useIsMobile } from '@repo/ui';

export function BlockModeAlert() {
  const isBlockMode = useAgendaStore((state) => state.isBlockMode);
  const isMobile = useIsMobile();

  if (!isBlockMode) {
    return null;
  }

  return (
    <p
      role="status"
      className="rounded-[14px] bg-warning-bg px-[18px] py-3.5 text-sm font-semibold text-warning"
    >
      Modo de bloqueio ativado.{' '}
      {isMobile
        ? 'Toque nos horários para bloquear ou desbloquear.'
        : 'Clique nos horários vazios ou arraste para bloquear ou desbloquear.'}
    </p>
  );
}
