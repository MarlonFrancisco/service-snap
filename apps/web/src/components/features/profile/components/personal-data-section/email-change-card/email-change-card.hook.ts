'use client';

import { useUsersMutations } from '@/hooks/use-mutations/use-users-mutations';
import { useUserQuery } from '@/hooks/use-query/use-user-query';
import { useCallback, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  EMAIL_CODE_LENGTH,
  getEmailConfirmError,
  getEmailRequestFeedback,
  sanitizeEmailCode,
  validateNewEmail,
} from './email-change-card.helpers';
import type {
  TEmailChangeNotice,
  TEmailChangeStep,
} from './email-change-card.types';

export const useEmailChangeCard = () => {
  const { user } = useUserQuery();
  const {
    requestEmailChange,
    isRequestingEmailChange,
    confirmEmailChange,
    isConfirmingEmailChange,
  } = useUsersMutations();

  const [step, setStep] = useState<TEmailChangeStep>('closed');
  const [newEmail, setNewEmail] = useState('');
  const [sentTo, setSentTo] = useState('');
  const [code, setCode] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [notice, setNotice] = useState<TEmailChangeNotice | null>(null);

  const reset = useCallback(() => {
    setNewEmail('');
    setSentTo('');
    setCode('');
    setEmailError(null);
    setCodeError(null);
    setNotice(null);
  }, []);

  const handleOpen = useCallback(() => {
    reset();
    setStep('email');
  }, [reset]);

  const handleClose = useCallback(() => {
    reset();
    setStep('closed');
  }, [reset]);

  const sendCode = useCallback(
    (email: string, isResend: boolean) => {
      setEmailError(null);
      setCodeError(null);

      requestEmailChange(email, {
        onSuccess: ({ email: confirmedEmail }) => {
          setSentTo(confirmedEmail);
          setCode('');
          setStep('code');
          setNotice({
            tone: 'info',
            message: isResend
              ? `Enviamos um novo código de ${EMAIL_CODE_LENGTH} dígitos para ${confirmedEmail}`
              : `Enviamos um código de ${EMAIL_CODE_LENGTH} dígitos para ${confirmedEmail}`,
          });
        },
        onError: (error) => {
          const feedback = getEmailRequestFeedback(error, email);

          if (!feedback.canEnterCode) {
            // No reenvio o erro aparece junto do código, que continua na tela
            if (isResend) setCodeError(feedback.message);
            else setEmailError(feedback.message);
            return;
          }

          setSentTo(email);
          setStep('code');
          setNotice({ tone: 'warning', message: feedback.message });
        },
      });
    },
    [requestEmailChange],
  );

  const handleEmailChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setNewEmail(event.target.value);
      setEmailError(null);
      // Trocar o e-mail depois do envio pede um código novo
      if (step === 'code') {
        setStep('email');
        setNotice(null);
        setCode('');
        setCodeError(null);
      }
    },
    [step],
  );

  const handleSendCode = useCallback(
    (event?: FormEvent) => {
      event?.preventDefault();
      const email = newEmail.trim();
      const error = validateNewEmail(email, user?.email);
      if (error) {
        setEmailError(error);
        return;
      }
      sendCode(email, false);
    },
    [newEmail, sendCode, user?.email],
  );

  const handleResendCode = useCallback(() => {
    if (sentTo) sendCode(sentTo, true);
  }, [sendCode, sentTo]);

  const handleCodeChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setCode(sanitizeEmailCode(event.target.value));
      setCodeError(null);
    },
    [],
  );

  const handleConfirmCode = useCallback(
    (event?: FormEvent) => {
      event?.preventDefault();
      if (code.length !== EMAIL_CODE_LENGTH) {
        setCodeError(`Digite os ${EMAIL_CODE_LENGTH} dígitos do código.`);
        return;
      }

      confirmEmailChange(code, {
        onSuccess: () => handleClose(),
        onError: (error) => setCodeError(getEmailConfirmError(error)),
      });
    },
    [code, confirmEmailChange, handleClose],
  );

  return {
    currentEmail: user?.email ?? '',
    step,
    isOpen: step !== 'closed',
    isCodeStep: step === 'code',
    newEmail,
    code,
    emailError,
    codeError,
    notice,
    codeLength: EMAIL_CODE_LENGTH,
    isRequestingEmailChange,
    isConfirmingEmailChange,
    handleOpen,
    handleClose,
    handleEmailChange,
    handleSendCode,
    handleResendCode,
    handleCodeChange,
    handleConfirmCode,
  };
};
