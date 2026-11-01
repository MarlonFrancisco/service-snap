export interface IStoreCardData {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  /** Preço médio formatado; `null` quando a loja não tem serviços com preço. */
  averagePrice: string | null;
  gallery: string[];
  services?: Array<{ id: string; name: string }>;
}

export interface StoreCardProps {
  /** Dados da loja a ser exibida */
  store: IStoreCardData;
  /** Indica se o card está selecionado */
  isSelected?: boolean;
  /** Callback quando o card é clicado */
  onClick?: () => void;
  /** Mostra o badge de disponibilidade */
  showAvailabilityBadge?: boolean;
  /** Mostra o badge do serviço principal */
  showServiceBadge?: boolean;
  /** Proporção da imagem (largura / altura) */
  imageAspectRatio?: number;
}
