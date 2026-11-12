import type { User } from '../../../users/user.entity';
import type { WhatsappConfig } from '../whatsapp/whatsapp.entity';

/** WhatsApp para quem entrou pelo bot; e-mail para quem entrou pelo site. */
export type TWaitlistChannel = 'whatsapp' | 'email';

/** `notified` é final: o aviso sai uma vez por entrada. */
export type TWaitlistStatus = 'waiting' | 'notified' | 'cancelled';

export type TJoinWaitlist = {
  storeId: string;
  serviceId: string;
  /** `null` ou ausente: qualquer profissional que faça o serviço. */
  storeMemberId?: string | null;
  date: string;
  customer: User;
  channel: TWaitlistChannel;
};

/** Entrada como sai para o cliente, sem dados de outras pessoas. */
export type TWaitlistEntryResponse = {
  id: string;
  date: string;
  status: TWaitlistStatus;
  channel: TWaitlistChannel;
  service: { id: string; name: string; duration: number };
  storeMember: { id: string; name: string } | null;
};

/** O que vai no aviso de vaga, nos dois canais. */
export type TWaitlistNotice = {
  customerName: string;
  storeName: string;
  scheduleDay: string;
  serviceName: string;
  professionalName: string;
  /** Primeiros horários livres no momento do aviso, "09:30, 10:00 e 14:00". */
  freeTimes: string;
  bookingLink: string;
};

/** Como a loja manda o aviso pelo WhatsApp; sem ele, só por e-mail. */
export type TWhatsappSender = {
  config: WhatsappConfig;
  /** Com o template aprovado o aviso chega a qualquer hora; sem, só na janela de 24h. */
  templateApproved: boolean;
};
