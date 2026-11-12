'use client';

import { useCustomersMutations } from '@/hooks/partner/use-customers-mutations';
import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { TUseCustomerNotesConfig } from './customer-notes.types';

export const useCustomerNotes = ({
  storeId,
  userId,
  notes,
}: TUseCustomerNotesConfig) => {
  const savedNotes = notes ?? '';
  const [draft, setDraft] = useState(savedNotes);
  const { updateCustomerMutation } = useCustomersMutations({ storeId });

  // Outra ficha ou anotação salva em outro lugar: o rascunho acompanha
  useEffect(() => {
    setDraft(savedNotes);
  }, [savedNotes, userId]);

  const isDirty = draft.trim() !== savedNotes.trim();
  const isSaving = updateCustomerMutation.isPending;

  const handleSave = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (!isDirty || isSaving) return;

    updateCustomerMutation.mutate(
      { userId, changes: { notes: draft.trim() || null } },
      {
        onSuccess: () => toast.success('Anotações salvas'),
        onError: () => toast.error('Não foi possível salvar as anotações'),
      },
    );
  };

  return {
    draft,
    setDraft,
    isDirty,
    isSaving,
    handleSave,
  };
};
