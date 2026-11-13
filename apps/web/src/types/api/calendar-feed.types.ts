/** Link `.ics` da agenda de um profissional, assinado no Google Agenda, iPhone ou Outlook. */
export interface ICalendarFeed {
  url: string;
  createdAt: string;
}

export interface ICalendarFeedRevokeResponse {
  revoked: boolean;
}

export type TCalendarFeedTarget = {
  storeId: string;
  memberId: string;
};
