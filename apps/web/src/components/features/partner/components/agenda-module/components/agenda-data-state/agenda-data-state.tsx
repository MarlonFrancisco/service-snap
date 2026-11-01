import { cn, Skeleton } from '@repo/ui';
import {
  AGENDA_BUTTON_ACTIVE_CLASS,
  AGENDA_BUTTON_CLASS,
} from '../../agenda-module.styles';
import { useAgendaDataState } from './agenda-data-state.hook';
import type { TAgendaDataStateConfig } from './agenda-data-state.types';

const SKELETON_ROWS = Array.from({ length: 6 }, (_, index) => index);

const NO_STORE_MESSAGE =
  'Você ainda não tem uma loja. Cadastre uma loja para ver e organizar a agenda.';

export const AgendaNoStoreMessage = () => (
  <p className="rounded-[22px] bg-[#F7F6FA] p-8 text-center text-sm font-semibold text-[#5F5C6E]">
    {NO_STORE_MESSAGE}
  </p>
);

export const AgendaDataState = ({ children }: TAgendaDataStateConfig) => {
  const { status, handleRetry } = useAgendaDataState();

  if (status === 'ready') {
    return <>{children}</>;
  }

  if (status === 'no-store') {
    return <AgendaNoStoreMessage />;
  }

  if (status === 'error') {
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-3 rounded-[22px] bg-[#F7F6FA] p-8 text-center"
      >
        <p className="text-sm font-semibold">
          Não foi possível carregar a agenda
        </p>
        <button
          type="button"
          onClick={handleRetry}
          className={cn(AGENDA_BUTTON_CLASS, AGENDA_BUTTON_ACTIVE_CLASS)}
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-busy="true"
      className="space-y-2 rounded-[22px] border border-[#EBE9F0] p-4"
    >
      <span className="sr-only">Carregando agenda</span>
      <Skeleton className="h-12 w-full rounded-[14px] bg-[#F4F3F7]" />
      {SKELETON_ROWS.map((row) => (
        <Skeleton
          key={row}
          className="h-14 w-full rounded-[14px] bg-[#F4F3F7]"
        />
      ))}
    </div>
  );
};
