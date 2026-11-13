export type TRetentionConfirmDialogConfig = {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  pendingLabel: string;
  cancelLabel?: string;
  tone?: 'primary' | 'danger';
  isPending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};
