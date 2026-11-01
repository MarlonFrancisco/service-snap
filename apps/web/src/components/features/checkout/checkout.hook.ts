import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type {
  TCheckoutLoadingStep,
  TCheckoutNextStep,
  TCheckoutStatus,
} from './checkout.types';

const LOADING_STEPS: TCheckoutLoadingStep[] = [
  { message: 'Verificando pagamento', duration: 1500 },
  { message: 'Ativando sua conta', duration: 3000 },
  { message: 'Preparando dashboard', duration: 3000 },
];

const NEXT_STEPS: TCheckoutNextStep[] = [
  {
    title: 'Configure suas filiais',
    description: 'Adicione os endereços onde você atende',
  },
  {
    title: 'Cadastre seus serviços',
    description: 'Defina os serviços que você oferece',
  },
  {
    title: 'Configure sua agenda',
    description: 'Defina horários e disponibilidade',
  },
];

const PROGRESS_INTERVAL = 50;
const VALIDATION_TIMEOUT = 10000;

const formatActivationDate = () =>
  new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());

const getStatus = (
  sessionId: string | null,
  isValidating: boolean,
): TCheckoutStatus => {
  if (!sessionId) return 'invalid';
  return isValidating ? 'validating' : 'success';
};

export const useCheckout = () => {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [isValidating, setIsValidating] = useState(Boolean(sessionId));
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [hasTimeout, setHasTimeout] = useState(false);
  const router = useRouter();
  const mainButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    // Simula validação do pagamento com steps
    const progressState = { current: 0 };
    const totalDuration = LOADING_STEPS.reduce(
      (acc, step) => acc + step.duration,
      0,
    );

    // Timeout de segurança - 10 segundos
    const timeoutTimer = setTimeout(() => {
      if (isValidating) {
        setHasTimeout(true);
        setIsValidating(false);
      }
    }, VALIDATION_TIMEOUT);

    const progressTimer = setInterval(() => {
      progressState.current += (PROGRESS_INTERVAL / totalDuration) * 100;

      if (progressState.current >= 100) {
        progressState.current = 100;
        clearInterval(progressTimer);
        setTimeout(() => {
          setIsValidating(false);
          // Foca no botão principal após carregar (acessibilidade)
          setTimeout(() => {
            mainButtonRef.current?.focus();
          }, 100);
        }, 200);
      }

      setProgress(progressState.current);
    }, PROGRESS_INTERVAL);

    // Change steps
    const stepTimers = LOADING_STEPS.map((_, index) => {
      const elapsed = LOADING_STEPS.slice(0, index + 1).reduce(
        (acc, step) => acc + step.duration,
        0,
      );

      return setTimeout(() => {
        if (index < LOADING_STEPS.length - 1) {
          setCurrentStepIndex(index + 1);
        }
      }, elapsed);
    });

    return () => {
      clearTimeout(timeoutTimer);
      clearInterval(progressTimer);
      stepTimers.forEach((timer) => clearTimeout(timer));
    };
  }, [isValidating, sessionId]);

  const handleGoToDashboard = () => {
    router.push('/partner/dashboard');
  };

  const handleGoToPricing = () => {
    router.push('/pricing');
  };

  return {
    status: getStatus(sessionId, isValidating),
    loadingMessage: LOADING_STEPS[currentStepIndex]?.message,
    progress: Math.round(progress),
    hasTimeout,
    activationDate: formatActivationDate(),
    nextSteps: NEXT_STEPS,
    mainButtonRef,
    handleGoToDashboard,
    handleGoToPricing,
  };
};
