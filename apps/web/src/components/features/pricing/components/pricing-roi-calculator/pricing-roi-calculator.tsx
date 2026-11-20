'use client';

import {
  type TRoiField,
  usePricingRoiCalculator,
} from './pricing-roi-calculator.hook';

const FIELDS: {
  field: TRoiField;
  label: string;
  placeholder: string;
  inputMode: 'numeric' | 'decimal';
}[] = [
  {
    field: 'appointments',
    label: 'Agendamentos por mês',
    placeholder: 'Ex: 200',
    inputMode: 'numeric',
  },
  {
    field: 'averagePrice',
    label: 'Preço médio por serviço',
    placeholder: 'R$ 0,00',
    inputMode: 'decimal',
  },
  {
    field: 'noShowRate',
    label: 'Taxa de no-show atual',
    placeholder: 'Ex: 15%',
    inputMode: 'decimal',
  },
  {
    field: 'planPrice',
    label: 'Valor do plano mensal',
    placeholder: 'R$ 99,90',
    inputMode: 'decimal',
  },
];

export const PricingRoiCalculator = () => {
  const {
    values,
    result,
    bookingsLiftPercent,
    noShowReductionPoints,
    handleChange,
  } = usePricingRoiCalculator();

  return (
    <div className="grid grid-cols-1 overflow-hidden rounded-3xl shadow-[0_10px_32px_rgba(15,12,30,0.1)] md:rounded-[32px] md:shadow-[0_12px_40px_rgba(15,12,30,0.1)] lg:grid-cols-2">
      <form
        className="grid gap-3.5 px-5 py-[22px] md:gap-[18px] md:p-10"
        onSubmit={(event) => event.preventDefault()}
      >
        {FIELDS.map(({ field, label, placeholder, inputMode }) => (
          <label
            key={field}
            className="grid gap-1.5 text-sm font-semibold text-ink md:gap-[7px]"
          >
            {label}
            <input
              type="text"
              inputMode={inputMode}
              value={values[field]}
              placeholder={placeholder}
              onChange={(event) => handleChange(field, event.target.value)}
              className="h-[50px] rounded-[14px] border border-line-strong bg-white px-4 text-base font-medium text-ink outline-none placeholder:text-ink-muted focus-visible:border-ink md:text-[15px]"
            />
          </label>
        ))}
      </form>

      <div
        aria-live="polite"
        className="flex flex-col justify-center gap-2.5 bg-surface px-5 py-[22px] md:p-10"
      >
        {result ? (
          <>
            <h3 className="text-[19px] font-extrabold tracking-[-0.02em] text-ink md:text-[22px]">
              Seu retorno estimado
            </h3>
            <dl className="grid gap-3.5 py-2">
              <div>
                <dt className="text-[13px] text-ink-muted">Ganho mensal</dt>
                <dd className="text-[30px] font-extrabold tracking-[-0.03em] text-ink">
                  {result.monthlyGain}
                </dd>
              </div>
              <div>
                <dt className="text-[13px] text-ink-muted">
                  Retorno anual, já descontado o plano
                </dt>
                <dd className="text-[22px] font-extrabold tracking-[-0.02em] text-ink">
                  {result.annualReturn}
                </dd>
              </div>
              <div>
                <dt className="text-[13px] text-ink-muted">Payback</dt>
                <dd className="text-[15px] font-bold text-ink">
                  {result.payback}
                </dd>
              </div>
            </dl>
          </>
        ) : (
          <>
            <h3 className="text-[19px] font-extrabold tracking-[-0.02em] text-ink md:text-[22px]">
              Seu retorno aparece aqui
            </h3>
            <p className="text-sm leading-[1.55] text-ink-muted md:text-[15px] md:leading-[1.6]">
              Preencha os números do seu negócio para ver o ganho mensal, o
              retorno anual e o tempo para recuperar o investimento.
            </p>
          </>
        )}
        <small className="text-xs leading-[1.5] text-ink-muted md:text-[13px]">
          Estimativa ilustrativa: considera {noShowReductionPoints} pontos a
          menos de no-show e {bookingsLiftPercent}% mais agendamentos. Não há
          benchmark público por trás destes números.
        </small>
      </div>
    </div>
  );
};
