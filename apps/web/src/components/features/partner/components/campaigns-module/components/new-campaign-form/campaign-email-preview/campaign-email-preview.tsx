import type { TCampaignEmailPreviewConfig } from './campaign-email-preview.types';

/** Prévia do e-mail de campanha, como o cliente recebe (só leitura). */
export const CampaignEmailPreview = ({
  storeName,
  customerName,
  message,
  lastVisit,
  year,
}: TCampaignEmailPreviewConfig) => (
  <div className="grid gap-3.5 rounded-[20px] bg-surface-2 p-4 sm:p-6">
    <p className="m-0 text-[13px] leading-normal text-ink-muted [&_b]:text-ink">
      <b>De:</b> {storeName} via ServiceSnap
      <br />
      <b>Assunto:</b> {customerName}, sentimos sua falta em {storeName}
      <br />
      <b>Prévia:</b> Faz tempo desde a sua última visita. Que tal marcar um
      horário?
    </p>
    <article className="overflow-hidden rounded-[24px] bg-white">
      <header className="px-6 pt-7 text-lg font-extrabold tracking-[-0.02em] sm:px-10">
        {storeName}
      </header>
      <div className="px-6 pt-6 pb-8 sm:px-10">
        <span className="mb-3 inline-block rounded-full bg-brand-tint px-[11px] py-1 text-xs font-bold text-brand-strong">
          Faz tempo que você não vem
        </span>
        <h1 className="m-0 text-[28px] leading-[1.15] font-extrabold tracking-[-0.03em]">
          Olá, {customerName}
        </h1>
        <p className="mt-3 text-[15px] leading-[1.55] whitespace-pre-line text-ink-body">
          {message}
        </p>
        <div className="mt-6 flex flex-wrap gap-2.5">
          <span className="inline-flex min-h-12 items-center justify-center rounded-full bg-ink px-6 text-sm font-bold text-white">
            Marcar um horário
          </span>
        </div>
        <p className="mt-3 text-[15px] leading-[1.55] text-ink-body">
          Sua última visita foi em {lastVisit}.
        </p>
      </div>
      <footer className="grid gap-1.5 border-t border-surface-3 px-6 pt-5 pb-7 text-xs leading-normal text-ink-muted sm:px-10">
        <p className="m-0">
          Você recebeu este e-mail porque já foi atendido em {storeName}, que
          usa o ServiceSnap para agendamentos.
        </p>
        <p className="m-0">
          Não quer mais receber mensagens de {storeName}?{' '}
          <span className="underline">Sair da lista</span>
        </p>
        <p className="m-0">© ServiceSnap Inc. {year}</p>
      </footer>
    </article>
  </div>
);
