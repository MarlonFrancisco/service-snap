import { useAuthStore } from '@/store/auth/auth.store';
import { useIsMobile } from '@repo/ui';
import { useState } from 'react';
import type { TAuthStep, TAuthStepChange, TAuthUserData } from './auth.types';

const INITIAL_USER_DATA: TAuthUserData = {
  email: '',
  phone: '',
  name: '',
  isNewUser: false,
};

const AUTH_STEP_LABELS: Record<TAuthStep, string> = {
  login: 'Entrar',
  verification: 'Confirmar identidade',
  signup: 'Completar perfil',
  'profile-selection': 'Escolher perfil',
};

export const useAuthModal = () => {
  const [currentStep, setCurrentStep] = useState<TAuthStep>('login');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [userData, setUserData] = useState<TAuthUserData>(INITIAL_USER_DATA);
  const isMobile = useIsMobile();
  const isOpen = useAuthStore((state) => state.isOpen);
  const closeAuthAction = useAuthStore((state) => state.closeAuthAction);

  const handleStepChange: TAuthStepChange = async (step, data) => {
    setIsTransitioning(true);

    await new Promise((resolve) => setTimeout(resolve, 150));

    if (data) {
      setUserData((prev) => ({ ...prev, ...data }));
    }
    setCurrentStep(step);

    setTimeout(() => setIsTransitioning(false), 100);
  };

  const handleClose = () => {
    setCurrentStep('login');
    closeAuthAction();
    setUserData(INITIAL_USER_DATA);
  };

  return {
    currentStep,
    stepLabel: AUTH_STEP_LABELS[currentStep],
    isProfileSelection: currentStep === 'profile-selection',
    isTransitioning,
    userData,
    isMobile,
    isOpen,
    handleStepChange,
    handleClose,
  };
};
