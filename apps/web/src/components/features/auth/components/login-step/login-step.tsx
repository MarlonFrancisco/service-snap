import { useAuthStore } from '@/store/auth/auth.store';
import { Button, Input, Separator } from '@repo/ui';
import { ArrowRight, Globe, Mail } from 'lucide-react';
import { useState } from 'react';
import { AuthStep } from '../../auth.types';
import { GoogleAuth } from '../google-auth';

interface LoginStepProps {
  onNext: (step: AuthStep, data?: any) => void;
  onClose: () => void;
}

export function LoginStep({ onNext }: LoginStepProps) {
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

  const isValidContact = contact.trim().includes('@');

  return (
    <div className="w-full max-w-lg">
      {/* Content */}
      <div className="px-8 pb-8 pt-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="space-y-3">
            <h2 className="text-foreground font-semibold text-2xl leading-tight">
              Bem-vindo ao ServiceSnap
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed">
              Conecte-se aos melhores serviços perto de você ou gerencie seu
              negócio de forma simples.
            </p>
          </div>

          {/* Contact Input Section */}
          <div className="space-y-5">
            {/* Input Field */}
            <div className="space-y-3">
              <label className="text-foreground font-medium text-sm block transition-colors">
                Endereço de email
              </label>

              <div className="relative group">
                <Input
                  type="email"
                  placeholder="seuemail@exemplo.com"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full h-14 px-5 pr-14 text-base bg-input border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl transition-all duration-300 group-hover:border-border/80"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <div
                    className={`transition-colors duration-300 ${contact ? 'text-primary' : 'text-muted-foreground'}`}
                  >
                    <Mail className="h-5 w-5" />
                  </div>
                </div>
                <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>

            {/* Continue Button */}
            <Button
              onClick={handleContinue}
              disabled={!isValidContact || isLoading}
              className="w-full h-14 bg-primary hover:bg-primary/90 active:scale-[0.98] text-primary-foreground font-medium text-base rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                  <span className="animate-pulse">Verificando...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Continuar</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              )}
            </Button>
          </div>

          {/* Divider */}
          <div className="relative">
            <Separator className="bg-border" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-background px-4 text-sm text-muted-foreground font-medium">
                ou
              </span>
            </div>
          </div>

          {/* Social Login */}
          <div className="space-y-3">
            <GoogleAuth />
          </div>

          {/* Legal Notice */}
          <div className="text-center space-y-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Ao continuar, você concorda com nossos{' '}
              <button className="text-primary text-xs hover:underline font-medium">
                Termos de Uso
              </button>{' '}
              e{' '}
              <button className="text-primary text-xs hover:underline font-medium">
                Política de Privacidade
              </button>
              .
            </p>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Globe className="h-3 w-3" />
              <span>Português (Brasil)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
