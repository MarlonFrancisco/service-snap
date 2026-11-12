export type TEmailConfirmationCode = {
  code: string;
  storeName?: string;
  minutes: number;
};

export type TEmailLayout = {
  title: string;
  preheader: string;
  footerNote: string;
};

export type TScheduleCustomerEmail = {
  storeName: string;
  customerName: string;
  serviceName: string;
  professionalName: string;
  scheduleDay: string;
  scheduleTime: string;
  storeAddress: string;
  storePhone: string;
};

export type TScheduleReminderEmail = TScheduleCustomerEmail & {
  price: string;
  customMessage?: string;
  manageLink: string;
};

export type TScheduleConfirmedEmail = TScheduleCustomerEmail & {
  price: string;
  calendarLink: string;
  manageLink: string;
};

export type TScheduleChangedEmail = TScheduleCustomerEmail & {
  previousSchedule?: string;
  calendarLink: string;
  manageLink: string;
};

export type TScheduleCancelledEmail = TScheduleCustomerEmail & {
  cancelledByCustomer: boolean;
  bookingLink: string;
};

export type TScheduleStoreEmail = {
  storeName: string;
  customerName: string;
  customerPhone: string;
  serviceName: string;
  professionalName: string;
  scheduleDay: string;
  scheduleTime: string;
  agendaLink: string;
};

export type TScheduleNewBookingEmail = TScheduleStoreEmail & {
  price: string;
  createdByStore: boolean;
};

export type TTrialEndingEmail = {
  planName: string;
  chargeDate: string;
  amount: string;
  cardLast4?: string;
  daysLeftLabel: string;
  manageLink: string;
};

export type TSubscriptionCancelScheduledEmail = {
  planName: string;
  accessUntil: string;
  manageLink: string;
};

export type TWaitlistSlotEmail = {
  customerName: string;
  storeName: string;
  scheduleDay: string;
  serviceName: string;
  professionalName: string;
  freeTimes: string;
  bookingLink: string;
};
