export type TCustomerAnamnesisPanelConfig = {
  customerId: string;
};

/** Ficha na lista do cliente, sem nenhuma resposta. */
export type TCustomerAnamnesisRow = {
  id: string;
  formName: string;
  /** "Qua, 18/11 · Ana" */
  meta: string;
  /** Texto do atendimento para a leitura: "Qua, 18/11 às 10:00 com Ana". */
  appointmentLabel: string | null;
};
