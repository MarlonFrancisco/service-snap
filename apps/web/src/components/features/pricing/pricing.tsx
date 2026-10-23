'use client';
import { Footer, Header } from '@/components/layout';
import { PlanCard } from '@/components/ui';
import { Badge, Card, Carousel, CarouselContent, CarouselItem } from '@repo/ui';
import {
  BarChart3,
  Building2,
  Calendar,
  History,
  Monitor,
  Sliders,
  Sparkles,
  Star,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { motion } from 'motion/react';
import { ROICalculator } from '../roi-calculator';
import { BillingToggle } from './billing-toggle';
import { usePricing } from './pricing.hook';

type Benefit = {
  icon: LucideIcon;
  title: string;
  description: string;
  featured?: boolean;
  medium?: boolean;
};

const benefits: Benefit[] = [
  {
    icon: Sparkles,
    title: 'Busca inteligente e recomendações',
    description:
      'Seus clientes encontram serviços facilmente com busca avançada e recebem recomendações personalizadas baseadas em histórico e preferências.',
    featured: true,
  },
  {
    icon: Zap,
    title: 'Agendamento via WhatsApp',
    description:
      'Integração completa com WhatsApp permitindo agendamentos automatizados, confirmações e lembretes direto no app mais usado pelos seus clientes.',
    featured: true,
  },
  {
    icon: Building2,
    title: 'Gestão de múltiplas lojas',
    description:
      'Gerencie todas as suas unidades, franquias ou localidades em um único lugar com controle completo.',
    medium: true,
  },
  {
    icon: Calendar,
    title: 'Agenda visual intuitiva',
    description:
      'Calendário visual completo para gestão de horários e agendamentos com arrastar e soltar.',
    medium: true,
  },

  {
    icon: BarChart3,
    title: 'Insights poderosos',
    description:
      'Dashboard analítico completo com métricas de receita, operacional, clientes e agendamentos em tempo real.',
    medium: true,
  },
  {
    icon: Star,
    title: 'Sistema de avaliações',
    description:
      'Reviews e avaliações dos clientes para construir reputação e confiança.',
  },
  {
    icon: Monitor,
    title: 'Acesso multiplataforma',
    description:
      'Interface responsiva que funciona perfeitamente em desktop, tablet e mobile.',
  },
  {
    icon: Sliders,
    title: 'Personalização total',
    description:
      'Customize horários, serviços, categorias e preços conforme seu negócio.',
  },
  {
    icon: History,
    title: 'Histórico completo',
    description:
      'Rastreamento de todos os agendamentos e histórico detalhado de cada cliente.',
  },
];

export const Pricing = () => {
  const { plans, monthlyPlans, type, setType, currentPlan } = usePricing();

  const monthlyPlanPriceInReais = (() => {
    const source =
      monthlyPlans.find((plan) => plan.popular) ?? monthlyPlans[0];
    return source ? source.price / 100 : undefined;
  })();

  return (
    <Header>
      <motion.div layout>
        {/* Why Subscribe Section */}
        <div className="bg-background py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <h1 className="text-3xl sm:text-4xl lg:text-5xl text-gray-900 mb-4">
                Transforme seu negócio com ServiceSnap
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Organize agenda, lembretes e clientes em um só lugar — e foque no
                que importa: atender bem
              </p>
            </motion.div>

            {/* Bento Grid Layout */}
            <div className="space-y-6">
              {/* Featured Cards - Main Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                {benefits
                  .filter((b) => b.featured)
                  .map((benefit, index) => {
                    const Icon = benefit.icon;
                    return (
                      <motion.div
                        key={benefit.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <Card className="border-gray-200 p-8 h-full hover:shadow-xl hover:border-gray-300 transition-all group bg-gradient-to-br from-gray-50 to-white">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Icon className="w-7 h-7 text-white" />
                          </div>
                          <h3 className="text-xl lg:text-2xl text-gray-900 mb-3">
                            {benefit.title}
                          </h3>
                          <p className="text-base text-gray-600 leading-relaxed">
                            {benefit.description}
                          </p>
                        </Card>
                      </motion.div>
                    );
                  })}
              </div>

              {/* Medium Cards - 3 per row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {benefits
                  .filter((b) => b.medium)
                  .map((benefit, index) => {
                    const Icon = benefit.icon;
                    return (
                      <motion.div
                        key={benefit.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                      >
                        <Card className="border-gray-200 p-6 h-full hover:shadow-lg hover:border-gray-300 transition-all group">
                          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4 group-hover:bg-gray-900 transition-colors">
                            <Icon className="w-6 h-6 text-gray-900 group-hover:text-white transition-colors" />
                          </div>
                          <h3 className="text-lg text-gray-900 mb-3">
                            {benefit.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {benefit.description}
                          </p>
                        </Card>
                      </motion.div>
                    );
                  })}
              </div>

              {/* Small Cards - 4 per row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {benefits
                  .filter((b) => !b.featured && !b.medium)
                  .map((benefit, index) => {
                    const Icon = benefit.icon;
                    return (
                      <motion.div
                        key={benefit.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                      >
                        <Card className="border-gray-200 p-6 h-full hover:shadow-lg hover:border-gray-300 transition-all group">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-4 group-hover:bg-gray-900 transition-colors">
                            <Icon className="w-6 h-6 text-gray-900 group-hover:text-white transition-colors" />
                          </div>
                          <h3 className="text-lg text-gray-900 mb-2">
                            {benefit.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {benefit.description}
                          </p>
                        </Card>
                      </motion.div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Badge variant="outline" className="mb-4 border-black/10">
                  Pricing
                </Badge>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl text-gray-900 mb-4">
                  Preços que crescem com você
                </h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Escolha um plano acessível e repleto dos melhores recursos
                  para engajar sua audiência, criar fidelidade e impulsionar
                  vendas.
                </p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Billing Toggle */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <BillingToggle value={type} onChange={setType} />
        </div>

        {/* Pricing Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <Carousel
            opts={{
              slidesToScroll: 1,
              active: true,
              align: 'start',
            }}
            className="-mx-4"
          >
            <CarouselContent className="pt-3 px-4 items-stretch">
              {plans?.map((plan, index) => {
                const isCurrentPlan =
                  plan.id === currentPlan?.planId &&
                  plan.interval === currentPlan?.billingPeriod;

                return (
                  <CarouselItem
                    key={plan.name}
                    className="pl-4 basis-[85%] lg:basis-[calc(100%/3.5)]"
                  >
                    <PlanCard
                      plan={plan}
                      index={index}
                      trialPeriodDays={plan.trialPeriodDays}
                      isCurrentPlan={isCurrentPlan}
                      customButtonText={
                        isCurrentPlan ? 'Seu plano atual' : undefined
                      }
                    />
                  </CarouselItem>
                );
              })}
            </CarouselContent>
          </Carousel>
        </div>

        {/* ROI Calculator Section */}
        <div className="bg-background py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <Badge variant="outline" className="mb-4 border-black/10">
                <Sparkles className="w-3 h-3 mr-1 inline" />
                Calculadora de ROI
              </Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl text-gray-900 mb-4">
                Calcule seu retorno sobre investimento
              </h2>
              <p className="text-lg text-gray-600">
                Veja quanto você pode economizar reduzindo no-shows com
                ServiceSnap
              </p>
            </motion.div>

            <ROICalculator monthlyPlanPrice={monthlyPlanPriceInReais} />
          </div>
        </div>

        <Footer />
      </motion.div>
    </Header>
  );
};
