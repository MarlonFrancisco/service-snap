import {
  cn,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/ui';
import { Copy } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import {
  STORES_COMPACT_BUTTON_CLASS,
  STORES_HINT_CLASS,
  STORES_LABEL_CLASS,
} from '../../../../stores-module.styles';
import type { TStoreFormSchema } from '../store-form.schema';
import { STORE_SLUG_PREFIX } from './store-slug-field.helpers';
import { useStoreSlugField } from './store-slug-field.hook';

export const StoreSlugField = () => {
  const form = useFormContext<TStoreFormSchema>();
  const { isVisible, canCopy, isUnsaved, normalizeSlugInput, handleCopyLink } =
    useStoreSlugField();

  if (!isVisible) return null;

  return (
    <div className="grid gap-3">
      <FormField
        name="slug"
        control={form.control}
        render={({ field, fieldState }) => (
          <FormItem className="min-w-0 gap-1.5">
            <FormLabel className={STORES_LABEL_CLASS}>Link da loja</FormLabel>
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <div
                className={cn(
                  'flex h-[50px] min-w-0 flex-1 items-center overflow-hidden rounded-[14px] border border-[#E3E1EA] bg-white focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#0B0B0F]',
                  fieldState.invalid && 'border-[1.5px] border-[#A4231A]',
                )}
              >
                <span
                  aria-hidden="true"
                  className="flex h-full max-w-[55%] shrink-0 items-center truncate bg-[#F7F6FA] pr-1 pl-3.5 text-[15px] font-medium text-[#5F5C6E]"
                >
                  {STORE_SLUG_PREFIX}
                </span>
                <FormControl>
                  <input
                    ref={field.ref}
                    name={field.name}
                    onBlur={field.onBlur}
                    type="text"
                    inputMode="url"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    maxLength={60}
                    value={field.value ?? ''}
                    onChange={(event) =>
                      field.onChange(normalizeSlugInput(event.target.value))
                    }
                    className="h-12 min-w-0 flex-1 border-0 bg-transparent pr-3.5 pl-1 text-[15px] font-semibold text-[#0B0B0F] outline-none"
                  />
                </FormControl>
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                disabled={!canCopy}
                className={cn(
                  STORES_COMPACT_BUTTON_CLASS,
                  'min-h-12 shrink-0 px-[22px] text-sm font-bold',
                )}
              >
                <Copy aria-hidden="true" className="size-4 stroke-[1.8]" />
                Copiar link
              </button>
            </div>
            <FormMessage className="text-[13px] font-semibold text-[#A4231A]" />
            <FormDescription className={STORES_HINT_CLASS}>
              {isUnsaved
                ? 'Salve as alterações para usar o novo link.'
                : 'Letras minúsculas, números e hífen, de 3 a 60 caracteres.'}
            </FormDescription>
          </FormItem>
        )}
      />

      <p className="rounded-[14px] bg-[#F7F6FA] px-3.5 py-3 text-[13px] leading-normal">
        Links antigos com o código da loja continuam funcionando e levam para
        este. Se você trocar o link, o anterior para de funcionar.
      </p>
    </div>
  );
};
