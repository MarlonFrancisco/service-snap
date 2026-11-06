import { useAnalytics } from '@/providers/analytics.provider';
import { useAuthStore } from '@/store/auth/auth.store';
import type { ClipboardEvent, KeyboardEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import type { TUseVerificationStepConfig } from './verification-step.types';

const EMPTY_CODE = ['', '', '', '', '', ''];

export const useVerificationStep = ({
  contact,
  onNext,
}: TUseVerificationStepConfig) => {
  const [code, setCode] = useState(EMPTY_CODE);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const isNewUser = useAuthStore((state) => state.isNewUser);
  const validateAuthSessionAction = useAuthStore(
    (state) => state.validateAuthSessionAction,
  );
  const onAuth = useAuthStore((state) => state.onAuth);
  const analytics = useAnalytics();

  const isEmail = contact.includes('@');
  const maskedContact = isEmail
    ? contact.replace(/(.{2})(.*)(@.*)/, '$1***$3')
    : contact.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-***$3');

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleVerify = async () => {
    const fullCode = code.join('');

    setIsLoading(true);

    try {
      await validateAuthSessionAction({
        code: fullCode,
        email: isEmail ? contact : undefined,
        telephone: isEmail ? undefined : contact,
      });
    } catch (error) {
      analytics.track('login_failed', { method: 'email', stage: 'verify' });
      throw error;
    }

    setIsLoading(false);

    if (isNewUser) {
      onNext('signup');
    } else {
      analytics.track('login', { method: 'email' });
      onAuth?.();
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);

    // Simular reenvio
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsResending(false);
    setCanResend(false);
    setCountdown(60);
    setCode(EMPTY_CODE);
    inputRefs.current[0]?.focus();
    analytics.track('login_code_resent', { method: 'email' });
  };

  const handleCodeChange = (index: number, value: string) => {
    // Apenas números
    const numericValue = value.replace(/\D/g, '');

    if (numericValue.length <= 1) {
      const newCode = [...code];
      newCode[index] = numericValue;
      setCode(newCode);

      // Mover para o próximo input automaticamente
      if (numericValue && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6);
    const newCode = paste
      .split('')
      .concat(Array<string>(6 - paste.length).fill(''));
    setCode(newCode.slice(0, 6));

    // Focus no último input preenchido ou primeiro vazio
    const nextIndex = Math.min(paste.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const setInputRef = (index: number, element: HTMLInputElement | null) => {
    if (element) {
      inputRefs.current[index] = element;
    }
  };

  return {
    code,
    countdown,
    canResend,
    isLoading,
    isResending,
    maskedContact,
    isValidCode:
      code.every((digit) => digit !== '') && code.join('').length === 6,
    setInputRef,
    handleVerify,
    handleResendCode,
    handleCodeChange,
    handleKeyDown,
    handlePaste,
  };
};
