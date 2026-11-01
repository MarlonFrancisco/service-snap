'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  cn,
} from '@repo/ui';
import { ChevronRight, Loader2, Shield, Trash2 } from 'lucide-react';
import {
  PROFILE_DIALOG_CLASS,
  PROFILE_DIALOG_CONFIRM_CLASS,
  PROFILE_DIALOG_DISMISS_CLASS,
  PROFILE_FOCUS_CLASS,
  PROFILE_SECTION_LEAD_CLASS,
  PROFILE_SECTION_TITLE_CLASS,
} from '../../profile.styles';
import { useSettingsSection } from './settings-section.hook';

export const SettingsSection = () => {
  const {
    isOpenDisabledAccountAlert,
    setIsOpenDisabledAccountAlert,
    handleDeleteAccount,
    isDeletingUser,
  } = useSettingsSection();

  return (
    <>
      <section>
        <h2 className={PROFILE_SECTION_TITLE_CLASS}>Privacidade e dados</h2>
        <p className={PROFILE_SECTION_LEAD_CLASS}>
          Gerencie suas informações pessoais
        </p>

        <button
          type="button"
          onClick={() => setIsOpenDisabledAccountAlert(true)}
          className={cn(
            'flex w-full items-center justify-between gap-4 rounded-[22px] border border-[#E3E1EA] p-4 text-left transition-colors hover:bg-[#FEF2F2] md:rounded-3xl',
            PROFILE_FOCUS_CLASS,
          )}
        >
          <span className="flex min-w-0 items-center gap-3.5">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#FEF2F2] text-[#DC2626]">
              <Trash2 className="size-5" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-[15px] font-bold text-[#DC2626]">
                Desativar conta
              </span>
              <span className="mt-0.5 block text-sm text-[#5F5C6E]">
                Desativar sua conta e dados
              </span>
            </span>
          </span>
          <ChevronRight className="size-5 shrink-0 text-[#DC2626]" aria-hidden />
        </button>

        <div className="mt-4 flex items-start gap-3.5 rounded-[14px] bg-[#F7F6FA] p-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white">
            <Shield className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h3 className="text-[15px] font-bold">Seus dados estão seguros</h3>
            <p className="mt-0.5 text-sm leading-normal text-[#5F5C6E]">
              Protegemos suas informações com criptografia de ponta a ponta e
              nunca as compartilhamos sem sua permissão.
            </p>
          </div>
        </div>
      </section>

      <AlertDialog open={isOpenDisabledAccountAlert}>
        <AlertDialogContent className={PROFILE_DIALOG_CLASS}>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar conta</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja desativar sua conta?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setIsOpenDisabledAccountAlert(false)}
              className={PROFILE_DIALOG_DISMISS_CLASS}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeletingUser}
              className={PROFILE_DIALOG_CONFIRM_CLASS}
            >
              {isDeletingUser ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                'Desativar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
