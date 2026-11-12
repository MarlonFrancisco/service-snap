'use client';

import { cn, Input } from '@repo/ui';
import { X } from 'lucide-react';
import { PARTNER_FOCUS_CLASS } from '../../../../../partner.styles';
import {
  MAX_CUSTOMER_TAG_LENGTH,
  MAX_CUSTOMER_TAGS,
} from '../../../customers-module.helpers';
import {
  CUSTOMERS_BUTTON_CLASS,
  CUSTOMERS_CARD_CLASS,
  CUSTOMERS_CARD_LEAD_CLASS,
  CUSTOMERS_CARD_TITLE_CLASS,
  CUSTOMERS_FIELD_CLASS,
} from '../../../customers-module.styles';
import { useCustomerTags } from './customer-tags.hook';
import type { TCustomerTagsConfig } from './customer-tags.types';

export const CustomerTags = (config: TCustomerTagsConfig) => {
  const {
    newTag,
    setNewTag,
    isSaving,
    isFull,
    canAdd,
    handleAdd,
    handleRemove,
  } = useCustomerTags(config);

  return (
    <section
      aria-labelledby="customer-tags-title"
      aria-busy={isSaving || undefined}
      className={CUSTOMERS_CARD_CLASS}
    >
      <h3 id="customer-tags-title" className={CUSTOMERS_CARD_TITLE_CLASS}>
        Etiquetas
      </h3>
      <p className={CUSTOMERS_CARD_LEAD_CLASS}>
        Até {MAX_CUSTOMER_TAGS} por cliente
      </p>

      {config.tags.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {config.tags.map((tag) => (
            <li
              key={tag}
              className="inline-flex h-11 items-center gap-0.5 rounded-full bg-[#F4F3F7] pr-1 pl-3.5 text-[13px] font-semibold"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemove(tag)}
                disabled={isSaving}
                aria-label={`Remover etiqueta ${tag}`}
                className={cn(
                  'grid size-9 cursor-pointer place-items-center rounded-full text-[#5F5C6E] hover:bg-[#EBE9F0] hover:text-[#0B0B0F] disabled:cursor-default',
                  PARTNER_FOCUS_CLASS,
                )}
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-[#5F5C6E]">Nenhuma etiqueta ainda.</p>
      )}

      <form onSubmit={handleAdd} className="mt-3.5 flex gap-2">
        <label htmlFor="customer-new-tag" className="sr-only">
          Nova etiqueta
        </label>
        <Input
          id="customer-new-tag"
          type="text"
          value={newTag}
          onChange={(event) => setNewTag(event.target.value)}
          placeholder={
            isFull ? 'Limite de etiquetas atingido' : 'Nova etiqueta'
          }
          maxLength={MAX_CUSTOMER_TAG_LENGTH}
          disabled={isFull}
          className={cn(CUSTOMERS_FIELD_CLASS, 'min-w-0 flex-1')}
        />
        <button
          type="submit"
          disabled={!canAdd}
          className={CUSTOMERS_BUTTON_CLASS}
        >
          Adicionar
        </button>
      </form>
    </section>
  );
};
