export type TWhatsappTemplateStatusConfig = {
  storeId: string;
  isConnected: boolean;
};

export type TWhatsappTemplateTone = 'success' | 'waiting' | 'danger';

export type TWhatsappTemplateView = {
  tone: TWhatsappTemplateTone;
  title: string;
  description: string;
  canCreate?: boolean;
};
