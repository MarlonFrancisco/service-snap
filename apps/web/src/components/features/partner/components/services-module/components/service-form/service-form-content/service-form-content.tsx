import {
  cn,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
  Switch,
} from '@repo/ui';
import {
  PARTNER_MUTED_TEXT_CLASS,
  PARTNER_PORTAL_CLASS,
  PARTNER_SOFT_SURFACE_CLASS,
} from '../../../../../partner.styles';
import {
  SERVICES_BUTTON_CLASS,
  SERVICES_FIELD_LABEL_CLASS,
  SERVICES_INPUT_CLASS,
  SERVICES_MODAL_ACTION_CLASS,
  SERVICES_PRIMARY_BUTTON_CLASS,
  SERVICES_SELECT_TRIGGER_CLASS,
} from '../../../services-module.styles';
import { getCategoryColor } from '../../../utils/colors';
import {
  SERVICE_MIN_DURATION_MINUTES,
  SERVICE_MIN_PRICE,
} from '../service-form.schema';
import { useServiceFormContent } from './service-form-content.hook';

export const ServiceFormContent = () => {
  const {
    form,
    isEditing,
    categories,
    isSaving,
    currencySymbol,
    handleClose,
    handleManageCategories,
    handleSubmit,
  } = useServiceFormContent();

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className="grid min-h-0 flex-1 gap-3.5 overflow-y-auto px-5 py-1 sm:px-7">
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel className={SERVICES_FIELD_LABEL_CLASS}>
                Nome do serviço *
              </FormLabel>
              <FormControl>
                <input
                  placeholder="Ex: Corte feminino"
                  aria-required="true"
                  className={SERVICES_INPUT_CLASS}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="description"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel className={SERVICES_FIELD_LABEL_CLASS}>
                Descrição *
              </FormLabel>
              <FormControl>
                <textarea
                  placeholder="Descreva os detalhes do serviço..."
                  aria-required="true"
                  className={cn(
                    SERVICES_INPUT_CLASS,
                    'h-20 resize-none py-3',
                  )}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="category.id"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel className={SERVICES_FIELD_LABEL_CLASS}>
                Categoria *
              </FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger
                    aria-required="true"
                    className={SERVICES_SELECT_TRIGGER_CLASS}
                  >
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className={PARTNER_PORTAL_CLASS}>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id}
                      className="min-h-11"
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          'size-2.5 shrink-0 rounded-full',
                          getCategoryColor(category.color).swatchClass,
                        )}
                      />
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {categories.length === 0 && (
                <p className={cn('text-[13px]', PARTNER_MUTED_TEXT_CLASS)}>
                  Você ainda não tem categorias.{' '}
                  <button
                    type="button"
                    onClick={handleManageCategories}
                    className="min-h-6 font-semibold text-[#0B0B0F] underline"
                  >
                    Criar categoria
                  </button>
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 items-start gap-3">
          <FormField
            name="duration"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel className={SERVICES_FIELD_LABEL_CLASS}>
                  Duração (minutos) *
                </FormLabel>
                <div className="relative">
                  <FormControl>
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder="30"
                      aria-required="true"
                      min={SERVICE_MIN_DURATION_MINUTES}
                      step={SERVICE_MIN_DURATION_MINUTES}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      value={field.value || ''}
                      className={cn(SERVICES_INPUT_CLASS, 'pr-11')}
                    />
                  </FormControl>
                  <span
                    aria-hidden="true"
                    className={cn(
                      'pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-sm font-medium',
                      PARTNER_MUTED_TEXT_CLASS,
                    )}
                  >
                    min
                  </span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="price"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel className={SERVICES_FIELD_LABEL_CLASS}>
                  Preço ({currencySymbol}) *
                </FormLabel>
                <FormControl>
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="0,00"
                    aria-required="true"
                    min={SERVICE_MIN_PRICE}
                    step="0.01"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    value={field.value || ''}
                    className={SERVICES_INPUT_CLASS}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {!isEditing && (
          <FormField
            name="isActive"
            control={form.control}
            render={({ field }) => (
              <label
                className={cn(
                  PARTNER_SOFT_SURFACE_CLASS,
                  'flex items-center justify-between gap-2.5 rounded-[14px] px-3.5 py-3 text-sm font-semibold',
                )}
              >
                <span>
                  Serviço ativo
                  <span
                    className={cn(
                      'block text-[13px] font-medium',
                      PARTNER_MUTED_TEXT_CLASS,
                    )}
                  >
                    Disponível para agendamento
                  </span>
                </span>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="data-[state=checked]:bg-[#0B0B0F]"
                />
              </label>
            )}
          />
        )}
      </div>

      <div className="flex shrink-0 gap-2.5 px-5 pt-3.5 pb-5 sm:px-7 sm:pb-7">
        <button
          type="button"
          onClick={handleClose}
          className={cn(SERVICES_BUTTON_CLASS, SERVICES_MODAL_ACTION_CLASS)}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className={cn(
            SERVICES_PRIMARY_BUTTON_CLASS,
            SERVICES_MODAL_ACTION_CLASS,
          )}
        >
          {isSaving && <Spinner />}
          {isSaving && 'Salvando...'}
          {!isSaving && (isEditing ? 'Salvar serviço' : 'Criar serviço')}
        </button>
      </div>
    </form>
  );
};
