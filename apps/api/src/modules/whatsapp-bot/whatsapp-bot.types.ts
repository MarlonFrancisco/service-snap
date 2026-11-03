export interface IWhatsappWebhookMessage {
  object: string;
  from: string;
  id: string;
  timestamp: string;
  type: string;
  text: {
    body: string;
  };
  interactive: {
    type: 'list_reply';
    button_reply: {
      id: string;
      title: string;
    };
    list_reply: {
      id: string;
      title: string;
      description: string;
    };
  };
}

export interface IWhatsappWebhookStatus {
  id: string;
  status: string;
  timestamp: string;
  recipient_id: string;
  errors?: {
    code: number;
    title: string;
    message?: string;
    error_data?: {
      details: string;
    };
  }[];
}

export interface IWhatsappWebhook {
  object: string;
  entry: {
    id: string;
    changes: {
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts: [
          {
            profile: {
              name: string;
            };
            wa_id: string;
          },
        ];
        messages: IWhatsappWebhookMessage[];
        statuses?: IWhatsappWebhookStatus[];
      };
      field: string;
    }[];
  }[];
}
