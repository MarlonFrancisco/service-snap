export type TCreateHolidayVariables = {
  storeId: string;
  holiday: { date: string; name?: string };
};

export type TDeleteHolidayVariables = {
  storeId: string;
  holidayId: string;
};
