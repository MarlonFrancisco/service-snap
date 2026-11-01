import { cn, Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/ui';
import { Mail, MessageCircle, Smartphone, type LucideIcon } from 'lucide-react';
import { PARTNER_PORTAL_CLASS } from '../../../../partner.styles';
import type { TNotificationPreviewType } from '../../notifications-module.types';
import { useNotificationPreviewModal } from './notification-preview-modal.hook';
import type { TNotificationPreviewModalConfig } from './notification-preview-modal.types';

const PREVIEW_CHANNEL: Record<
  TNotificationPreviewType,
  { icon: LucideIcon; title: string }
> = {
  email: { icon: Mail, title: 'Prévia do lembrete por e-mail' },
  sms: { icon: Smartphone, title: 'Prévia do lembrete por SMS' },
  whatsapp: { icon: MessageCircle, title: 'Prévia do lembrete por WhatsApp' },
};

const PREVIEW_NOTE_CLASS = 'mt-2.5 text-[13px] leading-normal text-[#5F5C6E]';
const PREVIEW_COUNTER_CLASS = 'mt-2 text-right text-xs text-[#5F5C6E]';
const PREVIEW_SENDER_CLASS = 'mb-3 text-center text-[13px] font-bold';

type TPreviewContent = ReturnType<typeof useNotificationPreviewModal>;

const EMAIL_DETAILS = (storeAddress: string) => [
  { label: 'Serviço', value: '[Serviço]' },
  { label: 'Profissional', value: '[Profissional]' },
  { label: 'Data e horário', value: '[Dia, data] às [hh:mm]' },
  { label: 'Valor', value: '[R$ 0,00]' },
  { label: 'Local', value: storeAddress },
];

const EmailPreview = ({
  storeName,
  storeAddress,
  storePhone,
  message,
}: TPreviewContent) => (
  <article className="rounded-[24px] bg-white p-6 shadow-[0_12px_40px_rgba(15,12,30,0.1)]">
    <p className="mb-3.5 border-b border-[#F0EEF4] pb-3 text-[13px] text-[#5F5C6E]">
      Assunto: Lembrete do seu agendamento em {storeName}
    </p>
    <h3 className="text-[21px] leading-[1.2] font-extrabold tracking-[-0.02em]">
      Seu horário está chegando
    </h3>
    <p className="mt-2.5 text-sm leading-normal text-[#2C2A36]">
      Olá, [Nome do cliente]. Este é um lembrete do seu agendamento.
    </p>
    <dl className="mt-3.5 grid gap-2 rounded-[14px] bg-[#F7F6FA] p-3.5 text-sm">
      {EMAIL_DETAILS(storeAddress).map(({ label, value }) => (
        <div key={label} className="flex justify-between gap-3">
          <dt className="text-[#5F5C6E]">{label}</dt>
          <dd className="text-right font-semibold">{value}</dd>
        </div>
      ))}
    </dl>
    {message ? (
      <p className="mt-2.5 text-sm leading-normal break-words text-[#2C2A36]">
        {message}
      </p>
    ) : null}
    <p className="mt-2.5 text-sm leading-normal text-[#2C2A36]">
      Precisa falar com a loja? {storePhone}
    </p>
  </article>
);

const SmsPreview = ({
  smsText,
  smsLength,
  smsSegmentLength,
  smsParts,
}: TPreviewContent) => (
  <div>
    <div className="rounded-[28px] bg-white px-3.5 py-[18px] shadow-[0_12px_40px_rgba(15,12,30,0.1)]">
      <p className={PREVIEW_SENDER_CLASS}>ServiceSnap</p>
      <p className="rounded-[18px_18px_18px_4px] bg-[#EBE9F0] px-3.5 py-3 text-sm leading-[1.45] break-words">
        {smsText}
      </p>
      <p className={PREVIEW_COUNTER_CLASS}>
        {smsLength}/{smsSegmentLength} caracteres
      </p>
    </div>
    <p className={PREVIEW_NOTE_CLASS}>
      SMS é só texto: sem formatação e com limite por mensagem.
      {smsParts > 1 ? ` Este texto seria enviado em ${smsParts} partes.` : ''}
    </p>
  </div>
);

const WhatsappPreview = ({
  storeName,
  storeAddress,
  message,
}: TPreviewContent) => (
  <div>
    <div className="rounded-[28px] bg-[#E6EFE6] px-3.5 py-[18px] shadow-[0_12px_40px_rgba(15,12,30,0.1)]">
      <p className={PREVIEW_SENDER_CLASS}>{storeName}</p>
      <div className="rounded-[4px_16px_16px_16px] bg-white px-3.5 py-3 text-sm leading-normal break-words">
        <strong className="mb-1 block">Lembrete do seu horário</strong>
        <p>
          Olá, [Nome do cliente]. Seu agendamento é [Dia, data] às [hh:mm], com
          [Profissional].
        </p>
        <p>Serviço: [Serviço]</p>
        <p>Local: {storeAddress}</p>
        {message ? <p className="mt-3">{message}</p> : null}
      </div>
      <p className={PREVIEW_COUNTER_CLASS}>{message.length}/300 caracteres</p>
    </div>
    <p className={PREVIEW_NOTE_CLASS}>
      O texto final depende do template aprovado na Meta.
    </p>
  </div>
);

const PREVIEW_CONTENT: Record<
  TNotificationPreviewType,
  (content: TPreviewContent) => React.JSX.Element
> = {
  email: EmailPreview,
  sms: SmsPreview,
  whatsapp: WhatsappPreview,
};

export const NotificationPreviewModal = ({
  isOpen,
  type,
  customMessage,
  onClose,
}: TNotificationPreviewModalConfig) => {
  const content = useNotificationPreviewModal(customMessage);
  const { icon: Icon, title } = PREVIEW_CHANNEL[type];
  const Preview = PREVIEW_CONTENT[type];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        aria-describedby={undefined}
        className={cn(
          PARTNER_PORTAL_CLASS,
          'max-h-[90vh] overflow-y-auto rounded-[24px] border-0 bg-[#F4F3F7] p-5 sm:max-w-md',
        )}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 pr-6 text-left text-lg leading-snug font-extrabold tracking-[-0.02em]">
            <Icon className="size-5 shrink-0 stroke-[1.8]" aria-hidden="true" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <Preview {...content} />
      </DialogContent>
    </Dialog>
  );
};
