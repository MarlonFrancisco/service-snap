import { formatPriceByCountry } from '@repo/shared/formatters';
import { Card, CardContent, useIsMobile } from '@repo/ui';
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { memo } from 'react';
import {
  GRID_CONSTANTS,
  STATUS_CONFIG,
} from '../agenda-grid/agenda-grid.constants';
import { getSlotSelectionClassName } from '../agenda-grid/agenda-grid.helpers';
import { BulkActionToolbar } from '../agenda-grid/components/bulk-action-toolbar';
import { CurrentTimeLine } from '../agenda-grid/components/current-time-line';
import { useAgendaDayView } from './agenda-day-view.hook';

/**
 * Visualização de Dia Único da Agenda
 * Mostra todos os profissionais em colunas para um único dia selecionado
 */
export const AgendaDayView = memo(() => {
  const dayViewHook = useAgendaDayView();
  const isMobile = useIsMobile();

  const {
    timeSlots,
    isBlockMode,
    currentDayData,
    filteredProfessionals,
    weekDaysNavigation,
    handlePreviousDay,
    handleNextDay,
    handleSelectDay,
    getAppointmentForSlot,
    isSlotOccupied,
    handleSlotClick,
    getSlotClassName,
    getDayAppointments,
    handleAppointmentClick,
    getSlotsSpan,
    isBlockedTime,
    bulkBlockHook,
    selectedDayIndex,
  } = dayViewHook;

  const {
    isSlotSelected,
    handleSlotMouseDown,
    handleSlotMouseEnter,
    handleSlotMouseUp,
    clearSelection,
    executeBlockAction,
    selectedSlotsArray,
  } = bulkBlockHook;

  const slotHeight = GRID_CONSTANTS.SLOT_HEIGHT;

  if (!currentDayData) {
    return null;
  }

  const { isToday, isWorkingDay, formattedDate, dayLabel, dateStr } =
    currentDayData;

  // Mobile: List view
  if (isMobile) {
    const dayAppointments = getDayAppointments();

    return (
      <div className="space-y-3">
        {/* Day Navigation Header */}
        <Card className="border-gray-200">
          <CardContent className="p-2.5">
            {/* Week Days Quick Nav */}
            <div className="flex items-center gap-2 mb-2.5">
              <button
                onClick={handlePreviousDay}
                disabled={selectedDayIndex === 0}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 active:bg-gray-200 transition-colors"
                aria-label="Dia anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-1 flex-1 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
                {weekDaysNavigation.map((dayNav) => {
                  if (!dayNav) return null;

                  return (
                    <button
                      key={dayNav.index}
                      onClick={() => handleSelectDay(dayNav.index)}
                      className={`flex flex-col items-center px-2.5 py-1.5 rounded-lg transition-all min-w-[38px] flex-shrink-0 snap-center active:scale-95 ${
                        dayNav.isSelected
                          ? 'bg-black text-white shadow-sm'
                          : dayNav.isToday
                            ? 'bg-gray-100 text-gray-900'
                            : 'hover:bg-gray-50'
                      } ${!dayNav.isWorkingDay ? 'opacity-50' : ''}`}
                      aria-label={`${dayNav.label} ${dayNav.day}`}
                      aria-current={dayNav.isSelected ? 'date' : undefined}
                    >
                      <span className="text-[9px] font-medium uppercase leading-none mb-0.5">
                        {dayNav.label}
                      </span>
                      <span className="text-sm font-semibold leading-none">
                        {dayNav.day}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleNextDay}
                disabled={selectedDayIndex === 6}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 active:bg-gray-200 transition-colors"
                aria-label="Próximo dia"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Current Day Display */}
            <div className="text-center pt-1 border-t border-gray-100">
              <h2 className="text-base font-semibold text-gray-900 capitalize mt-2">
                {dayLabel}, {formattedDate}
              </h2>
              <div className="flex items-center justify-center gap-2 mt-1.5">
                {isToday && (
                  <span className="text-[10px] font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                    Hoje
                  </span>
                )}
                {!isWorkingDay && (
                  <span className="text-[10px] font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                    Dia não útil
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        <Card className="border-gray-200">
          <CardContent className="p-0">
            {!isWorkingDay ? (
              <div className="flex items-center justify-center py-16 text-gray-500">
                <div className="text-center">
                  <Lock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">Dia não útil</p>
                </div>
              </div>
            ) : dayAppointments.length === 0 ? (
              <div className="flex items-center justify-center py-16 text-gray-500">
                <p className="text-sm">Nenhum agendamento para este dia</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {dayAppointments.map((appointment) => {
                  const statusConfig = STATUS_CONFIG[appointment.status];
                  const StatusIcon = statusConfig.icon;

                  return (
                    <button
                      key={appointment.id}
                      onClick={() => handleAppointmentClick(appointment)}
                      className="w-full p-3 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="flex-shrink-0 w-14 text-center pt-0.5">
                          <div className="text-sm font-semibold text-gray-900 leading-tight">
                            {appointment.startTime}
                          </div>
                          <div className="text-[10px] text-gray-500 leading-tight mt-0.5">
                            {appointment.endTime}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 mb-1">
                            <span className="font-medium text-sm text-gray-900 truncate">
                              {appointment.user.firstName}{' '}
                              {appointment.user.lastName}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] flex-shrink-0 ${statusConfig.className}`}
                            >
                              <StatusIcon className="h-3 w-3" />
                              {statusConfig.label}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 truncate">
                            {appointment.service.name}
                          </p>
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            com {appointment.storeMember.user.firstName}
                          </p>
                        </div>

                        <div className="flex-shrink-0 text-right pt-0.5">
                          <span className="text-sm font-semibold text-gray-900">
                            {formatPriceByCountry(appointment.service.price)}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Desktop: Grid view for single day
  return (
    <>
      <Card className="p-0">
        <CardContent className="p-0">
          {/* Day Navigation Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
            <button
              onClick={handlePreviousDay}
              disabled={selectedDayIndex === 0}
              className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Dia anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Week Days Quick Nav */}
            <div className="flex items-center gap-2 md:pl-[80px]">
              {weekDaysNavigation.map((dayNav) => {
                if (!dayNav) return null;

                return (
                  <button
                    key={dayNav.index}
                    onClick={() => handleSelectDay(dayNav.index)}
                    className={`flex flex-col items-center px-3 py-2 rounded-lg transition-colors ${
                      dayNav.isSelected
                        ? 'bg-black text-white shadow-sm'
                        : dayNav.isToday
                          ? 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                          : 'hover:bg-gray-100'
                    } ${!dayNav.isWorkingDay ? 'opacity-50' : ''}`}
                    aria-label={`${dayNav.label} ${dayNav.day}`}
                    aria-current={dayNav.isSelected ? 'date' : undefined}
                  >
                    <span className="text-xs font-medium uppercase">
                      {dayNav.label}
                    </span>
                    <span className="text-md font-semibold">{dayNav.day}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleNextDay}
              disabled={selectedDayIndex === 6}
              className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Próximo dia"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Current Day Title */}
          <div className="px-4 py-3 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-center gap-3">
              <h2 className="text-lg font-semibold text-gray-900 capitalize md:pl-[80px]">
                {dayLabel}, {formattedDate}
              </h2>
              {isToday && (
                <span className="text-xs font-medium text-white bg-black px-2 py-1 rounded-full">
                  Hoje
                </span>
              )}
              {!isWorkingDay && (
                <span className="text-xs font-medium text-orange-700 bg-orange-100 px-2 py-1 rounded-full">
                  Dia não útil
                </span>
              )}
            </div>
          </div>

          {/* Grid */}
          <div
            className="relative grid"
            style={{
              gridTemplateColumns: `80px repeat(${filteredProfessionals.length}, 1fr)`,
            }}
          >
            {/* Current Time Line */}
            <CurrentTimeLine timeSlots={timeSlots} />

            {/* Time Column */}
            <div className="border-r border-gray-200 bg-gray-50">
              <div
                className="sticky top-0 z-10 flex items-center justify-center border-b border-gray-200 bg-gray-50"
                style={{ height: slotHeight }}
                aria-label="Coluna de horários"
              >
                <span aria-hidden className="text-gray-400">
                  &#128337;
                </span>
              </div>
              {timeSlots.map((time, index) => (
                <div
                  key={time}
                  className={`flex items-center justify-end px-3 text-sm text-gray-500 font-medium ${
                    index < timeSlots.length - 1
                      ? 'border-b border-gray-200'
                      : ''
                  }`}
                  style={{ height: slotHeight }}
                  aria-label={`Horário ${time}`}
                >
                  {time}
                </div>
              ))}
            </div>

            {/* Professional Columns */}
            {filteredProfessionals.map((professional) => (
              <div
                key={professional.id}
                className={`border-r border-gray-200 ${
                  !isWorkingDay ? 'bg-gray-50 opacity-60' : ''
                }`}
              >
                {/* Professional Header */}
                <div
                  className="sticky top-0 z-10 flex flex-col items-center justify-center border-b border-gray-200 bg-white px-2"
                  style={{ height: slotHeight }}
                  role="columnheader"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mb-1">
                    <span className="text-sm font-medium text-gray-600">
                      {professional.user.firstName.charAt(0)}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-gray-900 truncate max-w-full">
                    {professional.user.firstName}
                  </span>
                </div>

                {/* Time Slots */}
                <div
                  className="relative overflow-hidden"
                  style={{ height: slotHeight * timeSlots.length }}
                >
                  {isWorkingDay ? (
                    timeSlots.map((time, timeIndex) => {
                      if (isSlotOccupied(professional.id, time)) {
                        return null;
                      }

                      const appointment = getAppointmentForSlot(
                        professional.id,
                        time,
                      );

                      const blockedTime = isBlockedTime(
                        professional.blockedTimes,
                        dateStr ?? '',
                        time,
                      );
                      const isBlocked = !!blockedTime;

                      const slotsSpan = appointment
                        ? getSlotsSpan(appointment)
                        : 1;
                      const isLastSlot = timeIndex === timeSlots.length - 1;

                      const classNameForSlot = getSlotClassName({
                        appointment,
                        isBlocked,
                        isWorkingDay,
                      });

                      const isSelected = isSlotSelected(
                        professional.id,
                        selectedDayIndex,
                        time,
                      );

                      const selectionClasses = getSlotSelectionClassName(
                        isBlocked,
                        isSelected,
                        isBlockMode,
                        appointment,
                      );

                      return (
                        <div
                          key={`${professional.id}-${time}`}
                          onClick={() => {
                            if (!isWorkingDay) return;
                            handleSlotClick(professional, time, blockedTime);
                          }}
                          onMouseDown={(e) => {
                            if (!isWorkingDay || !isBlockMode || appointment)
                              return;
                            e.preventDefault();
                            handleSlotMouseDown(
                              blockedTime,
                              professional.id,
                              selectedDayIndex,
                              time,
                              dateStr ?? '',
                            );
                          }}
                          onMouseEnter={() => {
                            if (!isWorkingDay || !isBlockMode || appointment)
                              return;
                            handleSlotMouseEnter(
                              blockedTime,
                              professional.id,
                              selectedDayIndex,
                              time,
                              dateStr ?? '',
                            );
                          }}
                          onMouseUp={handleSlotMouseUp}
                          onKeyDown={(e) => {
                            if (!isWorkingDay) return;
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleSlotClick(professional, time, blockedTime);
                            }
                          }}
                          role={
                            !appointment && isWorkingDay ? 'button' : undefined
                          }
                          tabIndex={
                            !appointment && isWorkingDay ? 0 : undefined
                          }
                          aria-label={
                            appointment
                              ? `Agendamento ${appointment.user.firstName} às ${time}`
                              : isBlocked
                                ? `Horário bloqueado ${time} - ${professional.user.firstName}`
                                : `Agendar às ${time} com ${professional.user.firstName}`
                          }
                          aria-pressed={isBlocked}
                          aria-selected={isSelected}
                          className={`${
                            !isLastSlot ? 'border-b border-gray-200' : ''
                          } ${classNameForSlot} ${selectionClasses} select-none transition-all`}
                          style={{ height: slotHeight * slotsSpan }}
                        >
                          {isBlocked ? (
                            <div className="flex h-full items-center justify-center">
                              <Lock
                                className="h-4 w-4 text-gray-400"
                                aria-hidden="true"
                              />
                            </div>
                          ) : appointment ? (
                            <div className="flex h-full flex-col justify-center overflow-hidden">
                              <span className="truncate text-sm font-medium">
                                {appointment.user.firstName}{' '}
                                {appointment.user.lastName}
                              </span>
                              <span className="truncate text-xs text-gray-600">
                                {appointment.service.name}
                              </span>
                              {slotsSpan > 1 && (
                                <span className="mt-0.5 text-xs text-gray-500">
                                  {appointment.startTime} -{' '}
                                  {appointment.endTime}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400 flex items-center justify-center h-full">
                              {time}
                            </span>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-gray-100/60 h-full">
                      <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600">
                        Dia não útil
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Action Toolbar */}
      {isBlockMode && (
        <BulkActionToolbar
          selectedCount={selectedSlotsArray.length}
          onBlock={executeBlockAction}
          onClear={clearSelection}
        />
      )}
    </>
  );
});

AgendaDayView.displayName = 'AgendaDayView';
