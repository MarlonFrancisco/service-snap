import { useCallback, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { isCustomAmenity } from '../../../../utils/stores-module.helpers';
import type { TStoreFormSchema } from '../store-form.schema';

export const useBasicInfoTab = () => {
  const form = useFormContext<TStoreFormSchema>();
  const [customAmenity, setCustomAmenity] = useState('');

  const amenities = form.watch('amenities');

  const updateAmenities = useCallback(
    (next: string[]) => {
      form.setValue('amenities', next, {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [form],
  );

  const onToggleAmenity = useCallback(
    (amenity: string) => {
      const current = form.getValues('amenities');
      updateAmenities(
        current.includes(amenity)
          ? current.filter((item) => item !== amenity)
          : [...current, amenity],
      );
    },
    [form, updateAmenities],
  );

  const onAddCustomAmenity = useCallback(() => {
    const amenity = customAmenity.trim();
    const current = form.getValues('amenities');

    if (amenity && !current.includes(amenity)) {
      updateAmenities([...current, amenity]);
    }
    setCustomAmenity('');
  }, [customAmenity, form, updateAmenities]);

  const onRemoveAmenity = useCallback(
    (amenity: string) => {
      updateAmenities(
        form.getValues('amenities').filter((item) => item !== amenity),
      );
    },
    [form, updateAmenities],
  );

  return {
    form,
    amenities,
    customAmenities: amenities.filter(isCustomAmenity),
    customAmenity,
    setCustomAmenity,
    onToggleAmenity,
    onAddCustomAmenity,
    onRemoveAmenity,
  };
};
