import { cn } from '@repo/ui';
import { TriangleAlert } from 'lucide-react';
import { SERVICES_PRIMARY_BUTTON_CLASS } from '../../services-module.styles';
import { ServicesStatePanel } from '../services-state-panel';

type TServicesLoadErrorConfig = {
  isRetrying: boolean;
  onRetry: () => void;
};

export const ServicesLoadError = ({
  isRetrying,
  onRetry,
}: TServicesLoadErrorConfig) => (
  <ServicesStatePanel
    icon={TriangleAlert}
    tone="error"
    role="alert"
    title="Não foi possível carregar"
    description="Seus dados continuam salvos. Verifique a conexão e tente de novo."
  >
    <button
      type="button"
      onClick={onRetry}
      className={cn(SERVICES_PRIMARY_BUTTON_CLASS, 'mt-1.5 px-[18px]')}
    >
      {isRetrying ? 'Tentando...' : 'Tentar novamente'}
    </button>
  </ServicesStatePanel>
);
