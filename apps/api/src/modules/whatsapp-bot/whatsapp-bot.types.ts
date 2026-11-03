export interface IWhatsappWebhookMessage {
  object: string;
  from: string;
  id: string;
  timestamp: string;
  type: string;
  text: {
    body: string;
  };
  interactive: {
    type: 'list_reply';
    button_reply: {
      id: string;
      title: string;
    };
    list_reply: {
      id: string;
      title: string;
      description: string;
    };
  };
}

export interface IWhatsappWebhookStatus {
  id: string;
  status: string;
  timestamp: string;
  recipient_id: string;
  errors?: {
    code: number;
    title: string;
    message?: string;
    error_data?: {
      details: string;
    };
  }[];
}

export interface IWhatsappWebhook {
  object: string;
  entry: {
    id: string;
    changes: {
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts: [
          {
            profile: {
              name: string;
            };
            wa_id: string;
          },
        ];
        messages: IWhatsappWebhookMessage[];
        statuses?: IWhatsappWebhookStatus[];
      };
      field: string;
    }[];
  }[];
}

export enum BotState {
  MENU = 'MENU',
  SELECT_SERVICE = 'SELECT_SERVICE',
  SELECT_PROFESSIONAL = 'SELECT_PROFESSIONAL',
  SELECT_DAY = 'SELECT_DAY',
  SELECT_TIME = 'SELECT_TIME',
  CONFIRM_BOOKING = 'CONFIRM_BOOKING',
  MY_APPOINTMENTS = 'MY_APPOINTMENTS',
  APPOINTMENT_ACTIONS = 'APPOINTMENT_ACTIONS',
  CONFIRM_CANCEL = 'CONFIRM_CANCEL',
  ASK_EMAIL = 'ASK_EMAIL',
  VERIFY_EMAIL = 'VERIFY_EMAIL',
}

export type TBotCommand = 'menu' | 'exit' | 'back' | 'book' | 'appointments';

/** O que chegou: `reply` é o id da opção tocada; `text`, o que a pessoa vê. */
export interface IBotInput {
  reply?: string;
  text: string;
  command?: TBotCommand;
}

export interface IBotSlot {
  time: string;
  memberId: string;
}

export interface IBotPerson {
  id: string;
  name: string;
}

export interface IBotAppointment {
  id: string;
  customerId: string;
  date: string;
  time: string;
  service: { id: string; name: string; duration: number; price?: number };
  professional: IBotPerson;
}

/** Código enviado por e-mail: guarda só o hash, nunca o código. */
export interface IBotEmailVerification {
  email: string;
  codeHash: string;
  expiresAt: number;
  attempts: number;
  sends: number;
}

/** Tudo numa chave só no Redis, para a conversa nunca ficar pela metade. */
export interface IBotSession {
  state: BotState;
  offset?: number;
  service?: { id: string; name: string; duration: number; price?: number };
  /** `null` é "qualquer profissional": quem atende sai do horário escolhido. */
  professionalId?: string | null;
  professionalSkipped?: boolean;
  professionals?: IBotPerson[];
  date?: string;
  slots?: IBotSlot[];
  slot?: IBotSlot;
  /** E-mail já ligado ao cliente, para onde vão confirmação e lembrete. */
  customerEmail?: string;
  emailSkipped?: boolean;
  emailVerification?: IBotEmailVerification;
  appointments?: IBotAppointment[];
  appointmentId?: string;
  rescheduleId?: string;
}
