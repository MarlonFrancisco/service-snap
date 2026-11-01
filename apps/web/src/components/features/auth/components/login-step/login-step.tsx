import { cn, Input } from '@repo/ui';
import Link from 'next/link';
import {
  AUTH_ICON_BUTTON_CLASS,
  AUTH_INPUT_CLASS,
  AUTH_LABEL_CLASS,
  AUTH_LEGAL_CLASS,
  AUTH_LINK_CLASS,
  AUTH_PRIMARY_BUTTON_CLASS,
  AUTH_STEP_CLASS,
  AUTH_SUBTITLE_CLASS,
  AUTH_TITLE_CLASS,
} from '../../auth.styles';
import { GoogleAuth } from '../google-auth';
import { useLoginStep } from './login-step.hook';
import type { TLoginStepConfig } from './login-step.types';

export function LoginStep({ onNext, onClose }: TLoginStepConfig) {
  const { contact, isLoading, isValidContact, setContact, handleContinue } =
    useLoginStep({ onNext });

  return (
    <section className={cn(AUTH_STEP_CLASS, 'gap-[18px]')}>
      <span
        aria-hidden="true"
        className="relative block size-10 shrink-0 rounded-[11px] border-4 border-current after:absolute after:right-[18%] after:bottom-[16%] after:size-[30%] after:rounded-full after:bg-[#9810FA] after:content-['']"
      />

      <div>
        <h2 className={AUTH_TITLE_CLASS}>Bem-vindo ao ServiceSnap</h2>
        <p className={AUTH_SUBTITLE_CLASS}>
          Conecte-se aos melhores serviços perto de você ou gerencie seu negócio
          de forma simples.
        </p>
      </div>

      <label className={AUTH_LABEL_CLASS}>
        Endereço de e-mail
        <Input
          type="email"
          placeholder="seuemail@exemplo.com"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          className={AUTH_INPUT_CLASS}
        />
      </label>

      <button
        type="button"
        onClick={handleContinue}
        disabled={!isValidContact || isLoading}
        className={AUTH_PRIMARY_BUTTON_CLASS}
      >
        {isLoading ? 'Verificando...' : 'Continuar'}
      </button>

      <div className="flex items-center gap-3 text-[13px] text-[#5F5C6E] before:h-px before:flex-1 before:bg-[#EBE9F0] before:content-[''] after:h-px after:flex-1 after:bg-[#EBE9F0] after:content-['']">
        ou
      </div>

      <GoogleAuth />

      <p className={cn(AUTH_LEGAL_CLASS, 'mt-auto')}>
        Ao continuar, você concorda com nossos{' '}
        <Link
          href="/terms"
          target="_blank"
          rel="noopener noreferrer"
          className={AUTH_LINK_CLASS}
        >
          Termos de Uso
        </Link>{' '}
        e{' '}
        <Link
          href="/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className={AUTH_LINK_CLASS}
        >
          Política de Privacidade
        </Link>
        .
      </p>

      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className={cn(AUTH_ICON_BUTTON_CLASS, 'right-3 text-lg')}
      >
        ×
      </button>
    </section>
  );
}
