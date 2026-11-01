import { useFormContext } from 'react-hook-form';
import { AVAILABLE_COLORS, getCategoryColor } from '../../../utils/colors';
import { TCategoryFormData } from '../category.schema';

const COLOR_OPTIONS = AVAILABLE_COLORS.map((value) => ({
  value,
  ...getCategoryColor(value),
}));

export const useCategoryForm = () => {
  const form = useFormContext<TCategoryFormData>();

  return { form, colorOptions: COLOR_OPTIONS };
};
