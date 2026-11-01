'use client';
import { Footer, Header } from '@/components/layout';
import { useStoreQuery } from '@/hooks/use-query/use-store-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card } from '@repo/ui';
import { AlertTriangle } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { STEPS } from './booking.constants';
import { BookingFormSchema, TBookingFormData } from './booking.schema';
import { TBookingStep } from './booking.types';
import { BookingNotFound } from './components/booking-not-found';
import { BookingSidebar } from './components/booking-sidebar';
import { BookingSkeleton } from './components/booking-skeleton';
import { BusinessShowcase } from './components/business-showcase';
import { CheckoutStep } from './components/checkout-step';
import { DateTimeSelectionStep } from './components/date-time-selection-step';
import { MobileBookingDrawer } from './components/mobile-booking-drawer';
import { ProfessionalSelectionStep } from './components/professional-selection-step';
import { ServiceSelectionStep } from './components/service-selection-step';
import { StepIndicator } from './components/step-indicator';

export function BookingFlow() {
  const params = useParams();

  const { isPendingStore, isError } = useStoreQuery({
    storeId: params.id as string,
  });

  // Initialize form with React Hook Form
  const form = useForm<TBookingFormData>({
    resolver: zodResolver(BookingFormSchema),
    defaultValues: {
      selectedServices: [],
      selectedProfessional: null,
      isAnyProfessional: false,
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

  const handleNextStep = () => {
    const stepIndex = steps.findIndex((step) => step.id === currentStep);
    if (stepIndex < steps.length - 1) {
      setCurrentStep(steps[stepIndex + 1]!.id);
    }
  };

  const handlePrevStep = () => {
    const stepIndex = steps.findIndex((step) => step.id === currentStep);
    form.clearErrors('root');
    if (stepIndex > 0) {
      setCurrentStep(steps[stepIndex - 1]!.id);
    }
  };

  const totalPrice = selectedServices.reduce(
    (acc, service) => acc + service.price,
    0,
  );

  const totalDuration = selectedServices.reduce(
    (acc, service) => acc + service.duration,
    0,
  );

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
        <Footer />
      </Header>
    );
  }

  if (isError) {
    return (
      <Header showSearchBar>
        <BookingNotFound />
        <Footer />
      </Header>
    );
  }

  return (
    <FormProvider {...form}>
      <Header showSearchBar>
        {/* Business Showcase */}
        <BusinessShowcase />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8 pb-24 md:pb-8">
          <div className="grid grid-cols-12 gap-4 md:gap-6">
            {/* Main Content Column */}
            <div className="col-span-12 lg:col-span-8">
              {/* Validation Error */}
              {form.formState.errors.root && (
                <Card className="p-3 md:p-4 mb-4 md:mb-6 bg-red-50 shadow-sm">
                  <div className="flex items-center gap-3 text-red-800">
                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm">
                      {form.formState.errors.root.message}
                    </p>
                  </div>
                </Card>
              )}

              <div className="space-y-6">
                {/* Step Indicator - Desktop Only */}
                <div className="hidden md:block">
                  <StepIndicator
                    steps={steps}
                    currentStep={currentStep}
                    currentStepIndex={currentStepIndex}
                  />
                </div>

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

                {/* Navigation Buttons - Desktop */}
                <div className="hidden md:flex mt-8 pt-6 justify-between items-center">
                  <div>
                    {currentStep !== 'services' && (
                      <Button
                        variant="outline"
                        onClick={handlePrevStep}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Voltar
                      </Button>
                    )}
                  </div>

                  <div>
                    {currentStep !== 'checkout' && (
                      <Button
                        onClick={handleNextStep}
                        disabled={
                          !canProceedToNext || !!form.formState.errors.root
                        }
                        className="bg-black hover:bg-gray-800 text-white px-8"
                      >
                        {nextButtonText}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Desktop Only */}
            <div className="hidden lg:block col-span-12 lg:col-span-4">
              <BookingSidebar
                totalPrice={totalPrice}
                totalDuration={totalDuration}
                currentStep={currentStep}
              />
            </div>
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white p-4 z-20 shadow-lg">
          <div className="flex items-center justify-between gap-3">
            {/* Summary Info */}
            <div className="flex-1 min-w-0">
              {selectedServices.length > 0 ? (
                <div>
                  <div className="text-sm text-gray-600 truncate">
                    {selectedServices.length}{' '}
                    {selectedServices.length === 1 ? 'serviço' : 'serviços'}
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(totalPrice)}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  Nenhum serviço selecionado
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-2">
              {currentStep !== 'services' && (
                <Button
                  variant="outline"
                  onClick={handlePrevStep}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Voltar
                </Button>
              )}

              {currentStep !== 'checkout' && (
                <Button
                  onClick={handleNextStep}
                  disabled={!canProceedToNext || !!form.formState.errors.root}
                  className="bg-black hover:bg-gray-800 text-white"
                >
                  {nextButtonText}
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Summary Detail Toggle */}
          <MobileBookingDrawer
            totalPrice={totalPrice}
            totalDuration={totalDuration}
          />
        </div>

        <Footer />
      </Header>
    </FormProvider>
  );
}
