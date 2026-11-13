'use client';

import {
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@repo/ui';
import { Clock, MessageCircle } from 'lucide-react';
import {
  PROFILE_DIALOG_BUTTON_CLASS,
  PROFILE_DIALOG_BUTTON_PRIMARY_CLASS,
  PROFILE_DIALOG_CLASS,
  PROFILE_DIALOG_CLOSE_CLASS,
  PROFILE_HINT_CLASS,
} from '../../../profile.styles';
import type { TPolicyBlockedDialogConfig } from './policy-blocked-dialog.types';

/** A política da loja barrou o cliente: explica e leva para o WhatsApp. */
export const PolicyBlockedDialog = ({
  block,
  onClose,
}: TPolicyBlockedDialogConfig) => (
  <Dialog open={!!block} onOpenChange={(open) => !open && onClose()}>
    <DialogContent
      role="alertdialog"
      className={cn(
        PROFILE_DIALOG_CLASS,
        PROFILE_DIALOG_CLOSE_CLASS,
        'gap-4 rounded-[28px] border-0 p-[30px] sm:max-w-[460px]',
      )}
    >
      <span className="grid size-14 place-items-center rounded-full bg-[#FFF1E0] text-[#6E3B00]">
        <Clock className="size-[26px]" strokeWidth={2} aria-hidden />
      </span>
      <DialogTitle className="pr-11 text-2xl font-extrabold tracking-[-0.025em]">
        {block?.title}
      </DialogTitle>
      <DialogDescription className="text-[15px] leading-[1.55] text-[#0B0B0F]">
        {block?.message}
      </DialogDescription>
      <p className={PROFILE_HINT_CLASS}>{block?.hint}</p>
      <div className="mt-1 grid gap-2.5">
        {block?.whatsAppUrl && (
          <a
            href={block.whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={PROFILE_DIALOG_BUTTON_PRIMARY_CLASS}
          >
            <MessageCircle
              className="size-[18px]"
              strokeWidth={1.9}
              aria-hidden
            />
            Falar com a loja no WhatsApp
          </a>
        )}
        <button
          type="button"
          onClick={onClose}
          className={PROFILE_DIALOG_BUTTON_CLASS}
        >
          Fechar
        </button>
      </div>
    </DialogContent>
  </Dialog>
);
