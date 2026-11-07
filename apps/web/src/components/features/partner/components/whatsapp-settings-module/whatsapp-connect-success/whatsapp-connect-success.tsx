'use client';

import { cn, Input, Spinner } from '@repo/ui';
import { Bell, Check, CreditCard, FileText, Info } from 'lucide-react';
import Link from 'next/link';
import {
  MODULE_ACTION_CLASS,
  MODULE_CARD_CLASS,
  MODULE_CARD_TITLE_CLASS,
  MODULE_FIELD_CLASS,
  MODULE_FIELD_LABEL_CLASS,
  MODULE_PRIMARY_ACTION_CLASS,
} from '../../notifications-module/notifications-module.styles';
import { WhatsappConnectionChecks } from '../whatsapp-connection-checks';
import { WHATSAPP_SETTINGS_ROUTE } from '../whatsapp-connect-guide/whatsapp-connect-guide.constants';
import { useWhatsappConnectSuccess } from './whatsapp-connect-success.hook';
import type { IWhatsappConnectSuccessProps } from './whatsapp-connect-success.types';

const LARGE_ACTION_CLASS = 'min-h-12 px-[18px]';

const NEXT_STEPS = [
  {
    Icon: FileText,
    title: 'Modelo de mensagem do lembrete',
    text: 'Fora da janela de 24 horas, a Meta só entrega modelos aprovados. Crie o modelo do lembrete e acompanhe a análise.',
    href: '/partner/notifications/whatsapp-settings',
    action: 'Ver modelo',
  },
  {
    Icon: Bell,
    title: 'Canal dos lembretes',
    text: 'Defina se os lembretes saem pelo WhatsApp ou também por e-mail, e com quanta antecedência.',
    href: '/partner/notifications',
    action: 'Configurar',
  },
  {
    Icon: CreditCard,
    title: 'Forma de pagamento na Meta',
    text: 'Conversas iniciadas pela loja são cobradas pela Meta, direto na sua conta. Cadastre um cartão no gerenciador do WhatsApp para os envios não serem bloqueados.',
  },
];

export const WhatsappConnectSuccess = ({
  status,
  storeId,
}: IWhatsappConnectSuccessProps) => {
  const { testPhone, setTestPhone, handleSendTest, isSendTestPending } =
    useWhatsappConnectSuccess(storeId);
  const warnings = (status.checks ?? []).filter(
    (check) => check.state === 'warning',
  );

  return (
    <div className="grid max-w-[880px] gap-4">
      <section className="grid justify-items-center gap-3 rounded-[26px] border border-[#EBE9F0] px-5 py-10 text-center sm:px-7">
        <span
          aria-hidden="true"
          className="grid size-16 place-items-center rounded-full bg-[#DFF2E7] text-[#0A5536]"
        >
          <Check className="size-8 stroke-[2.2]" />
        </span>
        <h2 className="text-[28px] font-extrabold tracking-[-0.03em]">
          WhatsApp conectado
        </h2>
        <p className="max-w-[560px] text-[15px] leading-relaxed text-[#5F5C6E]">
          As credenciais foram conferidas com a Meta e o WhatsApp está ativo
          para a loja.
        </p>
        <dl className="mt-2 grid w-full grid-cols-[repeat(auto-fit,minmax(min(170px,100%),1fr))] gap-3 rounded-[18px] bg-[#FAFAFC] p-4 text-left text-sm">
          <div>
            <dt className="text-xs text-[#5F5C6E]">Número</dt>
            <dd className="mt-0.5 font-bold">
              {status.displayPhoneNumber || 'Não informado'}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[#5F5C6E]">Nome de exibição</dt>
            <dd className="mt-0.5 font-bold">
              {status.verifiedName || 'Não informado'}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[#5F5C6E]">Qualidade</dt>
            <dd className="mt-0.5 font-bold">
              {status.qualityRating || 'Não informada'}
            </dd>
          </div>
        </dl>
        <Link
          href={WHATSAPP_SETTINGS_ROUTE}
          className={cn(
            MODULE_PRIMARY_ACTION_CLASS,
            LARGE_ACTION_CLASS,
            'mt-2',
          )}
        >
          Ir para o WhatsApp
        </Link>
      </section>

      {warnings.length ? <WhatsappConnectionChecks checks={warnings} /> : null}

      <section className={MODULE_CARD_CLASS}>
        <h3 className={MODULE_CARD_TITLE_CLASS}>Envie uma mensagem de teste</h3>
        <p className="text-sm leading-normal text-[#5F5C6E]">
          Mande antes um &quot;oi&quot; do seu celular para o número da loja. A
          Meta só libera mensagem livre para quem falou com a loja nas últimas
          24 horas.
        </p>
        <form
          onSubmit={handleSendTest}
          className="flex flex-col gap-2 sm:flex-row sm:items-end"
        >
          <label
            className={cn('grid flex-1 gap-1.5', MODULE_FIELD_LABEL_CLASS)}
          >
            Número para o teste
            <Input
              inputMode="tel"
              value={testPhone}
              onChange={(event) => setTestPhone(event.target.value)}
              placeholder="5511999999999"
              className={MODULE_FIELD_CLASS}
            />
          </label>
          <button
            type="submit"
            disabled={isSendTestPending || !testPhone.trim()}
            className={cn(MODULE_ACTION_CLASS, LARGE_ACTION_CLASS)}
          >
            {isSendTestPending ? (
              <>
                <Spinner />
                Enviando...
              </>
            ) : (
              'Enviar teste'
            )}
          </button>
        </form>
      </section>

      <section className={MODULE_CARD_CLASS}>
        <h3 className={MODULE_CARD_TITLE_CLASS}>Próximos passos</h3>
        <ul className="grid gap-2">
          {NEXT_STEPS.map(({ Icon, title, text, href, action }) => (
            <li
              key={title}
              className="flex flex-wrap items-center justify-between gap-3 rounded-[16px] border border-[#EBE9F0] px-4 py-3.5"
            >
              <div className="flex flex-[1_1_320px] items-start gap-3">
                <span
                  aria-hidden="true"
                  className="grid size-9 shrink-0 place-items-center rounded-[12px] bg-[#F4F3F7] text-[#9810FA]"
                >
                  <Icon className="size-[18px] stroke-[1.8]" />
                </span>
                <div>
                  <b className="block text-sm">{title}</b>
                  <span className="text-[13px] leading-normal text-[#5F5C6E]">
                    {text}
                  </span>
                </div>
              </div>
              {href ? (
                <Link href={href} className={MODULE_ACTION_CLASS}>
                  {action}
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <div className="flex gap-3 rounded-[16px] bg-[#F4F3F7] px-4 py-3.5 text-sm leading-normal text-[#2B2934]">
        <Info
          aria-hidden="true"
          className="mt-px size-5 shrink-0 stroke-[1.8]"
        />
        <span>
          Se um dia você gerar um token novo ou trocar de número na Meta,
          atualize em WhatsApp › Credenciais da API.
        </span>
      </div>
    </div>
  );
};
