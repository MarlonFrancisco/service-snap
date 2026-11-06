'use client';
import { Footer, Header } from '@/components/layout';
import { useStoreQuery } from '@/hooks/use-query/use-store-query';
import { useAnalytics } from '@/providers/analytics.provider';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@repo/ui';
import { AlertTriangle } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { STEPS } from './booking.constants';
import {
  getBookingTotals,
  splitServicesByProfessional,
} from './booking.helpers';
import { useStoreViewTracking } from './booking.hook';
import { BookingFormSchema, TBookingFormData } from './booking.schema';
import { TBookingStep } from './booking.types';
import { BookingNotFound } from './components/booking-not-found';
import { BookingSidebar } from './components/booking-sidebar';
import { BookingSkeleton } from './components/booking-skeleton';
import { BusinessInfo, BusinessShowcase } from './components/business-showcase';
import { CheckoutStep } from './components/checkout-step';
import { DateTimeSelectionStep } from './components/date-time-selection-step';
import { MobileBookingDrawer } from './components/mobile-booking-drawer';
import { ProfessionalSelectionStep } from './components/professional-selection-step';
import { ServiceSelectionStep } from './components/service-selection-step';
import { StepIndicator } from './components/step-indicator';

export function BookingFlow() {
  const params = useParams();
  const storeId = params.id as string;
  const analytics = useAnalytics();

  const { isPendingStore, isError } = useStoreQuery({ storeId });
  useStoreViewTracking(storeId);

  // Initialize form with React Hook Form
  const form = useForm<TBookingFormData>({
    resolver: zodResolver(BookingFormSchema),
    defaultValues: {
      selectedServices: [],
      selectedProfessional: null,
      isAnyProfessional: false,
      assignedProfessionalId: null,
      selectedDate: undefined,
      selectedTime: null,
    },
  });

  const [currentStep, setCurrentStep] = useState<TBookingStep>('services');

  const selectedServices = form.watch('selectedServices');
  const selectedProfessional = form.watch('selectedProfessional');
  const isAnyProfessional = form.watch('isAnyProfessional');
  const selectedDate = form.watch('selectedDate');
  const selectedTime = form.watch('selectedTime');

  const canProceedToNext = useMemo(() => {
    switch (currentStep) {
      case 'services':
        return selectedServices.length > 0;
      case 'professional':
        return selectedProfessional !== null || isAnyProfessional;
      case 'datetime':
        return selectedDate && selectedTime;
      case 'checkout':
        return false;
      default:
        return false;
    }
  }, [
    currentStep,
    selectedServices,
    selectedProfessional,
    isAnyProfessional,
    selectedDate,
    selectedTime,
  ]);

  const steps = STEPS;
  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);

  const nextButtonText = (() => {
    switch (currentStep) {
      case 'services':
        return 'Escolher profissional';
      case 'professional':
        return 'Selecionar horário';
      case 'datetime':
        return 'Revisar e confirmar';
      default:
        return 'Continuar';
    }
  })();

  // A reserva tem um único profissional: o pedido fica só com o que ele realiza.
  const removeServicesUnavailableForProfessional = () => {
    if (currentStep !== 'professional' || !selectedProfessional) {
      return selectedServices;
    }

    const { performable, unavailable } = splitServicesByProfessional(
      selectedServices,
      selectedProfessional,
    );

    if (unavailable.length > 0) {
      form.setValue('selectedServices', performable);
      toast.info(
        `Removido do pedido: ${unavailable.map((s) => s.name).join(', ')}. O profissional escolhido não realiza.`,
      );
      analytics.track('booking_services_pruned', {
        store_id: storeId,
        removed_count: unavailable.length,
        professional_id: selectedProfessional.id,
      });
      return performable;
    }

    return selectedServices;
  };

  const handleNextStep = () => {
    const bookedServices = removeServicesUnavailableForProfessional();

    const stepIndex = steps.findIndex((step) => step.id === currentStep);
    if (stepIndex < steps.length - 1) {
      const nextStep = steps[stepIndex + 1]!.id;
      const totals = getBookingTotals(bookedServices);
      setCurrentStep(nextStep);
      window.scrollTo({ top: 0 });
      analytics.track('booking_step_completed', {
        store_id: storeId,
        from_step: currentStep,
        to_step: nextStep,
        services_count: bookedServices.length,
        total_price: totals.totalPrice,
        total_duration: totals.totalDuration,
      });
    }
  };

  const handlePrevStep = () => {
    const stepIndex = steps.findIndex((step) => step.id === currentStep);
    form.clearErrors('root');
    if (stepIndex > 0) {
      analytics.track('booking_step_back', {
        store_id: storeId,
        from_step: currentStep,
      });
      setCurrentStep(steps[stepIndex - 1]!.id);
      window.scrollTo({ top: 0 });
    }
  };

  const { totalPrice, totalDuration } = getBookingTotals(selectedServices);

  const renderStepContent = () => {
    switch (currentStep) {
      case 'services':
        return <ServiceSelectionStep />;
      case 'professional':
        return <ProfessionalSelectionStep />;
      case 'datetime':
        return <DateTimeSelectionStep />;
      case 'checkout':
        return <CheckoutStep />;
      default:
        return null;
    }
  };

  if (isPendingStore) {
    return (
      <Header showSearchBar>
        <BookingSkeleton />
        <Footer compact />
      </Header>
    );
  }

  if (isError) {
    return (
      <Header showSearchBar>
        <BookingNotFound />
        <Footer compact />
      </Header>
    );
  }

  const isServicesStep = currentStep === 'services';
  const isCheckoutStep = currentStep === 'checkout';
  const isNextDisabled = !canProceedToNext || !!form.formState.errors.root;

  return (
    <FormProvider {...form}>
      <Header showSearchBar={isServicesStep}>
        {/* A altura mínima mantém a barra inferior do mobile no fim da tela. */}
        <div className="flex min-h-[calc(100dvh-5rem)] flex-col md:min-h-[calc(100dvh-6rem)]">
          {isServicesStep && <BusinessShowcase />}

          <div className="mx-auto w-full max-w-[82.5rem] px-5 pb-5 md:px-10 md:pb-0">
            {!isServicesStep && (
              <>
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="mt-1 inline-flex min-h-11 items-center text-sm font-semibold text-[#0B0B0F] hover:underline"
                >
                  ← Voltar para{' '}
                  {steps[currentStepIndex - 1]?.title.toLowerCase()}
                </button>
                <StepIndicator
                  className="mt-3 mb-8"
                  steps={steps}
                  currentStep={currentStep}
                  currentStepIndex={currentStepIndex}
                />
              </>
            )}

            <div
              className={cn(
                'grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_420px]',
                isServicesStep && 'pt-4 md:pt-8',
              )}
            >
              <section className="min-w-0">
                {isServicesStep && (
                  <>
                    <BusinessInfo />
                    <StepIndicator
                      className="mt-7 mb-1.5 md:mt-9 md:mb-7"
                      steps={steps}
                      currentStep={currentStep}
                      currentStepIndex={currentStepIndex}
                    />
                  </>
                )}

                {/* Validation Error */}
                {form.formState.errors.root && (
                  <div
                    role="alert"
                    className="mb-5 flex items-center gap-3 rounded-[14px] bg-red-50 px-[18px] py-4 text-sm leading-[1.5] text-red-800"
                  >
                    <AlertTriangle
                      className="h-5 w-5 shrink-0 text-red-600"
                      aria-hidden
                    />
                    <p>{form.formState.errors.root.message}</p>
                  </div>
                )}

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                  >
                    {renderStepContent()}
                  </motion.div>
                </AnimatePresence>
              </section>

              {/* Na confirmação o resumo vem antes do conteúdo até o layout de duas colunas. */}
              <div
                className={
                  isCheckoutStep ? '-order-1 lg:order-none' : 'hidden md:block'
                }
              >
                <BookingSidebar
                  totalPrice={totalPrice}
                  totalDuration={totalDuration}
                  currentStep={currentStep}
                  nextButtonText={nextButtonText}
                  isNextDisabled={isNextDisabled}
                  onNext={handleNextStep}
                />
              </div>
            </div>
          </div>

          {!isCheckoutStep && (
            <MobileBookingDrawer
              totalPrice={totalPrice}
              totalDuration={totalDuration}
              currentStep={currentStep}
              nextButtonText={nextButtonText}
              isNextDisabled={isNextDisabled}
              onNext={handleNextStep}
            />
          )}
        </div>

        <Footer compact />
      </Header>
    </FormProvider>
  );
}
