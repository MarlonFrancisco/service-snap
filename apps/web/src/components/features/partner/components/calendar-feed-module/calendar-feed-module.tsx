'use client';

import {
  cn,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
} from '@repo/ui';
import { Users } from 'lucide-react';
import { PARTNER_PORTAL_CLASS } from '../../partner.styles';
import {
  ModuleErrorState,
  ModuleStatePanel,
  NoStoreState,
} from '../notifications-module/components/module-state';
import {
  MODULE_ACTION_CLASS,
  MODULE_CARD_CLASS,
  MODULE_CARD_TITLE_CLASS,
  MODULE_DANGER_ACTION_CLASS,
  MODULE_LEAD_CLASS,
  MODULE_PRIMARY_ACTION_CLASS,
  MODULE_TITLE_CLASS,
} from '../notifications-module/notifications-module.styles';
import { CalendarFeedModuleSkeleton } from './calendar-feed-module-skeleton';
import { useCalendarFeedModule } from './calendar-feed-module.hook';
import {
  CALENDAR_ACTIVE_BADGE_CLASS,
  CALENDAR_ACTIVE_DOT_CLASS,
  CALENDAR_CARD_TEXT_CLASS,
  CALENDAR_LINK_FIELD_CLASS,
  CALENDAR_MEMBER_SELECT_CLASS,
  CALENDAR_NOTE_CLASS,
  CALENDAR_ROW_CLASS,
} from './calendar-feed-module.styles';
import { CalendarFeedConfirmDialog } from './components/calendar-feed-confirm-dialog';
import { CalendarFeedGuide } from './components/calendar-feed-guide';

export const CalendarFeedModule = () => {
  const {
    hasNoStore,
    isLoading,
    isError,
    handleRetry,
    isRetrying,
    hasNoMembers,
    canChooseMember,
    memberOptions,
    memberId,
    memberName,
    handleMemberChange,
    calendarFeed,
    handleCopyLink,
    handleSelectLink,
    handleCreateLink,
    isCreatePending,
    confirmContent,
    isConfirmPending,
    handleRequestRotate,
    handleRequestRevoke,
    handleConfirmAction,
    handleCancelAction,
  } = useCalendarFeedModule();

  if (hasNoStore) return <NoStoreState />;
  if (isLoading) return <CalendarFeedModuleSkeleton />;
  if (isError) {
    return <ModuleErrorState onRetry={handleRetry} isRetrying={isRetrying} />;
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 max-w-[720px]">
          <h2 className={MODULE_TITLE_CLASS}>Sua agenda no Google Agenda</h2>
          <p className={MODULE_LEAD_CLASS}>
            Veja os atendimentos no Google Agenda, no Calendário do iPhone ou no
            Outlook, junto com seus compromissos pessoais.
          </p>
        </div>

        {canChooseMember && memberOptions.length ? (
          <Select value={memberId} onValueChange={handleMemberChange}>
            <SelectTrigger
              aria-label="Escolher profissional"
              className={cn(CALENDAR_MEMBER_SELECT_CLASS, 'max-w-full')}
            >
              <SelectValue>Agenda de {memberName}</SelectValue>
            </SelectTrigger>
            <SelectContent className={PARTNER_PORTAL_CLASS}>
              {memberOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
      </div>

      {hasNoMembers ? (
        <ModuleStatePanel
          icon={Users}
          headingLevel="h3"
          title="Nenhum profissional ativo"
          description="Ative um profissional na loja para gerar o link da agenda dele."
        />
      ) : calendarFeed ? (
        <>
          <section aria-label="Link da agenda" className={MODULE_CARD_CLASS}>
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className={MODULE_CARD_TITLE_CLASS}>Link da agenda</h3>
                <span className={CALENDAR_ACTIVE_BADGE_CLASS}>
                  <span
                    aria-hidden="true"
                    className={CALENDAR_ACTIVE_DOT_CLASS}
                  />
                  Ativo
                </span>
              </div>
              <p className={CALENDAR_CARD_TEXT_CLASS}>
                Cole este link uma vez no seu calendário. Os agendamentos novos,
                as remarcações e os cancelamentos aparecem sozinhos.
              </p>
            </div>

            <div className={CALENDAR_ROW_CLASS}>
              <input
                readOnly
                value={calendarFeed.url}
                aria-label="Link da agenda"
                onFocus={handleSelectLink}
                className={CALENDAR_LINK_FIELD_CLASS}
              />
              <button
                type="button"
                onClick={() => void handleCopyLink()}
                className={MODULE_PRIMARY_ACTION_CLASS}
              >
                Copiar link
              </button>
            </div>

            <p className={CALENDAR_NOTE_CLASS}>
              O Google Agenda busca novidades a cada algumas horas, não na hora.
              Para conferir um encaixe de agora, use a agenda do ServiceSnap.
            </p>
          </section>

          <CalendarFeedGuide />

          <section
            aria-label="Privacidade do link"
            className={MODULE_CARD_CLASS}
          >
            <div>
              <h3 className={MODULE_CARD_TITLE_CLASS}>
                Quem tem o link vê a agenda
              </h3>
              <p className={CALENDAR_CARD_TEXT_CLASS}>
                O calendário mostra o serviço e o primeiro nome do cliente, sem
                telefone nem e-mail. Não compartilhe o link. Se ele vazar, gere
                outro: o antigo para de funcionar na hora.
              </p>
            </div>
            <div className={CALENDAR_ROW_CLASS}>
              <button
                type="button"
                onClick={handleRequestRotate}
                className={MODULE_ACTION_CLASS}
              >
                Gerar novo link
              </button>
              <button
                type="button"
                onClick={handleRequestRevoke}
                className={MODULE_DANGER_ACTION_CLASS}
              >
                Desativar link
              </button>
            </div>
          </section>
        </>
      ) : (
        <section
          aria-label="Link da agenda"
          className={cn(MODULE_CARD_CLASS, 'border-dashed')}
        >
          <div>
            <h3 className={MODULE_CARD_TITLE_CLASS}>Nenhum link ainda</h3>
            <p className={CALENDAR_CARD_TEXT_CLASS}>
              Gere o link para ver esta agenda no seu calendário.
            </p>
          </div>
          <div className={CALENDAR_ROW_CLASS}>
            <button
              type="button"
              onClick={handleCreateLink}
              disabled={isCreatePending}
              className={MODULE_PRIMARY_ACTION_CLASS}
            >
              {isCreatePending ? (
                <>
                  <Spinner />
                  Gerando...
                </>
              ) : (
                'Gerar link da agenda'
              )}
            </button>
          </div>
        </section>
      )}

      <CalendarFeedConfirmDialog
        content={confirmContent}
        isPending={isConfirmPending}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelAction}
      />
    </div>
  );
};
