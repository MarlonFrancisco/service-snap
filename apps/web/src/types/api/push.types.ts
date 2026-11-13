export interface IPushPublicKeyResponse {
  enabled: boolean;
  publicKey: string | null;
}

export interface IPushSubscriptionPayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface IPushUnsubscribePayload {
  endpoint: string;
}

/** O que o aparelho permite antes de qualquer pedido de permissão. */
export type TPushEnvironment =
  | 'unsupported'
  | 'ios-needs-install'
  | 'supported';
