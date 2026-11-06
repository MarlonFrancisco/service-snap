import { useAnalytics } from '@/providers/analytics.provider';
import { useAuthStore } from '@/store/auth';
import { Button } from '@repo/ui';
import { ArrowRight, Store, User, Users } from 'lucide-react';
import { useState } from 'react';
import { UserType } from '../../auth.types';

export function ProfileSelectionStep() {
  const [selectedType, setSelectedType] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const onAuth = useAuthStore((state) => state.onAuth);
  const analytics = useAnalytics();

  const handleContinue = async () => {
    if (!selectedType) return;

    analytics.track('profile_type_selected', {
      profile_type: selectedType === 'provider' ? 'partner' : 'client',
    });
    setIsLoading(true);

    // Simular finalização do processo
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsLoading(false);

    onAuth?.();
  };

  const profileTypes = [
    {
      id: 'client' as UserType,
      title: 'Sou um cliente',
      subtitle: 'Quero agendar serviços',
      description:
        'Encontre e agende os melhores serviços perto de você com facilidade e segurança.',
      icon: User,
      features: [
        'Encontrar serviços próximos',
        'Agendar com poucos cliques',
        'Avaliar profissionais',
        'Histórico de agendamentos',
      ],
      gradient: 'from-blue-500/10 via-blue-500/5 to-transparent',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200',
      selectedBg: 'bg-blue-50',
      selectedBorder: 'border-blue-400',
    },
    {
      id: 'provider' as UserType,
      title: 'Sou um profissional',
      subtitle: 'Quero oferecer meus serviços',
      description:
        'Gerencie seu negócio, atraia novos clientes e aumente sua receita com nossa plataforma.',
      icon: Store,
      features: [
        'Gerenciar agenda e horários',
        'Receber novos clientes',
        'Controlar múltiplas filiais',
        'Relatórios de desempenho',
      ],
      gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-600',
      borderColor: 'border-emerald-200',
      selectedBg: 'bg-emerald-50',
      selectedBorder: 'border-emerald-400',
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-8 pb-6">
        <div className="text-center">
          <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
            <Users className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div className="w-10"></div>
      </div>

      {/* Content */}
      <div className="px-8 pb-8">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-3">
            <h2 className="text-foreground font-semibold text-2xl leading-tight">
              Como você quer usar o ServiceSnap?
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed max-w-lg mx-auto">
              Escolha o tipo de perfil que melhor se adequa às suas necessidades
            </p>
          </div>

          {/* Profile Cards */}
          <div className="flex gap-4">
            {profileTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedType === type.id;

              return (
                <div
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`
                    relative p-7 rounded-3xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:shadow-xl group
                    ${
                      isSelected
                        ? `${type.selectedBorder} ${type.selectedBg} shadow-xl ring-1 ring-primary/20`
                        : `${type.borderColor} bg-card hover:border-primary/40 hover:shadow-lg`
                    }
                  `}
                >
                  <div className="relative z-10">
                    <div className="flex items-start gap-6">
                      {/* Icon */}
                      <div
                        className={`
                        w-18 h-18 ${type.iconBg} rounded-3xl flex items-center justify-center flex-shrink-0 
                        transition-transform duration-300 ${isSelected ? 'scale-110' : 'group-hover:scale-105'}
                        ring-1 ${isSelected ? 'ring-primary/30' : 'ring-primary/10'}
                      `}
                      >
                        <Icon
                          className={`h-9 w-9 ${type.iconColor} transition-transform duration-300`}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-5">
                        <div>
                          <h3 className="text-foreground font-semibold text-xl mb-2 transition-colors">
                            {type.title}
                          </h3>
                          <div className="inline-flex items-center px-3 py-1 bg-primary/10 rounded-full mb-3">
                            <p className="text-primary font-medium text-sm">
                              {type.subtitle}
                            </p>
                          </div>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {type.description}
                          </p>
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-1 gap-3">
                          {type.features.map((feature, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-3"
                            >
                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center ${type.iconBg}`}
                              >
                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                              </div>
                              <span className="text-sm text-muted-foreground font-medium">
                                {feature}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Selection Indicator */}
                      <div
                        className={`
                        w-7 h-7 rounded-full border-2 transition-all duration-200 flex items-center justify-center mt-1
                        ${
                          isSelected
                            ? 'border-primary bg-primary scale-110'
                            : 'border-border bg-background group-hover:border-primary/50'
                        }
                      `}
                      >
                        {isSelected && (
                          <div className="w-3 h-3 bg-primary-foreground rounded-full animate-in"></div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Background Gradient */}
                  <div
                    className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${type.gradient} pointer-events-none transition-opacity duration-300 ${isSelected ? 'opacity-60' : 'opacity-0 group-hover:opacity-30'}`}
                  ></div>

                  {/* Selection Ring */}
                  {isSelected && (
                    <div className="absolute inset-0 rounded-3xl ring-2 ring-primary/30 animate-pulse"></div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Continue Button */}
          <Button
            onClick={handleContinue}
            disabled={!selectedType || isLoading}
            className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-base rounded-2xl transition-all disabled:opacity-50 group"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                Finalizando...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                Começar agora
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            )}
          </Button>

          {/* Help Text */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Você pode alterar o tipo de perfil a qualquer momento nas
              configurações da sua conta.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
