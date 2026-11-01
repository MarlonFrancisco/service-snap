'use client';
import { plusJakartaSans } from '@/utils/fonts/plus-jakarta-sans';
import {
  cn,
  Dialog,
  DialogContent,
  DialogTitle,
  Drawer,
  DrawerContent,
  DrawerTitle,
} from '@repo/ui';
import { useAuthModal } from './auth.hook';
import { LoginStep } from './components/login-step';
import { ProfileSelectionStep } from './components/profile-selection';
import { SignupStep } from './components/signup-step';
import { StepIndicator } from './components/step-indicator';
import { VerificationStep } from './components/verification-step';

export function AuthModal() {
  const {
    currentStep,
    stepLabel,
    isProfileSelection,
    isTransitioning,
    userData,
    isMobile,
    isOpen,
    handleStepChange,
    handleClose,
  } = useAuthModal();

  const stepContent = (
    <>
      {currentStep === 'login' && (
        <LoginStep onNext={handleStepChange} onClose={handleClose} />
      )}
      {currentStep === 'verification' && (
        <VerificationStep
          contact={userData.email || userData.phone}
          onNext={handleStepChange}
          onBack={() => handleStepChange('login')}
        />
      )}
      {currentStep === 'signup' && (
        <SignupStep
          userData={userData}
          onNext={handleStepChange}
          onBack={() => handleStepChange('verification')}
        />
      )}
      {isProfileSelection && (
        <>
          <div className="px-8 pt-6">
            <StepIndicator activeCount={2} />
          </div>
          <ProfileSelectionStep />
        </>
      )}
    </>
  );

  const transitionClass = isTransitioning
    ? 'opacity-50 scale-[0.98]'
    : 'opacity-100 scale-100';

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={handleClose}>
        <DrawerContent
          aria-describedby={undefined}
          className={cn(
            plusJakartaSans.className,
            'bg-white data-[vaul-drawer-direction=bottom]:rounded-t-[28px] data-[vaul-drawer-direction=bottom]:border-t-0',
          )}
        >
          <DrawerTitle className="sr-only">{stepLabel}</DrawerTitle>
          <div
            className={cn(
              'flex min-h-0 grow flex-col overflow-y-auto transition-all duration-300',
              transitionClass,
            )}
          >
            {stepContent}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        aria-describedby={undefined}
        className={cn(
          plusJakartaSans.className,
          'block gap-0 overflow-hidden rounded-[28px] border-0 bg-white p-0 shadow-[0_20px_60px_rgba(15,12,30,0.18)]',
          isProfileSelection
            ? 'max-w-5xl!'
            : 'sm:max-w-[420px] [&>button:last-child]:hidden',
        )}
      >
        <DialogTitle className="sr-only">{stepLabel}</DialogTitle>
        <div
          className={cn(
            'flex max-h-[calc(100dvh-2rem)] flex-col overflow-y-auto transition-all duration-300',
            !isProfileSelection && 'min-h-[min(640px,calc(100dvh-2rem))]',
            transitionClass,
          )}
        >
          {stepContent}
        </div>
      </DialogContent>
    </Dialog>
  );
}
