export type TDeleteAccountDialogConfig = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  /** Dono com assinatura ativa: a tela mostra o aviso de cancelar o plano. */
  onSubscriptionConflict: () => void;
};
