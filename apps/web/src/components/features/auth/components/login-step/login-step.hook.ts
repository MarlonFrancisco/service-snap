import { useAuthStore } from '@/store/auth/auth.store';
import { useState } from 'react';
import type { TUseLoginStepConfig } from './login-step.types';

export const useLoginStep = ({ onNext }: TUseLoginStepConfig) => {
  const [contact, setContact] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const createAuthSessionAction = useAuthStore(
    (state) => state.createAuthSessionAction,
  );

  const handleContinue = async () => {
    setIsLoading(true);

    await createAuthSessionAction({
      email: contact.trim(),
    });

    setIsLoading(false);

    onNext('verification', {
      email: contact.trim(),
    });
  };

  return {
    contact,
    isLoading,
    isValidContact: contact.trim().includes('@'),
    setContact,
    handleContinue,
  };
};
