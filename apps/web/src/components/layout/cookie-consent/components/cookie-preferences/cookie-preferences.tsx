'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  Switch,
} from '@repo/ui';
import { Lock } from 'lucide-react';
import Link from 'next/link';
import {
  COOKIE_CATEGORIES,
  PRIVACY_POLICY_PATH,
} from '../../cookie-consent.constants';
import { useCookiePreferences } from './cookie-preferences.hook';

const TITLE = 'Preferências de cookies';
const DESCRIPTION =
  'Escolha o que podemos usar. Você pode mudar isso quando quiser em “Preferências de cookies”, no rodapé.';

const SECONDARY_BUTTON_CLASS =
  'h-12 rounded-full border border-[#E3E1EA] bg-white px-5 text-sm font-bold whitespace-nowrap text-[#0B0B0F] transition-colors hover:bg-[#F4F3F7]';
const PRIMARY_BUTTON_CLASS =
  'h-12 rounded-full bg-[#0B0B0F] px-5 text-sm font-bold whitespace-nowrap text-white transition-colors hover:bg-[#2B2B2B]';

export const CookiePreferences = () => {
  const {
    isOpen,
    isMobile,
    draft,
    handleOpenChange,
    handleToggle,
    handleSave,
    handleAcceptAll,
    handleRejectAll,
  } = useCookiePreferences();

  const categories = (
    <ul className="px-5 md:px-8">
      {COOKIE_CATEGORIES.map((category) => {
        const titleId = `cookie-category-${category.id}`;

        return (
          <li
            key={category.id}
            className="flex items-start justify-between gap-4 border-t border-[#EBE9F0] py-[18px] md:gap-6 md:py-5"
          >
            <div>
              <h3
                id={titleId}
                className="text-[15px] font-bold text-[#0B0B0F] md:text-base"
              >
                {category.title}
              </h3>
              <p className="mt-1.5 text-[13px] leading-[1.55] text-[#5F5C6E] md:text-sm">
                {category.description}
              </p>
              {category.tool ? (
                <p className="mt-2 text-xs font-semibold text-[#5F5C6E]">
                  {category.tool}
                </p>
              ) : null}
            </div>

            {category.id === 'essential' ? (
              <span className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-[#F4F3F7] px-3 text-xs font-bold whitespace-nowrap text-[#0B0B0F]">
                <Lock className="h-3 w-3" aria-hidden="true" />
                Sempre ativos
              </span>
            ) : (
              <Switch
                aria-labelledby={titleId}
                checked={draft[category.id]}
                onCheckedChange={(checked) =>
                  handleToggle(category.id, checked)
                }
                className="mt-1 h-8 w-[52px] data-[state=checked]:bg-[#0B0B0F] data-[state=unchecked]:bg-[#D6D3DE] [&>span]:size-6 [&>span]:data-[state=checked]:translate-x-[22px] [&>span]:data-[state=unchecked]:translate-x-[2px]"
              />
            )}
          </li>
        );
      })}
    </ul>
  );

  const privacyLink = (
    <Link
      href={PRIVACY_POLICY_PATH}
      className="text-sm font-semibold text-[#0B0B0F] underline"
      onClick={() => handleOpenChange(false)}
    >
      Política de Privacidade
    </Link>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={handleOpenChange}>
        <DrawerContent className="max-h-[92vh]">
          <DrawerHeader className="px-5 pt-4 text-left">
            <DrawerTitle className="text-xl font-extrabold tracking-[-0.02em] text-[#0B0B0F]">
              {TITLE}
            </DrawerTitle>
            <DrawerDescription className="text-sm leading-[1.55] text-[#5F5C6E]">
              {DESCRIPTION}
            </DrawerDescription>
          </DrawerHeader>

          <div className="overflow-y-auto">{categories}</div>

          <div className="flex flex-col gap-2.5 border-t border-[#EBE9F0] px-5 pt-4 pb-7">
            <button type="button" className={PRIMARY_BUTTON_CLASS} onClick={handleSave}>
              Salvar escolhas
            </button>
            <div className="grid grid-cols-2 gap-2.5">
              <button type="button" className={SECONDARY_BUTTON_CLASS} onClick={handleRejectAll}>
                Rejeitar todos
              </button>
              <button type="button" className={SECONDARY_BUTTON_CLASS} onClick={handleAcceptAll}>
                Aceitar todos
              </button>
            </div>
            <div className="pt-1 text-center">{privacyLink}</div>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-0 overflow-hidden rounded-[28px] border-0 p-0 sm:max-w-[640px]">
        <DialogHeader className="px-8 pt-7 pr-16 text-left">
          <DialogTitle className="text-2xl font-extrabold tracking-[-0.025em] text-[#0B0B0F]">
            {TITLE}
          </DialogTitle>
          <DialogDescription className="text-sm leading-[1.6] text-[#5F5C6E]">
            {DESCRIPTION}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-5">{categories}</div>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#EBE9F0] bg-[#FBFBFC] px-8 pt-5 pb-7">
          {privacyLink}
          <div className="flex flex-wrap gap-2">
            <button type="button" className={SECONDARY_BUTTON_CLASS} onClick={handleRejectAll}>
              Rejeitar todos
            </button>
            <button type="button" className={SECONDARY_BUTTON_CLASS} onClick={handleSave}>
              Salvar escolhas
            </button>
            <button type="button" className={PRIMARY_BUTTON_CLASS} onClick={handleAcceptAll}>
              Aceitar todos
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
