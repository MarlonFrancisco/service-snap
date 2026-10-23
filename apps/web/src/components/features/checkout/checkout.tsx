'use client';
import { Alert, AlertDescription, Button, Progress } from '@repo/ui';
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  CreditCard,
  MapPin,
  Shield,
  Sparkles,
  Wrench,
  Zap,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface LoadingStep {
  icon: typeof CreditCard;
  message: string;
  duration: number;
}

export const Checkout = () => {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [isValidating, setIsValidating] = useState(Boolean(sessionId));
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [hasTimeout, setHasTimeout] = useState(false);
  const router = useRouter();

  const shouldReduceMotion = useReducedMotion();
  const mainButtonRef = useRef<HTMLButtonElement>(null);

  const loadingSteps: LoadingStep[] = [
    { icon: CreditCard, message: 'Verificando pagamento', duration: 1500 },
    { icon: Shield, message: 'Ativando sua conta', duration: 3000 },
    { icon: Zap, message: 'Preparando dashboard', duration: 3000 },
  ];

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    // Simula validação do pagamento com steps
    let currentProgress = 0;
    const totalDuration = loadingSteps.reduce(
      (acc, step) => acc + step.duration,
      0,
    );
    const progressInterval = 50; // Update every 50ms

    // Timeout de segurança - 10 segundos
    const timeoutTimer = setTimeout(() => {
      if (isValidating) {
        setHasTimeout(true);
        setIsValidating(false);
      }
    }, 10000);

    const progressTimer = setInterval(() => {
      currentProgress += (progressInterval / totalDuration) * 100;

      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(progressTimer);
        setTimeout(() => {
          setIsValidating(false);
          // Foca no botão principal após carregar (acessibilidade)
          setTimeout(() => {
            mainButtonRef.current?.focus();
          }, 100);
        }, 200);
      }

      setProgress(currentProgress);
    }, progressInterval);

    // Change steps
    const stepTimers: NodeJS.Timeout[] = [];
    let accumulatedTime = 0;

    loadingSteps.forEach((step, index) => {
      accumulatedTime += step.duration;
      const timer = setTimeout(() => {
        if (index < loadingSteps.length - 1) {
          setCurrentStepIndex(index + 1);
        }
      }, accumulatedTime);
      stepTimers.push(timer);
    });

    return () => {
      clearTimeout(timeoutTimer);
      clearInterval(progressTimer);
      stepTimers.forEach((timer) => clearTimeout(timer));
    };
  }, [isValidating, shouldReduceMotion, sessionId]);

  const handleGoToDashboard = () => {
    router.push('/partner/dashboard');
  };

  if (!sessionId) {
    return (
      <main
        className="min-h-screen bg-white flex items-center justify-center px-4 sm:px-6"
        role="main"
      >
        <div className="text-center w-full max-w-md space-y-4">
          <AlertCircle className="mx-auto h-10 w-10 text-gray-400" />
          <h1 className="text-xl text-gray-900">Nenhuma sessão de pagamento</h1>
          <p className="text-sm text-gray-600">
            Este link de checkout precisa do retorno da Stripe (
            <code className="text-xs">session_id</code>). Se você ainda não
            assinou um plano, escolha um para continuar.
          </p>
          <Button onClick={() => router.push('/pricing')}>Ver planos</Button>
        </div>
      </main>
    );
  }

  const formatActivationDate = () => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date());
  };

  const quickActions = [
    {
      icon: MapPin,
      title: 'Configure suas filiais',
      description: 'Adicione os endereços onde você atende',
      href: '/admin/dashboard?tab=stores',
    },
    {
      icon: Wrench,
      title: 'Cadastre seus serviços',
      description: 'Defina os serviços que você oferece',
      href: '/admin/dashboard?tab=services',
    },
    {
      icon: Calendar,
      title: 'Configure sua agenda',
      description: 'Defina horários e disponibilidade',
      href: '/admin/dashboard?tab=agenda',
    },
  ];

  if (isValidating) {
    const CurrentIcon = loadingSteps[currentStepIndex]!.icon;

    return (
      <main
        className="min-h-screen bg-white flex items-center justify-center px-4 sm:px-6"
        role="main"
        aria-live="polite"
        aria-busy="true"
      >
        <motion.div
          className="text-center w-full max-w-sm"
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Animated Icon Container */}
          <div
            className="relative inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-6 sm:mb-8"
            aria-hidden="true"
          >
            <div className="absolute inset-0 bg-gray-50 rounded-full" />
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStepIndex}
                className="relative z-10"
                initial={
                  shouldReduceMotion
                    ? {}
                    : { scale: 0.8, opacity: 0, rotate: -10 }
                }
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={
                  shouldReduceMotion
                    ? {}
                    : { scale: 0.8, opacity: 0, rotate: 10 }
                }
                transition={{ duration: 0.3 }}
              >
                <CurrentIcon
                  className="w-8 h-8 sm:w-10 sm:h-10 text-gray-900"
                  strokeWidth={1.5}
                />
              </motion.div>
            </AnimatePresence>

            {/* Spinning border */}
            {!shouldReduceMotion && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-gray-200 border-t-gray-900"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            )}
          </div>

          {/* Dynamic Message */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStepIndex}
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? {} : { opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="mb-6 px-2"
            >
              <h1 className="text-gray-900 mb-2" role="status">
                {loadingSteps[currentStepIndex]?.message}
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Aguarde um momento, estamos finalizando tudo para você...
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Progress Bar */}
          <div className="space-y-3 px-2">
            <Progress
              value={progress}
              className="h-1.5 bg-gray-100"
              aria-label={`Progresso: ${Math.round(progress)}%`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
            />

            {/* Step Indicators */}
            <div
              className="flex items-center justify-center gap-2"
              role="progressbar"
              aria-label="Etapas de validação"
            >
              {loadingSteps.map((step, index) => (
                <motion.div
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index <= currentStepIndex
                      ? 'bg-gray-900 w-8'
                      : 'bg-gray-200 w-1.5'
                  }`}
                  initial={shouldReduceMotion ? {} : { scale: 0.8 }}
                  animate={{
                    scale:
                      !shouldReduceMotion && index === currentStepIndex
                        ? 1.1
                        : 1,
                  }}
                  transition={{ duration: 0.3 }}
                  aria-label={`Etapa ${index + 1} de ${loadingSteps.length}${index <= currentStepIndex ? ' - completa' : ''}`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen bg-white flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12 relative overflow-hidden"
      role="main"
      aria-label="Confirmação de pagamento"
    >
      <article className="w-full max-w-md relative z-10">
        {/* Timeout/Error Alert */}
        {hasTimeout && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              A validação está demorando mais que o esperado, mas não se
              preocupe! Você pode acessar o dashboard enquanto finalizamos o
              processo.
            </AlertDescription>
          </Alert>
        )}

        {/* Success Icon */}
        <motion.header
          className="text-center mb-6 sm:mb-8"
          initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-50 mb-4 sm:mb-6 relative"
            initial={shouldReduceMotion ? {} : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
              delay: 0.2,
            }}
            aria-hidden="true"
          >
            <CheckCircle2
              className="w-10 h-10 sm:w-12 sm:h-12 text-gray-900"
              strokeWidth={1.5}
            />

            {/* Sparkle icon */}
            <motion.div
              className="absolute -top-1 -right-1"
              initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900" />
            </motion.div>
          </motion.div>

          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="px-2"
          >
            <h1 className="text-gray-900 mb-2 sm:mb-3">Tudo pronto!</h1>

            <p className="text-gray-600 text-sm sm:text-base max-w-sm mx-auto px-2">
              Sua conta foi ativada com sucesso. Agora você pode começar a
              gerenciar seus agendamentos e fazer crescer seu negócio.
            </p>

            {/* Activation details */}
            <p className="text-gray-500 text-xs sm:text-sm mt-3">
              Ativado em {formatActivationDate()}
            </p>
          </motion.div>
        </motion.header>

        {/* Next Steps Card */}
        <motion.section
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-5 sm:mb-6"
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          aria-labelledby="next-steps-heading"
        >
          <h2 id="next-steps-heading" className="text-gray-900 mb-3 sm:mb-4">
            Próximos passos
          </h2>

          <ol className="space-y-3 sm:space-y-4" role="list">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.li
                  key={index}
                  className="flex items-start gap-3 group"
                  initial={shouldReduceMotion ? {} : { opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <div
                    className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gray-50 flex items-center justify-center mt-0.5 group-hover:bg-gray-100 transition-colors"
                    aria-hidden="true"
                  >
                    <Icon className="w-4 h-4 text-gray-700" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 text-sm sm:text-base font-medium">
                      {action.title}
                    </p>
                    <p className="text-gray-600 text-xs sm:text-sm">
                      {action.description}
                    </p>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </motion.section>

        {/* CTA Button */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            ref={mainButtonRef}
            onClick={handleGoToDashboard}
            className="w-full bg-gray-900 text-white hover:bg-gray-800 h-11 sm:h-12 text-sm sm:text-base disabled:opacity-50 touch-manipulation focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
            aria-label="Acessar dashboard do administrador"
          >
            Acessar Dashboard
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Button>
        </motion.div>
      </article>
    </main>
  );
};
