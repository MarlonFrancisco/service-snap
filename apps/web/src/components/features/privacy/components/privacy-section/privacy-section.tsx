'use client';

import { cn, Spinner } from '@repo/ui';
import { Info } from 'lucide-react';
import Link from 'next/link';
import { PLAN_HREF } from '../../privacy.helpers';
import {
  PRIVACY_BUTTON_CLASS,
  PRIVACY_CARD_CLASS,
  PRIVACY_CARD_TITLE_CLASS,
  PRIVACY_DANGER_BUTTON_CLASS,
  PRIVACY_ITEM_CLASS,
  PRIVACY_LINK_CLASS,
  PRIVACY_WARNING_NOTE_CLASS,
} from '../../privacy.styles';
import { DeleteAccountDialog } from './delete-account-dialog';
import { usePrivacySection } from './privacy-section.hook';

/** Direitos do titular (LGPD): baixar os dados e excluir a conta. */
export const PrivacySection = () => {
  const {
    handleDownload,
    isDownloading,
    isDeleteOpen,
    setIsDeleteOpen,
    openDelete,
    hasSubscriptionConflict,
    handleSubscriptionConflict,
  } = usePrivacySection();

  return (
    <section aria-labelledby="privacy-section-title" className="grid gap-3.5">
      <div className={PRIVACY_CARD_CLASS}>
        <h3 id="privacy-section-title" className={PRIVACY_CARD_TITLE_CLASS}>
          Seus dados
        </h3>

        <div className={PRIVACY_ITEM_CLASS}>
          <div className="flex min-w-0 flex-[1_1_260px] flex-col gap-0.5">
            <b className="text-sm">Baixar meus dados</b>
            <span className="text-[13px] text-[#5F5C6E]">
              Um arquivo com perfil, agendamentos, avaliações, favoritos, fichas
              de saúde, pacotes e pagamentos registrados pelas lojas
            </span>
          </div>
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className={PRIVACY_BUTTON_CLASS}
          >
            {isDownloading ? (
              <>
                <Spinner />
                Gerando...
              </>
            ) : (
              'Baixar arquivo'
            )}
          </button>
        </div>

        <div className={cn(PRIVACY_ITEM_CLASS, 'border-[#F3C9C4]')}>
          <div className="flex min-w-0 flex-[1_1_260px] flex-col gap-0.5">
            <b className="text-sm">Excluir minha conta</b>
            <span className="text-[13px] text-[#5F5C6E]">
              Apaga seus dados pessoais de vez
            </span>
          </div>
          <button
            type="button"
            onClick={openDelete}
            className={PRIVACY_DANGER_BUTTON_CLASS}
          >
            Excluir conta
          </button>
        </div>

        {hasSubscriptionConflict ? (
          <div role="alert" className={PRIVACY_WARNING_NOTE_CLASS}>
            <Info aria-hidden="true" className="mt-px size-5 shrink-0" />
            <p>
              <b>Cancele a assinatura antes de excluir a conta.</b> Assim o
              plano termina no fim do período, sem cobrança nova.{' '}
              <Link href={PLAN_HREF} className={PRIVACY_LINK_CLASS}>
                Ir para o plano
              </Link>
            </p>
          </div>
        ) : null}
      </div>

      <DeleteAccountDialog
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onSubscriptionConflict={handleSubscriptionConflict}
      />
    </section>
  );
};
