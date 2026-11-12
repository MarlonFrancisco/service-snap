const DISMISS_KEY_PREFIX = 'ssnap.whatsapp-bot-home.dismissed.';

const getDismissKey = (storeId: string) => `${DISMISS_KEY_PREFIX}${storeId}`;

/** Sem acesso ao armazenamento (aba anônima, bloqueio), o aviso volta a aparecer. */
export const readWhatsappBotHomeDismissed = (storeId: string): boolean => {
  try {
    return window.localStorage.getItem(getDismissKey(storeId)) === '1';
  } catch {
    return false;
  }
};

export const persistWhatsappBotHomeDismissed = (storeId: string) => {
  try {
    window.localStorage.setItem(getDismissKey(storeId), '1');
  } catch {
    // O aviso some nesta visita mesmo sem conseguir guardar.
  }
};
