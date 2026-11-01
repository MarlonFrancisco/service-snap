import {
  cn,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Spinner,
} from '@repo/ui';
import { Check } from 'lucide-react';
import type { FormEvent } from 'react';
import {
  PARTNER_FOCUS_CLASS,
  PARTNER_MUTED_TEXT_CLASS,
} from '../../../../../partner.styles';
import {
  SERVICES_BUTTON_CLASS,
  SERVICES_FIELD_LABEL_CLASS,
  SERVICES_INPUT_CLASS,
  SERVICES_MODAL_ACTION_CLASS,
  SERVICES_PRIMARY_BUTTON_CLASS,
} from '../../../services-module.styles';
import { useCategoryForm } from './category-form.hook';

type TCategoryFormConfig = {
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export const CategoryForm = ({
  isSaving,
  onCancel,
  onSubmit,
}: TCategoryFormConfig) => {
  const { form, colorOptions } = useCategoryForm();

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className="grid min-h-0 flex-1 gap-3.5 overflow-y-auto px-5 py-1 sm:px-7">
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel className={SERVICES_FIELD_LABEL_CLASS}>
                Nome da categoria *
              </FormLabel>
              <FormControl>
                <input
                  placeholder="Ex: Barbearia"
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
                <input
                  placeholder="Descreva a categoria"
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
          name="color"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <fieldset className="m-0 border-0 p-0">
                <legend className="mb-2 p-0 text-sm font-semibold">
                  Cor da categoria
                </legend>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => {
                    const isSelected = field.value === color.value;

                    return (
                      <button
                        key={color.value}
                        type="button"
                        aria-label={color.label}
                        aria-pressed={isSelected}
                        title={color.label}
                        onClick={() => field.onChange(color.value)}
                        className={cn(
                          'grid size-11 place-items-center rounded-full border-2 border-transparent text-white',
                          color.swatchClass,
                          isSelected && 'border-[#0B0B0F]',
                          PARTNER_FOCUS_CLASS,
                        )}
                      >
                        {isSelected && (
                          <Check className="size-4" aria-hidden="true" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
              <FormMessage />
            </FormItem>
          )}
        />

        <p
          className={cn('text-[13px] leading-normal', PARTNER_MUTED_TEXT_CLASS)}
        >
          As categorias organizam seus serviços e facilitam a busca dos
          clientes.
        </p>
      </div>

      <div className="flex shrink-0 gap-2.5 px-5 pt-3.5 pb-5 sm:px-7 sm:pb-7">
        <button
          type="button"
          onClick={onCancel}
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
          {isSaving ? 'Salvando...' : 'Salvar categoria'}
        </button>
      </div>
    </form>
  );
};
