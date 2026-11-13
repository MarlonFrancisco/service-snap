'use client';

import { useCustomersMutations } from '@/hooks/partner/use-customers-mutations';
import type { FormEvent } from 'react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import {
  MAX_CUSTOMER_TAGS,
  normalizeNewTag,
} from '../../../customers-module.helpers';
import type { TUseCustomerTagsConfig } from './customer-tags.types';

/** Cada etiqueta adicionada ou removida já grava na ficha (`PATCH`). */
export const useCustomerTags = ({
  storeId,
  userId,
  tags,
}: TUseCustomerTagsConfig) => {
  const [newTag, setNewTag] = useState('');
  const { updateCustomerMutation } = useCustomersMutations({ storeId });
  const isSaving = updateCustomerMutation.isPending;
  const isFull = tags.length >= MAX_CUSTOMER_TAGS;

  const saveTags = useCallback(
    (nextTags: string[], onSaved?: () => void) => {
      updateCustomerMutation.mutate(
        { userId, changes: { tags: nextTags } },
        {
          onSuccess: () => onSaved?.(),
          onError: () => toast.error('Não foi possível salvar as etiquetas'),
        },
      );
    },
    [updateCustomerMutation, userId],
  );

  const handleAdd = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (isFull || isSaving) return;

    const tag = normalizeNewTag(newTag, tags);

    if (!tag) {
      setNewTag('');
      return;
    }

    saveTags([...tags, tag], () => setNewTag(''));
  };

  const handleRemove = (tag: string) => {
    if (isSaving) return;
    saveTags(tags.filter((item) => item !== tag));
  };

  return {
    newTag,
    setNewTag,
    isSaving,
    isFull,
    canAdd: !isFull && !isSaving && newTag.trim().length > 0,
    handleAdd,
    handleRemove,
  };
};
