'use client';

import {
  cn,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Spinner,
} from '@repo/ui';
import { Check } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import {
  MODULE_ACTION_CLASS,
  MODULE_FIELD_CLASS,
  MODULE_FIELD_LABEL_CLASS,
  MODULE_PRIMARY_ACTION_CLASS,
} from '../../../notifications-module/notifications-module.styles';
import { WhatsappConnectionChecks } from '../../whatsapp-connection-checks';
import type { IWhatsappSettingsSchema } from '../../whatsapp-settings.schema';
import { META_LINKS } from '../whatsapp-connect-guide.constants';
import type {
  IGuideVerifyStepProps,
  IGuideWebhookStepProps,
} from '../whatsapp-connect-guide.types';
import {
  ExternalLink,
  GuideEyebrow,
  GuideInstructions,
  GuideText,
  GuideTip,
  GuideTitle,
  GuideWarning,
  Kbd,
} from './guide-ui';

const REQUIREMENTS = [
  {
    title: 'Uma conta pessoal no Facebook',
    text: 'com a qual você vai entrar no painel da Meta.',
  },
  {
    title: 'Um portfólio empresarial na Meta',
    text: '(antigo Gerenciador de Negócios). Se ainda não tiver, ele é criado durante o passo 1.',
  },
  {
    title: 'Um número de telefone para a loja',
    text: 'que receba SMS ou ligação e que não esteja em uso no aplicativo WhatsApp comum.',
  },
  {
    title: 'Acesso de administrador',
    text: 'ao portfólio, para criar o usuário do sistema no passo 4.',
  },
];

export const GuideIntroStep = () => (
  <>
    <GuideEyebrow>Antes de começar</GuideEyebrow>
    <GuideTitle>Confira se você tem o que é preciso</GuideTitle>
    <GuideText>
      A conexão usa a API oficial do WhatsApp Business (Cloud API) da Meta. Você
      cria tudo na sua própria conta da Meta e só copia os dados para cá. A
      ServiceSnap nunca pede sua senha do Facebook.
    </GuideText>
    <ul className="grid gap-2.5">
      {REQUIREMENTS.map(({ title, text }) => (
        <li
          key={title}
          className="flex items-start gap-2.5 text-sm leading-normal text-[#2B2934]"
        >
          <span
            aria-hidden="true"
            className="mt-px grid size-[22px] shrink-0 place-items-center rounded-full bg-[#DFF2E7] text-[#0A5536]"
          >
            <Check className="size-3.5 stroke-[2.4]" />
          </span>
          <span>
            <b>{title}</b> {text}
          </span>
        </li>
      ))}
    </ul>
    <GuideWarning>
      Se o número já está no app WhatsApp ou WhatsApp Business do celular, você
      precisa apagar a conta nele antes de registrar na API. O histórico de
      conversas do app não vem junto.
    </GuideWarning>
  </>
);

export const GuideCreateAppStep = () => (
  <>
    <GuideEyebrow>Passo 1 · Meta for Developers</GuideEyebrow>
    <GuideTitle>Crie um app na Meta</GuideTitle>
    <GuideInstructions
      items={[
        <>
          Acesse{' '}
          <ExternalLink href={META_LINKS.developers}>
            developers.facebook.com
          </ExternalLink>
          , entre com seu Facebook e clique em <Kbd>Meus apps</Kbd>.
        </>,
        <>
          Clique em <Kbd>Criar app</Kbd> e escolha o caso de uso{' '}
          <b>Conectar-se com clientes pelo WhatsApp</b>.
        </>,
        <>
          Dê um nome ao app, por exemplo <b>Minha loja ServiceSnap</b>, e
          informe seu e-mail de contato.
        </>,
        <>
          Selecione o seu <b>portfólio empresarial</b>, ou crie um novo nesse
          momento, e conclua a criação.
        </>,
      ]}
    />
    <GuideTip>
      O app pode ficar em modo de desenvolvimento enquanto você configura. Ele
      precisa estar <b>publicado (Ativo)</b> para enviar mensagens a qualquer
      cliente.
    </GuideTip>
  </>
);

export const GuidePhoneStep = () => (
  <>
    <GuideEyebrow>Passo 2 · Número da loja</GuideEyebrow>
    <GuideTitle>Adicione e verifique o número</GuideTitle>
    <GuideInstructions
      items={[
        <>
          No menu do app, abra <Kbd>WhatsApp</Kbd> ›{' '}
          <Kbd>Configuração da API</Kbd>.
        </>,
        <>
          Na seção do número, clique em <Kbd>Adicionar número de telefone</Kbd>.
        </>,
        <>
          Preencha o <b>nome de exibição</b> (o nome que o cliente vê), a
          categoria e o fuso horário da loja.
        </>,
        <>
          Digite o número com DDD e confirme com o{' '}
          <b>código recebido por SMS ou ligação</b>.
        </>,
      ]}
    />
    <GuideTip>
      A Meta revisa o nome de exibição. Use o nome real da loja, igual ao da
      fachada ou do site, para a aprovação sair mais rápido.
    </GuideTip>
  </>
);

const ID_FIELDS = [
  {
    name: 'phoneNumberId',
    tag: 'A',
    label: 'Phone Number ID',
    placeholder: 'Cole aqui o ID do número',
  },
  {
    name: 'businessAccountId',
    tag: 'B',
    label: 'Business Account ID',
    placeholder: 'Cole aqui o ID da conta',
  },
] as const;

const IllustrationTag = ({ children }: { children: string }) => (
  <span
    aria-hidden="true"
    className="mr-2 inline-flex size-5 items-center justify-center rounded-full bg-[#9810FA] text-[11px] font-extrabold text-white"
  >
    {children}
  </span>
);

export const GuideIdsStep = () => {
  const { control } = useFormContext<IWhatsappSettingsSchema>();

  return (
    <>
      <GuideEyebrow>Passo 3 · Identificações</GuideEyebrow>
      <GuideTitle>Copie os dois IDs do número</GuideTitle>
      <GuideInstructions
        items={[
          <>
            Continue em <Kbd>WhatsApp</Kbd> › <Kbd>Configuração da API</Kbd> e
            selecione o número da loja no campo <b>De</b>.
          </>,
          <>
            Logo abaixo aparecem <b>Identificação do número de telefone</b> e{' '}
            <b>Identificação da conta do WhatsApp Business</b>.
          </>,
          <>
            Copie cada um e cole no campo correspondente aqui embaixo. São só
            números, com 15 ou 16 dígitos.
          </>,
        ]}
      />
      <figure className="grid gap-2.5 rounded-[18px] border border-dashed border-[#D8D5E0] bg-[#FAFAFC] p-[18px]">
        <div
          aria-hidden="true"
          className="grid gap-2 rounded-[14px] border border-[#E3E1EA] bg-white p-4 text-[13px]"
        >
          <div className="border-b border-[#F0EEF4] pb-2 font-bold">
            Configuração da API
          </div>
          <div className="flex justify-between gap-3 px-2.5 py-2 text-[#5F5C6E]">
            <span>De</span>
            <b className="font-semibold text-[#0B0B0F]">+55 11 90000-0000</b>
          </div>
          {[
            { tag: 'A', label: 'Identificação do número de telefone' },
            { tag: 'B', label: 'Identificação da conta do WhatsApp Business' },
          ].map(({ tag, label }) => (
            <div
              key={tag}
              className="flex justify-between gap-3 rounded-[10px] bg-[#FAF5FF] px-2.5 py-2 text-[#5F5C6E] outline-2 -outline-offset-2 outline-[#9810FA]"
            >
              <span>
                <IllustrationTag>{tag}</IllustrationTag>
                {label}
              </span>
              <b className="font-semibold text-[#0B0B0F] tabular-nums">
                1234567890…
              </b>
            </div>
          ))}
        </div>
        <figcaption className="text-xs font-semibold text-[#6F6C7E]">
          Ilustração simplificada. Os nomes dos campos podem aparecer em inglês:
          Phone number ID e WhatsApp Business Account ID.
        </figcaption>
      </figure>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-3">
        {ID_FIELDS.map(({ name, tag, label, placeholder }) => (
          <FormField
            key={name}
            control={control}
            name={name}
            render={({ field }) => (
              <FormItem className="gap-1.5">
                <FormLabel className={MODULE_FIELD_LABEL_CLASS}>
                  {tag} · {label} *
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    inputMode="numeric"
                    autoComplete="off"
                    aria-required="true"
                    placeholder={placeholder}
                    className={MODULE_FIELD_CLASS}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
      </div>
      <GuideWarning>
        Não confunda com o <b>ID do app</b>, que fica no topo do painel. Ele não
        serve aqui.
      </GuideWarning>
    </>
  );
};

export const GuideTokenStep = () => {
  const { control } = useFormContext<IWhatsappSettingsSchema>();

  return (
    <>
      <GuideEyebrow>Passo 4 · Token de acesso</GuideEyebrow>
      <GuideTitle>Gere um token permanente</GuideTitle>
      <GuideText>
        O token que aparece na tela de Configuração da API é temporário e expira
        em 24 horas. Para a loja não parar de enviar mensagens, gere um token de
        um usuário do sistema.
      </GuideText>
      <GuideInstructions
        items={[
          <>
            Acesse{' '}
            <ExternalLink href={META_LINKS.systemUsers}>
              business.facebook.com
            </ExternalLink>{' '}
            › <Kbd>Configurações</Kbd> › <Kbd>Usuários</Kbd> ›{' '}
            <Kbd>Usuários do sistema</Kbd>.
          </>,
          <>
            Clique em <Kbd>Adicionar</Kbd>, dê um nome como{' '}
            <b>servicesnap-api</b> e escolha a função <b>Administrador</b>.
          </>,
          <>
            Em <Kbd>Atribuir ativos</Kbd>, adicione o <b>app</b> do passo 1 e a{' '}
            <b>conta do WhatsApp</b>, ambos com controle total.
          </>,
          <>
            Clique em <Kbd>Gerar novo token</Kbd>, escolha o app, deixe a
            validade como <b>Nunca</b> e marque as permissões{' '}
            <b>whatsapp_business_messaging</b> e{' '}
            <b>whatsapp_business_management</b>.
          </>,
          <>
            Copie o token e cole aqui. A Meta mostra o token completo uma única
            vez.
          </>,
        ]}
      />
      <FormField
        control={control}
        name="accessToken"
        render={({ field }) => (
          <FormItem className="gap-1.5">
            <FormLabel className={MODULE_FIELD_LABEL_CLASS}>
              Access Token *
            </FormLabel>
            <FormDescription className="text-xs text-[#6F6C7E]">
              Começa com EAA.
            </FormDescription>
            <FormControl>
              <Input
                {...field}
                type="password"
                autoComplete="off"
                aria-required="true"
                placeholder="Cole aqui o token permanente"
                className={MODULE_FIELD_CLASS}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <GuideWarning>
        Trate o token como uma senha: não envie por e-mail nem por mensagem. Se
        ele vazar, gere outro na Meta e atualize aqui.
      </GuideWarning>
    </>
  );
};

const CopyField = ({
  label,
  value,
  onCopy,
  disabled,
}: {
  label: string;
  value: string;
  onCopy: () => void;
  disabled?: boolean;
}) => (
  <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
    <label className={cn('grid flex-1 gap-1.5', MODULE_FIELD_LABEL_CLASS)}>
      {label}
      <Input
        readOnly
        value={value}
        className={cn(MODULE_FIELD_CLASS, 'text-[#5F5C6E]')}
      />
    </label>
    <button
      type="button"
      onClick={onCopy}
      disabled={disabled}
      aria-label={`Copiar ${label}`}
      className={cn(MODULE_ACTION_CLASS, 'min-h-12 px-[18px]')}
    >
      Copiar
    </button>
  </div>
);

export const GuideWebhookStep = ({
  webhookUrl,
  webhookTokenLabel,
  hasWebhookToken,
  onCopyUrl,
  onCopyToken,
}: IGuideWebhookStepProps) => (
  <>
    <GuideEyebrow>Passo 5 · Webhook</GuideEyebrow>
    <GuideTitle>Ligue as respostas e o status das mensagens</GuideTitle>
    <GuideText>
      O webhook avisa a ServiceSnap quando um cliente responde ou quando uma
      mensagem é entregue ou lida. Copie os dois valores abaixo para o app da
      Meta.
    </GuideText>
    <CopyField label="URL de callback" value={webhookUrl} onCopy={onCopyUrl} />
    <CopyField
      label="Token de verificação"
      value={webhookTokenLabel}
      onCopy={onCopyToken}
      disabled={!hasWebhookToken}
    />
    <GuideInstructions
      items={[
        <>
          No app da Meta, abra <Kbd>WhatsApp</Kbd> › <Kbd>Configuração</Kbd> e,
          em Webhook, clique em <Kbd>Editar</Kbd>.
        </>,
        <>
          Cole a <b>URL de callback</b> e o <b>token de verificação</b> copiados
          acima e clique em <Kbd>Verificar e salvar</Kbd>.
        </>,
        <>
          Em <Kbd>Campos do webhook</Kbd>, clique em <Kbd>Gerenciar</Kbd> e
          assine o campo <b>messages</b>.
        </>,
      ]}
    />
  </>
);

export const GuideVerifyStep = ({
  onVerify,
  isVerifying,
  hasResult,
  checks,
  onReviewStep,
}: IGuideVerifyStepProps) => (
  <>
    <GuideEyebrow>Passo 6 · Teste</GuideEyebrow>
    <GuideTitle>
      {hasResult
        ? 'Quase lá: ajuste o que está marcado'
        : 'Verifique a conexão'}
    </GuideTitle>
    <GuideText>
      {hasResult
        ? 'Conferimos cada credencial com a Meta. Corrija o que está marcado e verifique de novo. O que já está certo fica salvo.'
        : 'Vamos salvar as credenciais, ativar o WhatsApp e conferir cada uma com a Meta.'}
    </GuideText>

    {hasResult && checks.length ? (
      <WhatsappConnectionChecks
        checks={checks}
        renderReview={(step) => (
          <button
            type="button"
            onClick={() => onReviewStep(step)}
            className={MODULE_ACTION_CLASS}
          >
            Rever o passo {step}
          </button>
        )}
      />
    ) : null}

    {isVerifying ? (
      <p
        role="status"
        className="flex items-center gap-2 text-sm text-[#5F5C6E]"
      >
        <Spinner />
        Conferindo com a Meta...
      </p>
    ) : null}

    <div>
      <button
        type="button"
        onClick={onVerify}
        disabled={isVerifying}
        className={cn(MODULE_PRIMARY_ACTION_CLASS, 'min-h-12 px-[18px]')}
      >
        {hasResult ? 'Verificar de novo' : 'Verificar conexão'}
      </button>
    </div>

    {hasResult ? (
      <GuideTip>
        Enquanto o WhatsApp não estiver conectado, confirmações e lembretes
        continuam saindo por e-mail.
      </GuideTip>
    ) : null}
  </>
);
