export type TWhatsappBotPromoConfig = {
  /** `botLink` do status da conexão. */
  botLink: string;
  displayPhoneNumber?: string;
  className?: string;
};

export type TUseWhatsappBotPromoConfig = Pick<
  TWhatsappBotPromoConfig,
  'botLink' | 'displayPhoneNumber'
>;
