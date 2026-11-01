'use client';

import { plusJakartaSans } from '@/utils/fonts/plus-jakarta-sans';
import { cn } from '@repo/ui';
import { HoursStep } from './components/hours-step';
import { OnboardingHeader } from './components/onboarding-header';
import { PhotosStep } from './components/photos-step';
import { ReadyStep } from './components/ready-step';
import { ServicesStep } from './components/services-step';
import { SpaceStep } from './components/space-step';
import { TeamStep } from './components/team-step';
import { WelcomeStep } from './components/welcome-step';
import { usePartnerOnboarding } from './partner-onboarding.hook';
import { ONBOARDING_PRIMARY_BUTTON_CLASS } from './partner-onboarding.styles';

export const PartnerOnboarding = () => {
  const {
    state,
    isError,
    refetch,
    view,
    businessType,
    result,
    setBusinessType,
    goBack,
    goTo,
    handleExit,
    handleCompleted,
  } = usePartnerOnboarding();

  const stepProps = { onBack: goBack, onExit: handleExit };

  return (
    <div
      className={cn(
        plusJakartaSans.className,
        'flex min-h-dvh flex-col bg-white text-[#0B0B0F]',
      )}
    >
      {isError && (
        <>
          <OnboardingHeader />
          <main className="mx-auto w-full max-w-[688px] px-5 py-10 md:px-6">
            <h1 className="text-[32px] leading-[1.1] font-extrabold tracking-[-0.03em]">
              Não conseguimos carregar seu progresso
            </h1>
            <p className="mt-2 mb-6 text-[15px] text-[#5F5C6E]">
              Nada foi perdido. Tente de novo em instantes.
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className={ONBOARDING_PRIMARY_BUTTON_CLASS}
            >
              Tentar novamente
            </button>
          </main>
        </>
      )}

      {view === 'welcome' && (
        <WelcomeStep
          selected={businessType}
          onSelect={setBusinessType}
          onStart={() => goTo('space')}
          onExit={handleExit}
        />
      )}

      {view === 'space' && state && (
        <SpaceStep
          {...stepProps}
          store={state.store}
          businessType={businessType}
          onSaved={() => goTo('hours')}
        />
      )}

      {view === 'hours' && state?.store && (
        <HoursStep
          {...stepProps}
          store={state.store}
          onSaved={() => goTo('services')}
        />
      )}

      {view === 'services' && state && (
        <ServicesStep
          {...stepProps}
          state={state}
          businessType={businessType}
          onSaved={() => goTo('team')}
        />
      )}

      {view === 'team' && state && (
        <TeamStep
          {...stepProps}
          state={state}
          onSaved={() => goTo('photos')}
        />
      )}

      {view === 'photos' && state?.store && (
        <PhotosStep
          {...stepProps}
          storeId={state.store.id}
          gallery={state.gallery}
          onCompleted={handleCompleted}
          onGoToStep={goTo}
        />
      )}

      {view === 'ready' && result && <ReadyStep result={result} />}
    </div>
  );
};
