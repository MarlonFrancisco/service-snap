export type TWidgetColorId = 'black' | 'purple' | 'green' | 'orange';

export type TWidgetColor = {
  id: TWidgetColorId;
  label: string;
  /** Vai no `data-color` do snippet. */
  value: string;
  /** Classe Tailwind de fundo da amostra e da prévia. */
  className: string;
};

export type TWidgetPosition = 'right' | 'left';

export type TWidgetPositionOption = {
  value: TWidgetPosition;
  label: string;
};

export type TWidgetSnippetInput = {
  origin: string;
  storeId: string;
  label: string;
  color: string;
  position: TWidgetPosition;
};
