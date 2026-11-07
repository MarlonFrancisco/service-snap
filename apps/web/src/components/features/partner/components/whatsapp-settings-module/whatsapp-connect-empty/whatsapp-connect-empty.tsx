import { cn } from '@repo/ui';
import { Bell, Check, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import {
  MODULE_ACTION_CLASS,
  MODULE_BADGE_CLASS,
  MODULE_BADGE_TONE_CLASS,
  MODULE_CARD_CLASS,
  MODULE_CARD_TITLE_CLASS,
  MODULE_PRIMARY_ACTION_CLASS,
} from '../../notifications-module/notifications-module.styles';
import {
  getGuideStepHref,
  WHATSAPP_GUIDE_ROUTE,
} from '../whatsapp-connect-guide';
import { WHATSAPP_GUIDE_STEPS } from '../whatsapp-connect-guide/whatsapp-connect-guide.constants';

const LARGE_ACTION_CLASS = 'min-h-12 px-5 text-sm';

const BENEFITS = [
  {
    Icon: Check,
    title: 'Confirmação automática',
    text: 'Cada novo agendamento gera uma mensagem de confirmação para o cliente.',
  },
  {
    Icon: Bell,
    title: 'Lembretes que reduzem faltas',
    text: 'Envio com a antecedência que você escolher em Notificações.',
  },
  {
    Icon: MessageSquare,
    title: 'Respostas do cliente',
    text: 'O cliente pode confirmar ou pedir para remarcar respondendo a mensagem.',
  },
];

const CHAT_PREVIEW = [
  {
    fromStore: true,
    text: 'Olá, Ana! Seu horário de Corte está confirmado para amanhã, 14h.',
    meta: 'Sua loja · 09:12',
  },
  { fromStore: false, text: 'Perfeito, obrigado!', meta: '09:14' },
  {
    fromStore: true,
    text: 'Lembrete: seu horário é hoje às 14h.',
    meta: 'Sua loja · 11:00',
  },
];

export const WhatsappConnectEmpty = () => (
  <div className="grid max-w-[960px] gap-4">
    <section className="flex flex-wrap items-center gap-7 rounded-[26px] border border-[#EBE9F0] p-[22px] sm:p-8">
      <div className="grid flex-[999_1_380px] gap-3.5">
        <span
          className={cn(
            MODULE_BADGE_CLASS,
            MODULE_BADGE_TONE_CLASS.neutral,
            'justify-self-start',
          )}
        >
          Não conectado
        </span>
        <h2 className="text-[28px] leading-[1.15] font-extrabold tracking-[-0.03em]">
          Confirme e lembre agendamentos pelo WhatsApp da sua loja
        </h2>
        <p className="text-[15px] leading-relaxed text-[#5F5C6E]">
          Conecte o número oficial da loja à ServiceSnap. As confirmações e os
          lembretes saem com o nome da loja, pela API oficial da Meta.
        </p>
        <div className="mt-1 flex flex-wrap gap-2">
          <Link
            href={WHATSAPP_GUIDE_ROUTE}
            className={cn(MODULE_PRIMARY_ACTION_CLASS, LARGE_ACTION_CLASS)}
          >
            Conectar WhatsApp
          </Link>
          <Link
            href={getGuideStepHref(3)}
            className={cn(MODULE_ACTION_CLASS, LARGE_ACTION_CLASS)}
          >
            Já tenho as credenciais
          </Link>
        </div>
      </div>
      <div
        aria-label="Exemplo de conversa"
        role="img"
        className="grid flex-[1_1_260px] gap-2 rounded-[22px] bg-[#F4F3F7] p-[18px]"
      >
        {CHAT_PREVIEW.map(({ fromStore, text, meta }) => (
          <div
            key={meta}
            className={cn(
              'max-w-[88%] px-3.5 py-2.5 text-[13px] leading-normal',
              fromStore
                ? 'rounded-[16px_16px_16px_4px] bg-white text-[#2B2934]'
                : 'justify-self-end rounded-[16px_16px_4px_16px] bg-[#0B0B0F] text-white',
            )}
          >
            {text}
            <small
              className={cn(
                'mt-1 block text-[11px]',
                fromStore ? 'text-[#6F6C7E]' : 'text-[#C9C6D4]',
              )}
            >
              {meta}
            </small>
          </div>
        ))}
      </div>
    </section>

    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-3">
      {BENEFITS.map(({ Icon, title, text }) => (
        <div
          key={title}
          className="grid content-start gap-2.5 rounded-[22px] border border-[#EBE9F0] p-5"
        >
          <span
            aria-hidden="true"
            className="grid size-10 place-items-center rounded-[12px] bg-[#F4F3F7] text-[#9810FA]"
          >
            <Icon className="size-5 stroke-[1.8]" />
          </span>
          <h3 className="text-base font-extrabold">{title}</h3>
          <p className="text-sm leading-relaxed text-[#5F5C6E]">{text}</p>
        </div>
      ))}
    </div>

    <section className={MODULE_CARD_CLASS}>
      <h3 className={MODULE_CARD_TITLE_CLASS}>Como funciona a conexão</h3>
      <p className="text-sm leading-relaxed text-[#5F5C6E]">
        Você usa a API oficial da Meta, na sua própria conta. O guia mostra cada
        tela e leva cerca de 15 minutos.
      </p>
      <ol className="grid grid-cols-[repeat(auto-fit,minmax(min(150px,100%),1fr))] gap-2.5">
        {WHATSAPP_GUIDE_STEPS.slice(1).map(({ title, hint }, index) => (
          <li key={title}>
            <Link
              href={getGuideStepHref(index + 1)}
              className="grid h-full gap-1 rounded-[16px] bg-[#FAFAFC] p-3.5 text-[13px] font-bold transition-colors hover:bg-[#F4F3F7]"
            >
              <span className="text-xs font-extrabold text-[#9810FA]">
                {index + 1}
              </span>
              {title}
              <span className="text-xs font-medium text-[#6F6C7E]">{hint}</span>
            </Link>
          </li>
        ))}
      </ol>
    </section>

    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] bg-[#FAFAFC] px-[22px] py-[18px] text-sm text-[#2B2934]">
      <span>
        Prefere não configurar agora? Os lembretes continuam saindo por e-mail.
      </span>
      <Link
        href="/partner/notifications"
        className="font-bold underline underline-offset-[3px]"
      >
        Ver notificações
      </Link>
    </div>
  </div>
);
