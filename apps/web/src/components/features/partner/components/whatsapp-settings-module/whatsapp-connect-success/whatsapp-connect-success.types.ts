import type { IWhatsappStatusResponse } from '@/types/api/whatsapp.types';

export interface IWhatsappConnectSuccessProps {
  status: IWhatsappStatusResponse;
  storeId: string;
}
