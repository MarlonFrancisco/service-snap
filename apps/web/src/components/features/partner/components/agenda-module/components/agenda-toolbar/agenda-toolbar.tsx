import { PARTNER_PORTAL_CLASS } from '@/components/features/partner/partner.styles';
import {
  cn,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui';
import { CalendarX2, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  AGENDA_BUTTON_ACTIVE_CLASS,
  AGENDA_BUTTON_BLOCK_ACTIVE_CLASS,
  AGENDA_BUTTON_CLASS,
  AGENDA_PROFESSIONAL_SELECT_CLASS,
} from '../../agenda-module.styles';
import { useAgendaToolbar } from './agenda-toolbar.hook';
import type { TAgendaToolbarConfig } from './agenda-toolbar.types';

export function AgendaToolbar({ variant = 'default' }: TAgendaToolbarConfig) {
  const {
    isMobile,
    isFocus,
    isDayNavigation,
    isMonthNavigation,
    periodLabel,
    navigationLabels,
    isBlockMode,
    viewMode,
    viewOptions,
    selectedProfessional,
    professionals,
    showProfessionalFilter,
    handlePrevious,
    handleNext,
    handleToday,
    handleToggleBlockMode,
    handleOpenBlockDialog,
    handleEnterFocusMode,
    handleExitFocusMode,
    handleViewModeChange,
    handleOpenAddAppointment,
    handleProfessionalChange,
  } = useAgendaToolbar(variant);

  const previousButton = (
    <button
      type="button"
      aria-label={navigationLabels.previous}
      onClick={handlePrevious}
      className={cn(AGENDA_BUTTON_CLASS, 'px-0')}
    >
      <ChevronLeft className="size-4" aria-hidden="true" />
    </button>
  );

  const todayButton = (
    <button type="button" onClick={handleToday} className={AGENDA_BUTTON_CLASS}>
      Hoje
    </button>
  );

  const nextButton = (
    <button
      type="button"
      aria-label={navigationLabels.next}
      onClick={handleNext}
      className={cn(AGENDA_BUTTON_CLASS, 'px-0')}
    >
      <ChevronRight className="size-4" aria-hidden="true" />
    </button>
  );

  const professionalSelect = showProfessionalFilter && (
    <Select
      value={selectedProfessional}
      onValueChange={handleProfessionalChange}
    >
      <SelectTrigger
        aria-label="Filtrar por profissional"
        className={cn(
          AGENDA_PROFESSIONAL_SELECT_CLASS,
          isMobile
            ? 'min-w-0 flex-1 *:data-[slot=select-value]:block *:data-[slot=select-value]:truncate'
            : 'w-[180px] *:data-[slot=select-value]:block *:data-[slot=select-value]:truncate',
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent className={PARTNER_PORTAL_CLASS}>
        <SelectItem value="all">Todos os profissionais</SelectItem>
        {professionals.map((professional) => (
          <SelectItem key={professional.id} value={professional.id}>
            {professional.user.firstName} {professional.user.lastName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  if (isMobile) {
    return (
      <div className="grid grid-cols-[minmax(0,1fr)] gap-3">
        <div className="flex items-center gap-1.5">
          {previousButton}
          {isFocus ? (
            <h2 className="flex-1 text-center text-sm font-bold">
              {periodLabel}
            </h2>
          ) : (
            <span className="flex-1 text-center text-sm font-bold">
              {periodLabel}
            </span>
          )}
          {todayButton}
          {nextButton}
        </div>

        <div className="flex items-center gap-1.5">
          {professionalSelect}
          <button
            type="button"
            onClick={isFocus ? handleExitFocusMode : handleEnterFocusMode}
            className={cn(
              AGENDA_BUTTON_CLASS,
              'px-3.5',
              isFocus && AGENDA_BUTTON_ACTIVE_CLASS,
            )}
          >
            {isFocus ? 'Sair do foco' : 'Foco'}
          </button>
          <button
            type="button"
            aria-pressed={isBlockMode}
            onClick={handleToggleBlockMode}
            className={cn(
              AGENDA_BUTTON_CLASS,
              'px-3.5',
              isBlockMode && AGENDA_BUTTON_BLOCK_ACTIVE_CLASS,
            )}
          >
            {isBlockMode ? 'Bloqueio ativo' : 'Bloquear'}
          </button>
          {!isFocus && (
            <button
              type="button"
              onClick={handleOpenBlockDialog}
              aria-label="Bloquear horário"
              className={cn(AGENDA_BUTTON_CLASS, 'px-3.5')}
            >
              <CalendarX2 className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {isFocus && (
        <button
          type="button"
          onClick={handleExitFocusMode}
          className={cn(AGENDA_BUTTON_CLASS, AGENDA_BUTTON_ACTIVE_CLASS)}
        >
          Sair do modo focado
        </button>
      )}

      {previousButton}
      {todayButton}
      {nextButton}

      {isFocus && (
        <h2 className="mx-2 text-base font-extrabold">{periodLabel}</h2>
      )}
      {!isFocus && !isDayNavigation && (
        <span className="mx-2 text-base font-extrabold">{periodLabel}</span>
      )}

      {!isFocus && (
        <div role="group" aria-label="Visão" className="flex gap-1">
          {viewOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={viewMode === option.value}
              onClick={() => handleViewModeChange(option.value)}
              className={cn(
                AGENDA_BUTTON_CLASS,
                viewMode === option.value && AGENDA_BUTTON_ACTIVE_CLASS,
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      <span className="flex-1" />

      {professionalSelect}

      {!isFocus && !isMonthNavigation && (
        <button
          type="button"
          onClick={handleEnterFocusMode}
          className={AGENDA_BUTTON_CLASS}
        >
          Foco
        </button>
      )}

      {!isMonthNavigation && (
        <button
          type="button"
          aria-pressed={isBlockMode}
          onClick={handleToggleBlockMode}
          className={cn(
            AGENDA_BUTTON_CLASS,
            isBlockMode && AGENDA_BUTTON_BLOCK_ACTIVE_CLASS,
          )}
        >
          {isBlockMode ? 'Bloqueio ativo' : 'Bloquear na grade'}
        </button>
      )}

      <button
        type="button"
        onClick={handleOpenBlockDialog}
        className={AGENDA_BUTTON_CLASS}
      >
        Bloquear horário
      </button>

      <button
        type="button"
        onClick={handleOpenAddAppointment}
        className={cn(AGENDA_BUTTON_CLASS, AGENDA_BUTTON_ACTIVE_CLASS)}
      >
        Novo agendamento
      </button>
    </div>
  );
}
