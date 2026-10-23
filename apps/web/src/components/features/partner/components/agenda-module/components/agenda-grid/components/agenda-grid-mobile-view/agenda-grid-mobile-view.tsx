import { formatPriceByCountry } from '@repo/shared/formatters';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui';
import { Calendar, Clock, DollarSign, Plus, User } from 'lucide-react';
import { memo } from 'react';
import { CONTAINER_HEIGHTS, STATUS_CONFIG } from '../../agenda-grid.constants';
import { isBlockedTime } from '../../agenda-grid.helpers';
import { useAgendaGridMobileView } from './agenda-grid-mobile-view.hook';
import type { TMobileViewConfig } from './agenda-grid-mobile-view.types';

export const AgendaGridMobileView = memo(({ gridHook }: TMobileViewConfig) => {
  const {
    isBlockMode,
    timeSlots,
    filteredProfessionals,
    selectedProfessionalId,
    getAppointmentForSlot,
    isSlotOccupied,
    handleSlotClick,
    getDayAppointmentsForCalendar,
    handleQuickAdd,
    handleAppointmentClick,
  } = gridHook;

  const { dayViewData, selectedDayData, formatDateBR } =
    useAgendaGridMobileView(gridHook);

  if (isBlockMode) {
    // Block Mode View
    if (!selectedDayData) return null;

    const { date, isToday, isWorkingDay, label } = selectedDayData;

    return (
      <div
        className="overflow-y-auto pb-24"
        style={{ height: CONTAINER_HEIGHTS.MOBILE_BLOCK_MODE }}
      >
        <div className="p-4">
          <div className="space-y-4">
            <Card
              className={`border-gray-200 ${isToday ? 'ring-2 ring-black' : ''}`}
            >
              <CardHeader
                className={`pb-3 ${isToday ? 'bg-black text-white' : 'bg-gray-50'}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className={isToday ? 'text-white' : ''}>
                      {label}
                    </CardTitle>
                    <p
                      className={`mt-1 text-sm ${isToday ? 'text-gray-300' : 'text-gray-600'}`}
                    >
                      {formatDateBR(date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isToday ? (
                      <Badge className="bg-white text-black hover:bg-gray-100">
                        Hoje
                      </Badge>
                    ) : null}
                    {!isWorkingDay ? (
                      <Badge
                        variant="outline"
                        className="border-gray-400 text-gray-600"
                      >
                        Não útil
                      </Badge>
                    ) : null}
                  </div>
                </div>
              </CardHeader>
            </Card>

            {!isWorkingDay ? (
              <Card className="border-gray-200">
                <CardContent className="p-8 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                    <Calendar className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600">Dia não útil</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {filteredProfessionals.map((professional) => (
                  <Card key={professional.id} className="border-gray-200">
                    <CardHeader className="bg-gray-50 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-blue-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {professional.user.firstName}{' '}
                            {professional.user.lastName}
                          </p>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-3">
                      <div className="grid grid-cols-3 gap-2">
                        {timeSlots.map((time) => {
                          if (
                            isSlotOccupied(
                              professional.id,
                              selectedDayData.dayIndex,
                              time,
                            )
                          ) {
                            return null;
                          }

                          const appointment = getAppointmentForSlot(
                            professional.id,
                            selectedDayData.dayIndex,
                            time,
                          );
                          const blockedTime = isBlockedTime(
                            professional.blockedTimes,
                            date.toISOString().split('T')[0] ?? '',
                            time,
                          );

                          const isBlocked = !!blockedTime;

                          if (appointment) {
                            const StatusIcon =
                              STATUS_CONFIG[appointment.status].icon;

                            return (
                              <button
                                key={time}
                                onClick={() =>
                                  handleAppointmentClick(appointment)
                                }
                                className="col-span-3 rounded-lg border-2 border-blue-200 bg-blue-50 p-3 text-left transition-colors hover:bg-blue-100"
                                aria-label={`Agendamento com ${appointment.user.firstName} às ${appointment.startTime}`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0 flex-1">
                                    <div className="mb-1 flex items-center gap-2">
                                      <Clock className="h-3.5 w-3.5 text-blue-600" />
                                      <span className="text-sm text-blue-900">
                                        {appointment.startTime} -{' '}
                                        {appointment.endTime}
                                      </span>
                                    </div>
                                    <p className="truncate text-sm text-blue-900">
                                      {appointment.user.firstName}{' '}
                                      {appointment.user.lastName}
                                    </p>
                                    <p className="truncate text-xs text-blue-700">
                                      {appointment.service.name}
                                    </p>
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className="border-blue-200 bg-blue-100 text-blue-700"
                                  >
                                    <StatusIcon className="h-3 w-3" />
                                  </Badge>
                                </div>
                              </button>
                            );
                          }

                          return (
                            <button
                              key={time}
                              onClick={() =>
                                handleSlotClick(
                                  professional,
                                  selectedDayData.dayIndex,
                                  time,
                                  blockedTime,
                                )
                              }
                              className={`rounded-lg border-2 p-2 text-center text-xs font-medium transition-all ${
                                isBlocked
                                  ? 'border-gray-300 bg-gray-100 text-gray-500'
                                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                              }`}
                              aria-label={`${isBlocked ? 'Desbloquear' : 'Bloquear'} horário ${time} para ${professional.user.firstName}`}
                              aria-pressed={isBlocked}
                            >
                              {time}
                            </button>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Normal Mode View
  return (
    <div
      className="overflow-y-auto pb-28"
      style={{ height: CONTAINER_HEIGHTS.MOBILE_NORMAL_MODE }}
    >
      <div className="space-y-4 p-4">
        {dayViewData.map((dayData) => {
          if (!dayData) return null;

          const { date, dayIndex, isToday, isWorkingDay, label } = dayData;
          const dayAppointments = getDayAppointmentsForCalendar(date);

          return (
            <Card
              key={dayIndex}
              className={`border-gray-200 ${isToday ? 'ring-2 ring-black' : ''}`}
            >
              <CardHeader
                className={`pb-3 ${isToday ? 'bg-black text-white' : 'bg-gray-50'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle
                        className={`text-base ${isToday ? 'text-white' : ''}`}
                      >
                        {label}
                      </CardTitle>
                      {isWorkingDay && dayAppointments.length > 0 ? (
                        <Badge
                          variant="outline"
                          className={`${isToday ? 'bg-white/20 border-white/30 text-white' : 'bg-gray-200 border-gray-300 text-gray-700'}`}
                        >
                          {dayAppointments.length}
                        </Badge>
                      ) : null}
                    </div>
                    <p
                      className={`mt-1 text-sm ${isToday ? 'text-gray-300' : 'text-gray-600'}`}
                    >
                      {formatDateBR(date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isToday ? (
                      <Badge className="bg-white text-black hover:bg-gray-100">
                        Hoje
                      </Badge>
                    ) : null}
                    {!isWorkingDay ? (
                      <Badge
                        variant="outline"
                        className="border-gray-400 text-gray-600"
                      >
                        Não útil
                      </Badge>
                    ) : null}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4">
                {!isWorkingDay ? (
                  <div className="flex flex-col items-center gap-3 py-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                      <Calendar className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600">Dia não útil</p>
                  </div>
                ) : dayAppointments.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                      <Calendar className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600">Nenhum agendamento</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAdd()}
                      aria-label={`Adicionar agendamento para ${formatDateBR(date)}`}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dayAppointments.map((appointment) => {
                      const status = STATUS_CONFIG[appointment.status];
                      const StatusIcon = status.icon;

                      return (
                        <button
                          key={appointment.id}
                          onClick={() => handleAppointmentClick(appointment)}
                          className="w-full rounded-lg border-2 border-gray-200 bg-gray-50 p-4 text-left transition-all hover:border-blue-300 active:scale-[0.99]"
                          aria-label={`Agendamento com ${appointment.user.firstName} às ${appointment.startTime}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {appointment.startTime} -{' '}
                                  {appointment.endTime}
                                </span>
                              </div>
                              <div className="mb-1 flex items-center gap-2 text-gray-900">
                                <User className="h-4 w-4 text-gray-600" />
                                <span className="truncate">
                                  {appointment.user.firstName}{' '}
                                  {appointment.user.lastName}
                                </span>
                              </div>
                              <p className="ml-6 truncate text-sm text-gray-600">
                                {appointment.service.name}
                              </p>
                              {selectedProfessionalId === 'all' ? (
                                <p className="ml-6 mt-1 text-xs text-gray-500">
                                  {appointment.storeMember.user.firstName}{' '}
                                  {appointment.storeMember.user.lastName}
                                </p>
                              ) : null}
                              <div className="mt-2 flex items-center gap-2 text-sm text-gray-700">
                                <DollarSign className="h-4 w-4 text-gray-600" />
                                {formatPriceByCountry(appointment.service.price)}
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className={status.className}
                            >
                              <span className="flex items-center gap-1">
                                <StatusIcon className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">
                                  {status.label}
                                </span>
                              </span>
                            </Badge>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
});

AgendaGridMobileView.displayName = 'AgendaGridMobileView';
