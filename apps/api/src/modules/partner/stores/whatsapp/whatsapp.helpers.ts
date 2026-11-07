import type {
  TMetaDebugToken,
  TMetaError,
  TMetaPhoneNumber,
  TWhatsappCheck,
} from './whatsapp.types';

export const WHATSAPP_REQUIRED_SCOPES = [
  'whatsapp_business_messaging',
  'whatsapp_business_management',
] as const;

/** Token expirado, revogado ou inválido. */
export const META_INVALID_TOKEN_CODE = 190;
/** Objeto não existe ou o token não tem acesso a ele (ID errado, na prática). */
export const META_INVALID_PARAMETER_CODE = 100;

/**
 * Resultado de uma chamada à Graph API que não lança: cada conferência decide o que fazer.
 * `data` existe quando `ok`; `error`, quando não.
 */
export type TSettled<T> = { ok: boolean; data?: T; error?: TMetaError };

export const extractMetaError = (error: any): TMetaError => ({
  code: error?.response?.data?.error?.code,
  message: error?.response?.data?.error?.message || error?.message,
});

export const settle = async <T>(request: Promise<T>): Promise<TSettled<T>> => {
  try {
    return { ok: true, data: await request };
  } catch (error) {
    return { ok: false, error: extractMetaError(error) };
  }
};

const isTokenRejected = (result: TSettled<unknown>) =>
  !result.ok && result.error?.code === META_INVALID_TOKEN_CODE;

const PENDING_ON_TOKEN = 'Conferimos assim que o token for corrigido.';

export const buildTokenCheck = (
  debug: TSettled<TMetaDebugToken>,
  phone: TSettled<TMetaPhoneNumber>,
): TWhatsappCheck => {
  if (!debug.ok) {
    if (isTokenRejected(debug) || isTokenRejected(phone)) {
      return {
        key: 'token',
        state: 'error',
        metaCode: META_INVALID_TOKEN_CODE,
        message:
          'A Meta recusou o token: ele expirou ou foi revogado. Gere um token pelo usuário do sistema, com validade Nunca.',
      };
    }
    // Sem o debug_token, o token só é confirmado se a consulta do número passou.
    return phone.ok
      ? { key: 'token', state: 'ok', message: 'Token aceito pela Meta.' }
      : {
          key: 'token',
          state: 'pending',
          message: 'Não foi possível conferir o token agora.',
        };
  }

  const { is_valid, expires_at, scopes = [] } = debug.data;

  if (!is_valid) {
    return {
      key: 'token',
      state: 'error',
      metaCode: META_INVALID_TOKEN_CODE,
      message:
        'A Meta diz que o token não é mais válido. Gere um token pelo usuário do sistema, com validade Nunca.',
    };
  }

  const missing = WHATSAPP_REQUIRED_SCOPES.filter(
    (scope) => !scopes.includes(scope),
  );
  if (missing.length) {
    return {
      key: 'token',
      state: 'error',
      message: `Faltam permissões no token: ${missing.join(' e ')}. Gere um novo marcando as duas.`,
    };
  }

  // `expires_at` 0 significa "nunca expira"; o token temporário da Configuração da API vale 24 horas.
  if (expires_at) {
    const expiresOn = new Date(expires_at * 1000).toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      dateStyle: 'short',
      timeStyle: 'short',
    });
    return {
      key: 'token',
      state: 'warning',
      message: `Este token expira em ${expiresOn}. Troque por um token do usuário do sistema, com validade Nunca, para os envios não pararem.`,
    };
  }

  return {
    key: 'token',
    state: 'ok',
    message: 'Válido, sem data de expiração e com as duas permissões.',
  };
};

export const buildIdsCheck = (
  phone: TSettled<TMetaPhoneNumber>,
  accountPhones: TSettled<{ id?: string }[]>,
  phoneNumberId: string,
): TWhatsappCheck => {
  if (isTokenRejected(phone) || isTokenRejected(accountPhones)) {
    return { key: 'ids', state: 'pending', message: PENDING_ON_TOKEN };
  }

  if (!phone.ok) {
    return {
      key: 'ids',
      state: 'error',
      metaCode: phone.error.code,
      message:
        phone.error.code === META_INVALID_PARAMETER_CODE
          ? 'A Meta não encontrou esse Phone Number ID. Confira se não copiou o ID do app no lugar dele.'
          : phone.error.message ||
            'Não foi possível conferir o Phone Number ID.',
    };
  }

  if (!accountPhones.ok) {
    return {
      key: 'ids',
      state: 'error',
      metaCode: accountPhones.error.code,
      message:
        accountPhones.error.code === META_INVALID_PARAMETER_CODE
          ? 'A Meta não encontrou esse Business Account ID.'
          : accountPhones.error.message ||
            'Não foi possível conferir o Business Account ID.',
    };
  }

  if (!accountPhones.data.some((item) => item.id === phoneNumberId)) {
    return {
      key: 'ids',
      state: 'error',
      message:
        'O número existe, mas não pertence a essa conta do WhatsApp Business. Copie os dois IDs da mesma tela.',
    };
  }

  const { display_phone_number, verified_name } = phone.data;
  return {
    key: 'ids',
    state: 'ok',
    message: `Número ${display_phone_number || 'informado'} encontrado na conta ${verified_name || 'do WhatsApp Business'}.`,
  };
};

export const buildWebhookCheck = (
  subscribedApps: TSettled<unknown[]>,
): TWhatsappCheck => {
  if (isTokenRejected(subscribedApps)) {
    return { key: 'webhook', state: 'pending', message: PENDING_ON_TOKEN };
  }

  if (!subscribedApps.ok) {
    return {
      key: 'webhook',
      state: 'pending',
      metaCode: subscribedApps.error.code,
      message: 'Não foi possível conferir o webhook agora.',
    };
  }

  return subscribedApps.data.length
    ? {
        key: 'webhook',
        state: 'ok',
        message: 'O app recebe as respostas e o status das mensagens.',
      }
    : {
        key: 'webhook',
        state: 'error',
        message:
          'Nenhum app recebe os eventos dessa conta. Confira a URL e o token do webhook e assine o campo messages.',
      };
};

const APPROVED_NAME_STATUSES = ['APPROVED', 'AVAILABLE_WITHOUT_REVIEW'];
const DECLINED_NAME_STATUSES = ['DECLINED', 'EXPIRED'];

export const buildDisplayNameCheck = (
  phone: TSettled<TMetaPhoneNumber>,
): TWhatsappCheck => {
  if (!phone.ok) {
    return {
      key: 'displayName',
      state: 'pending',
      message: 'Conferimos depois que o número for encontrado.',
    };
  }

  const { name_status, verified_name } = phone.data;

  if (!name_status || APPROVED_NAME_STATUSES.includes(name_status)) {
    return {
      key: 'displayName',
      state: 'ok',
      message: verified_name
        ? `Aprovado: ${verified_name}.`
        : 'Aprovado pela Meta.',
    };
  }

  if (DECLINED_NAME_STATUSES.includes(name_status)) {
    return {
      key: 'displayName',
      state: 'error',
      message:
        'A Meta recusou o nome de exibição. Ajuste o nome no gerenciador do WhatsApp usando o nome real da loja.',
    };
  }

  return {
    key: 'displayName',
    state: 'warning',
    message:
      'Em análise na Meta. Não impede a conexão: até a aprovação, as mensagens podem mostrar só o número.',
  };
};
