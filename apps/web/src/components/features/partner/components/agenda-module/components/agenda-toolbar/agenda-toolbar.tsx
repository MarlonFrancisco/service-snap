import { PARTNER_PORTAL_CLASS } from '@/components/features/partner/partner.styles';
import {
  cn,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
    monthYear,
    navigationLabels,
    isBlockMode,
    viewMode,
    selectedProfessional,
    professionals,
    handlePrevious,
    handleNext,
    handleToday,
    handleToggleBlockMode,
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

  const professionalSelect = (
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
              {monthYear}
            </h2>
          ) : (
            <span className="flex-1 text-center text-sm font-bold">
              {monthYear}
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
        <h2 className="mx-2 text-base font-extrabold">{monthYear}</h2>
      )}
      {!isFocus && !isDayNavigation && (
        <span className="mx-2 text-base font-extrabold">{monthYear}</span>
      )}

      {!isFocus && (
        <div role="group" aria-label="Visão" className="flex gap-1">
          <button
            type="button"
            aria-pressed={viewMode === 'grid'}
            onClick={() => handleViewModeChange('grid')}
            className={cn(
              AGENDA_BUTTON_CLASS,
              viewMode === 'grid' && AGENDA_BUTTON_ACTIVE_CLASS,
            )}
          >
            Semana
          </button>
          <button
            type="button"
            aria-pressed={viewMode === 'day'}
            onClick={() => handleViewModeChange('day')}
            className={cn(
              AGENDA_BUTTON_CLASS,
              viewMode === 'day' && AGENDA_BUTTON_ACTIVE_CLASS,
            )}
          >
            Dia
          </button>
        </div>
      )}

      <span className="flex-1" />

      {professionalSelect}

      {!isFocus && (
        <button
          type="button"
          onClick={handleEnterFocusMode}
          className={AGENDA_BUTTON_CLASS}
        >
          Foco
        </button>
      )}

      <button
        type="button"
        aria-pressed={isBlockMode}
        onClick={handleToggleBlockMode}
        className={cn(
          AGENDA_BUTTON_CLASS,
          isBlockMode && AGENDA_BUTTON_BLOCK_ACTIVE_CLASS,
        )}
      >
        {isBlockMode ? 'Bloqueio ativo' : 'Bloquear'}
      </button>

      <button
        type="button"
        onClick={handleOpenAddAppointment}
        className={cn(
          AGENDA_BUTTON_CLASS,
          AGENDA_BUTTON_ACTIVE_CLASS,
          'ml-auto',
        )}
      >
        Agendar
      </button>
    </div>
  );
}
