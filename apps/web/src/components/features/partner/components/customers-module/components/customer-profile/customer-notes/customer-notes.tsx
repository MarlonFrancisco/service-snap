'use client';

import { cn, Spinner, Textarea } from '@repo/ui';
import {
  CUSTOMERS_CARD_CLASS,
  CUSTOMERS_CARD_LEAD_CLASS,
  CUSTOMERS_CARD_TITLE_CLASS,
  CUSTOMERS_PRIMARY_BUTTON_CLASS,
  CUSTOMERS_SMALL_BUTTON_CLASS,
  CUSTOMERS_TEXTAREA_CLASS,
} from '../../../customers-module.styles';
import { MAX_CUSTOMER_NOTES_LENGTH } from '../../../customers-module.helpers';
import { useCustomerNotes } from './customer-notes.hook';
import type { TCustomerNotesConfig } from './customer-notes.types';

export const CustomerNotes = (config: TCustomerNotesConfig) => {
  const { draft, setDraft, isDirty, isSaving, handleSave } =
    useCustomerNotes(config);

  return (
    <section
      aria-labelledby="customer-notes-title"
      className={CUSTOMERS_CARD_CLASS}
    >
      <h3 id="customer-notes-title" className={CUSTOMERS_CARD_TITLE_CLASS}>
        Anotações
      </h3>
      <p className={CUSTOMERS_CARD_LEAD_CLASS}>
        Preferências, alergias, o que combinar na próxima vez
      </p>

      <form onSubmit={handleSave}>
        <label htmlFor="customer-notes" className="sr-only">
          Anotações sobre o cliente
        </label>
        <Textarea
          id="customer-notes"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Escreva aqui..."
          maxLength={MAX_CUSTOMER_NOTES_LENGTH}
          aria-describedby="customer-notes-hint"
          className={CUSTOMERS_TEXTAREA_CLASS}
        />
        <p id="customer-notes-hint" className="mt-2 text-[13px] text-[#5F5C6E]">
          Só a equipe da loja vê.
        </p>
        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            disabled={!isDirty || isSaving}
            className={cn(
              CUSTOMERS_PRIMARY_BUTTON_CLASS,
              CUSTOMERS_SMALL_BUTTON_CLASS,
            )}
          >
            {isSaving ? (
              <>
                <Spinner />
                Salvando...
              </>
            ) : (
              'Salvar anotações'
            )}
          </button>
        </div>
      </form>
    </section>
  );
};
