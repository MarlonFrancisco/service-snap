import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Slider,
} from '@repo/ui';
import {
  Calculator,
  Calendar,
  Check,
  ChevronDown,
  DollarSign,
  Percent,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import {
  ROI_DISCLAIMER,
  ROI_ILLUSTRATIVE_BOOKINGS_LIFT,
  ROI_ILLUSTRATIVE_NO_SHOW_REDUCTION_PP,
} from './roi-calculator.constants';

// Animated counter component
function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
}: {
  value: number;
  prefix?: string;
  suffix?: string;
}) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    // Validate value
    if (!isFinite(value) || isNaN(value)) {
      setDisplayValue(0);
      return;
    }

    const duration = 800;
    const steps = 30;
    const stepValue = (value - displayValue) / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setDisplayValue(value);
        clearInterval(interval);
      } else {
        setDisplayValue((prev) => prev + stepValue);
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [value, displayValue]);

  const safeValue =
    isFinite(displayValue) && !isNaN(displayValue) ? displayValue : 0;

  return (
    <span>
      {prefix}
      {Math.round(safeValue).toLocaleString('pt-BR')}
      {suffix}
    </span>
  );
}

type ROICalculatorProps = {
  /** Monthly plan price in major units (e.g. reais), from live `/plans` when available. */
  monthlyPlanPrice?: number;
};

export function ROICalculator({ monthlyPlanPrice }: ROICalculatorProps) {
  // Empty until the user fills in — no invented market defaults.
  const [monthlyAppointments, setMonthlyAppointments] = useState([0]);
  const [averagePrice, setAveragePrice] = useState(0);
  const [noShowRate, setNoShowRate] = useState([0]);
  const [selectedPlan, setSelectedPlan] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (
      typeof monthlyPlanPrice === 'number' &&
      Number.isFinite(monthlyPlanPrice) &&
      monthlyPlanPrice > 0
    ) {
      setSelectedPlan(monthlyPlanPrice);
    }
  }, [monthlyPlanPrice]);

  // Calculations with validation
  const currentRevenue = (monthlyAppointments[0] || 0) * (averagePrice || 0);
  const lostRevenueNoShow = (currentRevenue * (noShowRate[0] || 0)) / 100;

  // Illustrative scenario deltas (see ROI_DISCLAIMER) — not measured benchmarks.
  const improvedNoShowRate = Math.max(
    0,
    (noShowRate[0] || 0) - ROI_ILLUSTRATIVE_NO_SHOW_REDUCTION_PP,
  );
  const additionalBookings = Math.round(
    (monthlyAppointments[0] || 0) * ROI_ILLUSTRATIVE_BOOKINGS_LIFT,
  );
  const newMonthlyAppointments =
    (monthlyAppointments[0] || 0) + additionalBookings;
  const newRevenue = newMonthlyAppointments * (averagePrice || 0);
  const newLostRevenue = (newRevenue * improvedNoShowRate) / 100;

  const monthlyGain =
    newRevenue - newLostRevenue - (currentRevenue - lostRevenueNoShow);
  const yearlyGain = monthlyGain * 12;
  const yearlyPlanCost = (selectedPlan || 0) * 12;
  const netAnnualROI = yearlyGain - yearlyPlanCost;
  const roiPercentage =
    yearlyPlanCost > 0 ? (netAnnualROI / yearlyPlanCost) * 100 : 0;
  const paybackMonths =
    monthlyGain > 0 ? Math.ceil(yearlyPlanCost / monthlyGain) : 0;

  const benefits = [
    {
      title: 'Redução de faltas',
      current: `${noShowRate[0] || 0}%`,
      improved: `${improvedNoShowRate}%`,
      impact: `R$ ${Math.max(0, lostRevenueNoShow - newLostRevenue).toFixed(0)}/mês`,
      icon: Target,
    },
    {
      title: 'Agendamentos extras',
      current: `${monthlyAppointments[0] || 0}/mês`,
      improved: `${newMonthlyAppointments}/mês`,
      impact: `+${additionalBookings} agendamentos/mês`,
      icon: Zap,
    },
    {
      title: 'Receita mensal',
      current: `R$ ${Math.max(0, currentRevenue - lostRevenueNoShow).toFixed(0)}`,
      improved: `R$ ${Math.max(0, newRevenue - newLostRevenue).toFixed(0)}`,
      impact: `+R$ ${Math.max(0, monthlyGain).toFixed(0)}/mês`,
      icon: DollarSign,
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="border-gray-200 w-full">
        <CardHeader className="border-b border-gray-200 pb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gray-900 rounded-lg">
                <Calculator className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-gray-900 mb-1">
                  Calculadora de ROI
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Informe os números do seu negócio para simular o retorno
                </p>
              </div>
            </div>
            <Badge variant="outline" className="border-gray-900 text-gray-900">
              Resultado em tempo real
            </Badge>
          </div>
          <p className="mt-4 text-xs text-gray-500">{ROI_DISCLAIMER}</p>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Inputs */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs">
                    1
                  </div>
                  Configure seus dados
                </h3>

                <div className="space-y-5">
                  {/* Agendamentos slider */}
                  <div className="group">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm text-gray-700 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        Agendamentos/mês
                      </Label>
                      <div className="text-right">
                        <div className="text-lg text-gray-900 tabular-nums">
                          {monthlyAppointments[0]}
                        </div>
                        <div className="text-xs text-gray-500">
                          agendamentos
                        </div>
                      </div>
                    </div>
                    <Slider
                      value={monthlyAppointments}
                      onValueChange={setMonthlyAppointments}
                      max={500}
                      min={0}
                      step={10}
                      className="cursor-pointer"
                    />
                    <div className="flex justify-between mt-1.5 text-xs text-gray-400">
                      <span>0</span>
                      <span>500</span>
                    </div>
                  </div>

                  {/* Preço médio */}
                  <div className="group">
                    <Label
                      htmlFor="avgPrice"
                      className="text-sm text-gray-700 mb-2 flex items-center gap-2"
                    >
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      Preço médio por serviço
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        R$
                      </span>
                      <Input
                        id="avgPrice"
                        type="number"
                        value={averagePrice || ''}
                        placeholder="Ex.: 45"
                        onChange={(e) =>
                          setAveragePrice(
                            Math.max(0, Number(e.target.value) || 0),
                          )
                        }
                        className="pl-10"
                        min="0"
                      />
                    </div>
                  </div>

                  {/* Taxa de faltas */}
                  <div className="group">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm text-gray-700 flex items-center gap-2">
                        <Percent className="h-4 w-4 text-gray-400" />
                        Taxa de no-show
                      </Label>
                      <div className="text-right">
                        <div className="text-lg text-gray-900 tabular-nums">
                          {noShowRate[0]}%
                        </div>
                        <div className="text-xs text-gray-500">atual</div>
                      </div>
                    </div>
                    <Slider
                      value={noShowRate}
                      onValueChange={setNoShowRate}
                      max={30}
                      min={0}
                      step={1}
                      className="cursor-pointer"
                    />
                    <div className="flex justify-between mt-1.5 text-xs text-gray-400">
                      <span>0%</span>
                      <span>30%</span>
                    </div>
                  </div>

                  {/* Plano */}
                  <div className="group">
                    <Label
                      htmlFor="planPrice"
                      className="text-sm text-gray-700 mb-2 block"
                    >
                      Valor do plano mensal
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        R$
                      </span>
                      <Input
                        id="planPrice"
                        type="number"
                        value={selectedPlan || ''}
                        placeholder="Preencha ou use o plano da página"
                        onChange={(e) =>
                          setSelectedPlan(
                            Math.max(0, Number(e.target.value) || 0),
                          )
                        }
                        className="pl-10"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Results Preview */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs">
                    2
                  </div>
                  Seu retorno estimado
                </h3>

                <div className="space-y-3">
                  {/* Monthly gain */}
                  <motion.div
                    layout
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">
                        Ganho mensal
                      </span>
                      <TrendingUp className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="text-2xl text-gray-900 tabular-nums">
                      R$ <AnimatedNumber value={monthlyGain} />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">por mês</div>
                  </motion.div>

                  {/* Annual ROI */}
                  <motion.div
                    layout
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">ROI anual</span>
                      <Target className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="text-2xl text-gray-900 tabular-nums">
                      R$ <AnimatedNumber value={netAnnualROI} />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      <AnimatedNumber value={roiPercentage} suffix="%" /> de
                      retorno
                    </div>
                  </motion.div>

                  {/* Payback */}
                  <motion.div
                    layout
                    className="p-4 bg-gray-900 text-white rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-300">Payback</span>
                      <Check className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="text-2xl tabular-nums">
                      <AnimatedNumber value={paybackMonths} /> meses
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      para recuperar investimento
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed comparison */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-sm text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs">
                3
              </div>
              Comparação detalhada
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                const currentValue =
                  parseFloat(benefit.current.replace(/[^\d.-]/g, '')) || 0;
                const improvedValue =
                  parseFloat(benefit.improved.replace(/[^\d.-]/g, '')) || 0;
                const maxValue = Math.max(currentValue, improvedValue, 1);
                const currentPercent =
                  maxValue > 0 ? (currentValue / maxValue) * 100 : 0;
                const improvedPercent =
                  maxValue > 0 ? (improvedValue / maxValue) * 100 : 0;

                return (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-1.5 bg-gray-100 rounded">
                        <Icon className="h-3.5 w-3.5 text-gray-900" />
                      </div>
                      <h4 className="text-sm text-gray-900">{benefit.title}</h4>
                    </div>

                    <div className="space-y-3">
                      {/* Current state */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs text-gray-500">Atual</span>
                          <span className="text-sm text-gray-900 tabular-nums">
                            {benefit.current}
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${Math.min(100, currentPercent)}%`,
                            }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="h-full bg-gray-300 rounded-full"
                          />
                        </div>
                      </div>

                      {/* Improved state */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs text-gray-500">
                            Com ServiceSnap
                          </span>
                          <span className="text-sm text-gray-900 tabular-nums">
                            {benefit.improved}
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${Math.min(100, improvedPercent)}%`,
                            }}
                            transition={{
                              duration: 0.8,
                              delay: 0.2,
                              ease: 'easeOut',
                            }}
                            className="h-full bg-gray-900 rounded-full"
                          />
                        </div>
                      </div>

                      {/* Impact */}
                      <div className="pt-3 border-t border-gray-100">
                        <div className="text-xs text-gray-900 text-center py-1 px-2 bg-gray-50 rounded">
                          {benefit.impact}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expandable details */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-gray-200 overflow-hidden">
              <CardContent className="p-6">
                <h4 className="text-sm text-gray-900 mb-4 flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-gray-400" />
                  Detalhamento do cálculo
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div className="flex justify-between p-3 bg-gray-50 rounded">
                    <span className="text-gray-600">Receita mensal atual</span>
                    <span className="text-gray-900 tabular-nums">
                      R$ {Math.max(0, currentRevenue).toFixed(0)}
                    </span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded">
                    <span className="text-gray-600">Perda por no-show</span>
                    <span className="text-gray-900 tabular-nums">
                      -R$ {Math.max(0, lostRevenueNoShow).toFixed(0)}
                    </span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded">
                    <span className="text-gray-600">Nova receita mensal</span>
                    <span className="text-gray-900 tabular-nums">
                      R$ {Math.max(0, newRevenue).toFixed(0)}
                    </span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded">
                    <span className="text-gray-600">Nova perda (reduzida)</span>
                    <span className="text-gray-900 tabular-nums">
                      -R$ {Math.max(0, newLostRevenue).toFixed(0)}
                    </span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded">
                    <span className="text-gray-600">Custo do plano</span>
                    <span className="text-gray-900 tabular-nums">
                      -R$ {Math.max(0, selectedPlan).toFixed(0)}
                    </span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-900 text-white rounded">
                    <span>Ganho líquido mensal</span>
                    <span className="tabular-nums">
                      +R$ {Math.max(0, monthlyGain).toFixed(0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center">
        <Button
          variant="outline"
          onClick={() => setShowDetails(!showDetails)}
          className="border-gray-300"
        >
          {showDetails ? 'Ocultar' : 'Ver'} detalhes do cálculo
          <ChevronDown
            className={`h-4 w-4 ml-2 transition-transform ${showDetails ? 'rotate-180' : ''}`}
          />
        </Button>
      </div>
    </div>
  );
}
