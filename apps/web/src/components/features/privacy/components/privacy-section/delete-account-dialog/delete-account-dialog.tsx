'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Spinner,
} from '@repo/ui';
import { DELETE_ACCOUNT_CONFIRM_WORD } from '../../../privacy.helpers';
import {
  PRIVACY_BUTTON_CLASS,
  PRIVACY_DANGER_SOLID_BUTTON_CLASS,
  PRIVACY_DIALOG_CLASS,
  PRIVACY_ERROR_CLASS,
  PRIVACY_FIELD_CLASS,
  PRIVACY_TEXT_CLASS,
} from '../../../privacy.styles';
import { useDeleteAccountDialog } from './delete-account-dialog.hook';
import type { TDeleteAccountDialogConfig } from './delete-account-dialog.types';

const CONSEQUENCES = [
  'Seu nome, e-mail, telefone, foto, favoritos e fichas de saúde são apagados.',
  'Seus próximos horários são cancelados.',
  'Os atendimentos que você já fez continuam nas lojas, sem seu nome, para o caixa delas fechar.',
  'Se você tem loja sem assinatura, ela sai do ar.',
];

export const DeleteAccountDialog = (config: TDeleteAccountDialogConfig) => {
  const {
    confirmation,
    setConfirmation,
    canConfirm,
    submitError,
    isDeleting,
    handleOpenChange,
    handleSubmit,
  } = useDeleteAccountDialog(config);

  return (
    <Dialog open={config.isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className={PRIVACY_DIALOG_CLASS}>
        <DialogHeader className="text-left">
          <DialogTitle className="pr-10 text-[22px] font-extrabold tracking-[-0.02em]">
            Excluir sua conta?
          </DialogTitle>
          <DialogDescription className={PRIVACY_TEXT_CLASS}>
            Isso não tem volta. Ao excluir:
          </DialogDescription>
        </DialogHeader>

        <ul className="m-0 list-disc pl-5 text-sm leading-[1.7] text-[#3D3A4A]">
          {CONSEQUENCES.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className={PRIVACY_TEXT_CLASS}>
          Se entrar de novo com o mesmo e-mail, será uma conta nova, sem
          histórico.
        </p>

        <form noValidate onSubmit={handleSubmit} className="grid gap-4">
          <label className="grid gap-1.5 text-[13px] font-bold">
            Digite {DELETE_ACCOUNT_CONFIRM_WORD} para confirmar
            <Input
              type="text"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              className={PRIVACY_FIELD_CLASS}
            />
          </label>

          {submitError ? (
            <p role="alert" className={PRIVACY_ERROR_CLASS}>
              {submitError}
            </p>
          ) : null}

          <div className="flex flex-wrap justify-end gap-2.5">
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              disabled={isDeleting}
              className={PRIVACY_BUTTON_CLASS}
            >
              Voltar
            </button>
            <button
              type="submit"
              disabled={!canConfirm || isDeleting}
              className={PRIVACY_DANGER_SOLID_BUTTON_CLASS}
            >
              {isDeleting ? (
                <>
                  <Spinner />
                  Excluindo...
                </>
              ) : (
                'Excluir minha conta'
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
