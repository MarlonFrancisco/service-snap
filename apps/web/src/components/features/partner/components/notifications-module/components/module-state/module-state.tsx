import { cn } from '@repo/ui';
import { Store, TriangleAlert } from 'lucide-react';
import Link from 'next/link';
import { MODULE_PRIMARY_ACTION_CLASS } from '../../notifications-module.styles';
import type {
  TModuleErrorStateConfig,
  TModuleStatePanelConfig,
  TNoStoreStateConfig,
} from './module-state.types';

export const ModuleStatePanel = ({
  icon: Icon,
  title,
  description,
  tone = 'neutral',
  headingLevel: Heading = 'h2',
  role,
  children,
}: TModuleStatePanelConfig) => (
  <div
    role={role}
    className="flex min-h-[230px] flex-col items-center justify-center gap-2 rounded-[24px] border border-[#EBE9F0] p-6 text-center"
  >
    <span
      aria-hidden="true"
      className={cn(
        'grid size-12 place-items-center rounded-full',
        tone === 'danger'
          ? 'bg-[#FBE8E6] text-[#A4231A]'
          : 'bg-[#F4F3F7] text-[#0B0B0F]',
      )}
    >
      <Icon className="size-[22px] stroke-[1.8]" />
    </span>
    <Heading className="text-lg font-extrabold tracking-[-0.02em]">
      {title}
    </Heading>
    <p className="max-w-[340px] text-sm leading-normal text-[#5F5C6E]">
      {description}
    </p>
    {children ? <div className="mt-1.5">{children}</div> : null}
  </div>
);

export const ModuleErrorState = ({
  onRetry,
  isRetrying = false,
  headingLevel,
}: TModuleErrorStateConfig) => (
  <ModuleStatePanel
    icon={TriangleAlert}
    tone="danger"
    role="alert"
    headingLevel={headingLevel}
    title="Não foi possível carregar"
    description="Seus dados continuam salvos. Verifique a conexão e tente de novo."
  >
    <button
      type="button"
      onClick={onRetry}
      disabled={isRetrying}
      className={MODULE_PRIMARY_ACTION_CLASS}
    >
      {isRetrying ? 'Tentando...' : 'Tentar novamente'}
    </button>
  </ModuleStatePanel>
);

export const NoStoreState = ({ headingLevel }: TNoStoreStateConfig) => (
  <ModuleStatePanel
    icon={Store}
    headingLevel={headingLevel}
    title="Nenhuma loja cadastrada"
    description="Você ainda não cadastrou nenhuma loja. Adicione a primeira para começar a receber agendamentos."
  >
    <Link href="/partner/stores" className={MODULE_PRIMARY_ACTION_CLASS}>
      Adicionar nova loja
    </Link>
  </ModuleStatePanel>
);
