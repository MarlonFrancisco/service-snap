'use client';

import { PARTNER_PORTAL_CLASS } from '@/components/features/partner/partner.styles';
import {
  cn,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Spinner,
  Switch,
} from '@repo/ui';
import { Info, Lock } from 'lucide-react';
import Link from 'next/link';
import { FormProvider } from 'react-hook-form';
import {
  ModuleErrorState,
  ModuleStatePanel,
  NoStoreState,
} from '../notifications-module/components/module-state';
import { RetentionSegmented } from '../packages-module/components/retention-segmented';
import {
  RETENTION_ALERT_CLASS,
  RETENTION_CARD_CLASS,
  RETENTION_CARD_TITLE_CLASS,
  RETENTION_CHECK_CLASS,
  RETENTION_CHECK_INPUT_CLASS,
  RETENTION_ERROR_CLASS,
  RETENTION_FIELD_CLASS,
  RETENTION_HINT_CLASS,
  RETENTION_LABEL_CLASS,
  RETENTION_NOTE_CLASS,
  RETENTION_NOTE_ICON_CLASS,
  RETENTION_PRIMARY_BUTTON_CLASS,
  RETENTION_SELECT_CLASS,
  RETENTION_SWITCH_CLASS,
  RETENTION_TEXT_CLASS,
} from '../packages-module/packages-module.styles';
import {
  REWARD_TYPE_OPTIONS,
  SERVICES_SCOPE_OPTIONS,
} from './loyalty-module.helpers';
import { useLoyaltyModule } from './loyalty-module.hook';

const LEGEND_CLASS = 'mb-1.5 p-0 text-[13px] font-bold';

export const LoyaltyModule = () => {
  const {
    view,
    isRetrying,
    handleRetry,
    form,
    isNewProgram,
    servicesScope,
    rewardType,
    serviceOptions,
    isLoadingServices,
    handleToggleService,
    servicesError,
    submitError,
    isSaving,
    handleSubmit,
  } = useLoyaltyModule();

  if (view === 'no-store') return <NoStoreState />;
  if (view === 'no-access') {
    return (
      <ModuleStatePanel
        icon={Lock}
        title="Sem acesso à fidelidade"
        description="Só o dono e o gerente da loja mudam o programa. O progresso de cada cliente aparece no fechamento do atendimento."
      >
        <Link href="/partner/agenda" className={RETENTION_PRIMARY_BUTTON_CLASS}>
          Ir para a agenda
        </Link>
      </ModuleStatePanel>
    );
  }
  if (view === 'error') {
    return <ModuleErrorState onRetry={handleRetry} isRetrying={isRetrying} />;
  }
  if (view === 'loading') {
    return (
      <div
        role="status"
        aria-label="Carregando programa de fidelidade"
        className="grid max-w-[760px] gap-4"
      >
        <Skeleton className="h-[560px] rounded-[24px] bg-[#F0EEF4]" />
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      <form
        noValidate
        onSubmit={handleSubmit}
        aria-labelledby="loyalty-title"
        className={cn(RETENTION_CARD_CLASS, 'max-w-[760px]')}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 id="loyalty-title" className={RETENTION_CARD_TITLE_CLASS}>
              Fidelidade
            </h2>
            <p className={RETENTION_TEXT_CLASS}>
              Conta visitas concluídas: dias diferentes, então corte e barba no
              mesmo dia são uma visita.
            </p>
          </div>
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2.5">
                <FormLabel className="text-[13px] font-medium">Ativo</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-label="Programa ativo"
                    className={RETENTION_SWITCH_CLASS}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="visitsRequired"
          render={({ field }) => (
            <FormItem className="gap-1.5">
              <FormLabel className={RETENTION_LABEL_CLASS}>
                A cada quantas visitas
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={100}
                  className={cn(RETENTION_FIELD_CLASS, 'max-w-[160px]')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <fieldset className="m-0 grid min-w-0 gap-2.5 border-0 p-0">
          <legend className={LEGEND_CLASS}>Serviços que contam</legend>
          <FormField
            control={form.control}
            name="servicesScope"
            render={({ field }) => (
              <RetentionSegmented
                name="loyalty-services-scope"
                label="Serviços que contam"
                options={SERVICES_SCOPE_OPTIONS}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          {servicesScope === 'some' ? (
            <div
              role="group"
              aria-label="Serviços escolhidos"
              aria-invalid={!!servicesError || undefined}
              className="grid gap-1 sm:grid-cols-2"
            >
              {isLoadingServices ? (
                <p className={RETENTION_TEXT_CLASS}>Carregando serviços...</p>
              ) : null}
              {!isLoadingServices && serviceOptions.length === 0 ? (
                <p className={RETENTION_TEXT_CLASS}>
                  A loja ainda não tem serviços cadastrados.
                </p>
              ) : null}
              {serviceOptions.map((option) => (
                <label key={option.id} className={RETENTION_CHECK_CLASS}>
                  <input
                    type="checkbox"
                    checked={option.isChecked}
                    onChange={() => handleToggleService(option.id)}
                    className={RETENTION_CHECK_INPUT_CLASS}
                  />
                  {option.name}
                </label>
              ))}
            </div>
          ) : null}
          {servicesError ? (
            <p role="alert" className={RETENTION_ERROR_CLASS}>
              {servicesError}
            </p>
          ) : null}
        </fieldset>

        <fieldset className="m-0 grid min-w-0 gap-2.5 border-0 p-0">
          <legend className={LEGEND_CLASS}>Recompensa</legend>
          <FormField
            control={form.control}
            name="rewardType"
            render={({ field }) => (
              <RetentionSegmented
                name="loyalty-reward-type"
                label="Tipo de recompensa"
                options={REWARD_TYPE_OPTIONS}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          {rewardType === 'free_service' ? (
            <FormField
              control={form.control}
              name="rewardServiceId"
              render={({ field }) => (
                <FormItem className="gap-1.5">
                  <FormLabel className={RETENTION_LABEL_CLASS}>
                    Serviço
                  </FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isLoadingServices}
                  >
                    <FormControl>
                      <SelectTrigger className={RETENTION_SELECT_CLASS}>
                        <SelectValue placeholder="Escolha o serviço" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className={PARTNER_PORTAL_CLASS}>
                      {serviceOptions.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <FormField
              control={form.control}
              name="rewardValue"
              render={({ field }) => (
                <FormItem className="gap-1.5">
                  <FormLabel className={RETENTION_LABEL_CLASS}>
                    {rewardType === 'percent'
                      ? 'Desconto (%)'
                      : 'Valor do desconto'}
                  </FormLabel>
                  <FormControl>
                    <Input
                      inputMode="decimal"
                      autoComplete="off"
                      placeholder={rewardType === 'percent' ? '10' : '0,00'}
                      className={cn(RETENTION_FIELD_CLASS, 'max-w-[160px]')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </fieldset>

        <FormField
          control={form.control}
          name="rewardValidityDays"
          render={({ field }) => (
            <FormItem className="gap-1.5">
              <FormLabel className={RETENTION_LABEL_CLASS}>
                Validade da recompensa
                <span className={RETENTION_HINT_CLASS}>
                  Em dias, a partir de quando ela é ganha. Vazio: não vence.
                </span>
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  placeholder="Não vence"
                  className={cn(RETENTION_FIELD_CLASS, 'max-w-[160px]')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className={RETENTION_NOTE_CLASS}>
          <Info aria-hidden="true" className={RETENTION_NOTE_ICON_CLASS} />
          <p className="m-0">
            {isNewProgram
              ? 'As visitas contam a partir de hoje. Recompensas ganhas continuam valendo mesmo se a regra mudar depois.'
              : 'Mudar quantas visitas valem ou os serviços que contam começa um ciclo novo a partir de hoje. Recompensas já ganhas continuam valendo.'}
          </p>
        </div>

        {submitError ? (
          <p role="alert" className={RETENTION_ALERT_CLASS}>
            {submitError}
          </p>
        ) : null}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className={RETENTION_PRIMARY_BUTTON_CLASS}
          >
            {isSaving ? (
              <>
                <Spinner />
                Salvando...
              </>
            ) : (
              'Salvar programa'
            )}
          </button>
        </div>
      </form>
    </FormProvider>
  );
};
