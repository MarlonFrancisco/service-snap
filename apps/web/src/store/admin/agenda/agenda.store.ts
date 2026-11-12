import { create } from 'zustand';
import {
  AGENDA_DAYS,
  AGENDA_WORKING_DAY_KEYS,
  INITIAL_APPOINTMENT_FORM,
} from './agenda.constants';
import { getTodayDayIndex, getWeekOffsetForDate } from './agenda.helpers';
import type { IAgendaStore } from './agenda.types';

export const useAgendaStore = create<IAgendaStore>((set) => ({
  currentWeek: 0,
  currentMonth: 0,
  selectedProfessional: 'all',
  selectedAppointment: undefined,
  detailsAppointment: INITIAL_APPOINTMENT_FORM,
  isAddAppointmentOpen: false,
  isFocusMode: false,
  isBlockMode: false,
  isBlockDialogOpen: false,
  isHoursPanelOpen: false,
  rescheduleVisit: undefined,
  selectedBlockedTime: undefined,
  draggedVisit: undefined,
  dropTargetKey: undefined,
  pendingReschedule: undefined,
  selectedDayIndex: 0,
  viewMode: 'week',
  appointments: [],
  professionals: [],
  services: [],
  days: AGENDA_DAYS,
  workingDayKeys: AGENDA_WORKING_DAY_KEYS,

  setCurrentWeek: (currentWeek) => set({ currentWeek }),
  setCurrentMonth: (currentMonth) => set({ currentMonth }),
  setSelectedProfessional: (selectedProfessional) =>
    set({ selectedProfessional }),
  setIsAddAppointmentOpen: ({ isAddAppointmentOpen, selectedAppointment }) =>
    set({ isAddAppointmentOpen, selectedAppointment }),
  setDetailsAppointment: (detailsAppointment = INITIAL_APPOINTMENT_FORM) =>
    set({ detailsAppointment }),
  setIsFocusMode: (isFocusMode) => set({ isFocusMode }),
  setIsBlockMode: (isBlockMode) => set({ isBlockMode }),
  setIsBlockDialogOpen: (isBlockDialogOpen) => set({ isBlockDialogOpen }),
  setIsHoursPanelOpen: (isHoursPanelOpen) => set({ isHoursPanelOpen }),
  setRescheduleVisit: (rescheduleVisit) => set({ rescheduleVisit }),
  setSelectedBlockedTime: (selectedBlockedTime) => set({ selectedBlockedTime }),
  setDraggedVisit: (draggedVisit) => set({ draggedVisit }),
  setDropTargetKey: (dropTargetKey) => set({ dropTargetKey }),
  setPendingReschedule: (pendingReschedule) => set({ pendingReschedule }),
  setSelectedDayIndex: (selectedDayIndex) => set({ selectedDayIndex }),
  setViewMode: (viewMode) => set({ viewMode }),
  openDay: (date) =>
    set({
      viewMode: 'day',
      currentWeek: getWeekOffsetForDate(date),
      selectedDayIndex: getTodayDayIndex(date),
    }),
}));
