import { useAnalytics } from '@/providers/analytics.provider';
import { useAuthStore } from '@/store/auth/auth.store';
import { useState } from 'react';
import type { TUseLoginStepConfig } from './login-step.types';

export const useLoginStep = ({ onNext }: TUseLoginStepConfig) => {
  const [contact, setContact] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const createAuthSessionAction = useAuthStore(
    (state) => state.createAuthSessionAction,
  );
  const analytics = useAnalytics();

  const handleContinue = async () => {
    setIsLoading(true);

    try {
      await createAuthSessionAction({
        email: contact.trim(),
      });
    } catch (error) {
      analytics.track('login_failed', {
        method: 'email',
        stage: 'request_code',
      });
      throw error;
    }

    analytics.track('login_code_requested', { method: 'email' });

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
