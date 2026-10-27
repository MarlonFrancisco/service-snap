import { useAuthStore } from '@/store/auth/auth.store';
import { useLocaleStore } from '@/store/locale';
import type { TCountryCode } from '@repo/shared/constants';
import {
  formatPhone,
  getPhoneCodeOptions,
  getPhoneFormat,
  getPhonePlaceholder,
  isValidPhoneLength,
  normalizePhone,
} from '@repo/shared/validators';
import { Button, Checkbox, Input, Label, PhoneInput } from '@repo/ui';
import { ArrowLeft, ArrowRight, User } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AuthStep } from '../../auth.types';

interface SignupStepProps {
  userData: {
    email: string;
    phone: string;
    name: string;
    isNewUser: boolean;
  };
  onNext: (step: AuthStep, data?: any) => void;
  onBack: () => void;
}

const phoneCodeOptions = getPhoneCodeOptions();

export function SignupStep({ userData, onNext, onBack }: SignupStepProps) {
  const localeCountry = useLocaleStore((state) => state.country);
  const [phoneCountry, setPhoneCountry] = useState<TCountryCode>(
    localeCountry || 'BR',
  );
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: userData.email,
    telephone: userData.phone ? formatPhone(userData.phone, phoneCountry) : '',
    acceptedTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const registerAction = useAuthStore((state) => state.registerAction);
  const onAuth = useAuthStore((state) => state.onAuth);

  const contact = userData.email || userData.phone;
  const isEmail = Boolean(userData.email?.includes('@'));

  const phoneMask = useMemo(() => getPhoneFormat(phoneCountry), [phoneCountry]);
  const phonePlaceholder = useMemo(
    () => getPhonePlaceholder(phoneCountry),
    [phoneCountry],
  );

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCountryChange = (code: string) => {
    const next = code as TCountryCode;
    setPhoneCountry(next);
    setFormData((prev) => ({
      ...prev,
      telephone: formatPhone(prev.telephone, next),
    }));
  };

  const handleContinue = async () => {
    if (!isFormValid) return;

    setIsLoading(true);

    const telephone = isEmail
      ? normalizePhone(formData.telephone, phoneCountry)
      : userData.phone || normalizePhone(formData.telephone, phoneCountry);

    await registerAction({
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      acceptedTerms: formData.acceptedTerms,
      email: isEmail ? userData.email : formData.email.trim(),
      telephone,
    });

    setIsLoading(false);

    if (userData.isNewUser) {
      onNext('profile-selection', {
        ...userData,
        phone: telephone,
        name: `${formData.firstName} ${formData.lastName}`,
        isNewUser: true,
      });
    } else {
      onAuth?.();
    }
  };

  const isTelephoneValid = isEmail
    ? isValidPhoneLength(formData.telephone, phoneCountry)
    : Boolean(userData.phone || formData.telephone.trim());

  const isFormValid =
    formData.firstName.trim().length >= 2 &&
    formData.lastName.trim().length >= 2 &&
    (isEmail
      ? Boolean(userData.email)
      : formData.email.trim().includes('@')) &&
    isTelephoneValid &&
    formData.acceptedTerms;

  return (
    <div className="w-full max-w-lg">
      <div className="flex items-center justify-between p-8 pb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="h-10 w-10 p-0 hover:bg-muted rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="text-center">
          <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
            <User className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div className="w-10"></div>
      </div>

      <div className="px-8 pb-8">
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-foreground font-semibold text-2xl leading-tight">
              Complete seu perfil
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed">
              Precisamos de algumas informações para criar sua conta no
              ServiceSnap
            </p>
          </div>

          <div className="space-y-6">
            <div className="relative p-5 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border border-primary/20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/15 rounded-2xl flex items-center justify-center ring-1 ring-primary/20">
                  {isEmail ? (
                    <span className="text-primary font-semibold">@</span>
                  ) : (
                    <span className="text-primary font-semibold">#</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    {contact}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isEmail
                      ? 'Endereço de email verificado'
                      : 'Número de telefone verificado'}
                  </p>
                </div>
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                </div>
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-primary-foreground"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-foreground font-medium text-sm">
                  Nome *
                </label>
                <div className="relative group">
                  <Input
                    type="text"
                    placeholder="João"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange('firstName', e.target.value)
                    }
                    className="h-12 px-4 bg-input border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl transition-all duration-200 group-hover:border-border/80"
                  />
                  {formData.firstName.length >= 2 && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-foreground font-medium text-sm">
                  Sobrenome *
                </label>
                <div className="relative group">
                  <Input
                    type="text"
                    placeholder="Silva"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange('lastName', e.target.value)
                    }
                    className="h-12 px-4 bg-input border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl transition-all duration-200 group-hover:border-border/80"
                  />
                  {formData.lastName.length >= 2 && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-foreground font-medium text-sm">
                {isEmail ? 'Telefone *' : 'Email *'}
              </label>
              <div className="relative group">
                {isEmail ? (
                  <PhoneInput
                    value={formData.telephone}
                    onChange={(value) => handleInputChange('telephone', value)}
                    countryCode={phoneCountry}
                    onCountryChange={handleCountryChange}
                    phoneCodeOptions={phoneCodeOptions}
                    mask={phoneMask}
                    phonePlaceholder={phonePlaceholder}
                    triggerClassName="!h-12 w-[7.75rem] px-3 bg-input border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 !rounded-xl text-sm shadow-none"
                    inputClassName="!h-12 px-4 bg-input border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 !rounded-xl text-base shadow-none group-hover:border-border/80"
                  />
                ) : (
                  <Input
                    type="email"
                    placeholder="seuemail@exemplo.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="h-12 px-4 bg-input border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl transition-all duration-200 group-hover:border-border/80"
                  />
                )}
              </div>
            </div>

            <div className="space-y-4">
              <Label className="flex items-start cursor-pointer p-4 bg-muted/20 rounded-2xl border border-border/50 hover:border-border transition-colors">
                <Checkbox
                  checked={formData.acceptedTerms}
                  onCheckedChange={(checked) =>
                    handleInputChange('acceptedTerms', checked)
                  }
                  className="mt-1"
                />
                <div className="text-sm text-muted-foreground leading-relaxed">
                  <span className="text-foreground font-medium">
                    Aceito os termos:
                  </span>{' '}
                  Li e concordo com os{' '}
                  <button className="text-primary text-sm hover:underline font-medium transition-colors">
                    Termos de Uso
                  </button>{' '}
                  e{' '}
                  <button className="text-primary text-sm hover:underline font-medium transition-colors">
                    Política de Privacidade
                  </button>{' '}
                  do ServiceSnap.
                </div>
              </Label>
            </div>

            <Button
              onClick={handleContinue}
              disabled={!isFormValid || isLoading}
              className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-base rounded-2xl transition-all disabled:opacity-50 group"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                  Criando conta...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  Criar conta
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              )}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Suas informações são protegidas com criptografia de ponta e nunca
              serão compartilhadas com terceiros.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
