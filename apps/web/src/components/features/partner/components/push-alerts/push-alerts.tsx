'use client';

import { Spinner } from '@repo/ui';
import { Bell } from 'lucide-react';
import { MODULE_ACTION_CLASS } from '../notifications-module/notifications-module.styles';
import { usePushAlerts } from './push-alerts.hook';
import {
  PUSH_ACTIVE_BADGE_CLASS,
  PUSH_ACTIVE_DOT_CLASS,
  PUSH_BANNER_CLASS,
  PUSH_BANNER_GHOST_CLASS,
  PUSH_BANNER_ICON_CLASS,
  PUSH_BANNER_PRIMARY_CLASS,
  PUSH_CARD_CLASS,
  PUSH_CARD_TEXT_CLASS,
  PUSH_CARD_TITLE_CLASS,
  PUSH_HIDE_CLASS,
} from './push-alerts.styles';

export const PushAlerts = () => {
  const {
    view,
    handleActivate,
    isActivating,
    handleDeactivate,
    isDeactivating,
    handleDismiss,
  } = usePushAlerts();

  if (view === 'hidden') return null;

  if (view === 'prompt') {
    return (
      <section aria-label="Ativar avisos" className={PUSH_BANNER_CLASS}>
        <span aria-hidden="true" className={PUSH_BANNER_ICON_CLASS}>
          <Bell className="size-[22px] stroke-[1.8]" />
        </span>
        <div className="min-w-0 flex-[1_1_320px]">
          <h2 className="text-[15px] font-bold">
            Saiba na hora quando um cliente agendar
          </h2>
          <p className="text-[13px] text-[#D6D4DE]">
            Receba um aviso neste aparelho a cada agendamento novo e a cada
            cancelamento.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={handleActivate}
            disabled={isActivating}
            className={PUSH_BANNER_PRIMARY_CLASS}
          >
            {isActivating ? (
              <>
                <Spinner />
                Ativando...
              </>
            ) : (
              'Ativar avisos'
            )}
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            disabled={isActivating}
            className={PUSH_BANNER_GHOST_CLASS}
          >
            Agora não
          </button>
        </div>
      </section>
    );
  }

  if (view === 'active') {
    return (
      <section aria-label="Avisos neste aparelho" className={PUSH_CARD_CLASS}>
        <span className={PUSH_ACTIVE_BADGE_CLASS}>
          <span aria-hidden="true" className={PUSH_ACTIVE_DOT_CLASS} />
          Ativados
        </span>
        <div className="min-w-0 flex-[1_1_280px]">
          <h2 className={PUSH_CARD_TITLE_CLASS}>
            Avisos ativados neste aparelho
          </h2>
          <p className={PUSH_CARD_TEXT_CLASS}>
            Cada computador ou celular é ativado separadamente.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={handleDeactivate}
            disabled={isDeactivating}
            className={MODULE_ACTION_CLASS}
          >
            {isDeactivating ? 'Desativando...' : 'Desativar neste aparelho'}
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className={PUSH_HIDE_CLASS}
          >
            Ocultar
          </button>
        </div>
      </section>
    );
  }

  const isBlocked = view === 'blocked';

  return (
    <section aria-label="Avisos neste aparelho" className={PUSH_CARD_CLASS}>
      <div className="min-w-0 flex-[1_1_320px]">
        <h2 className={PUSH_CARD_TITLE_CLASS}>
          {isBlocked
            ? 'Avisos bloqueados pelo navegador'
            : 'No iPhone, instale o app primeiro'}
        </h2>
        {isBlocked ? (
          <p className={PUSH_CARD_TEXT_CLASS}>
            Você recusou os avisos antes. Para receber, libere as notificações
            nas configurações do site (o cadeado ao lado do endereço) e volte
            aqui.
          </p>
        ) : (
          <p className={PUSH_CARD_TEXT_CLASS}>
            O iPhone só mostra avisos de sites instalados na tela inicial. No
            Safari, toque em <b>Compartilhar</b> e depois em{' '}
            <b>Adicionar à Tela de Início</b>. Abra pelo ícone e ative os
            avisos.
          </p>
        )}
      </div>
      <button type="button" onClick={handleDismiss} className={PUSH_HIDE_CLASS}>
        Ocultar
      </button>
    </section>
  );
};
