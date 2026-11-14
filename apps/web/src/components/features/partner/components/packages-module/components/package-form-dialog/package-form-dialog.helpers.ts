import type {
  IServicePackage,
  TCreateServicePackage,
} from '@/types/api/packages.types';
import { parseMoney, toMoneyInput } from '../../packages-module.helpers';
import {
  PACKAGE_FORM_EMPTY_VALUES,
  type TPackageFormSchema,
} from './package-form-dialog.schema';

export const toPackageFormValues = (
  servicePackage: IServicePackage | null,
): TPackageFormSchema =>
  servicePackage
    ? {
        name: servicePackage.name,
        description: servicePackage.description ?? '',
        price: toMoneyInput(servicePackage.price),
        validityDays: servicePackage.validityDays
          ? String(servicePackage.validityDays)
          : '',
        isActive: servicePackage.isActive,
        items: servicePackage.items.map((item) => ({
          serviceId: item.service.id,
          quantity: String(item.quantity),
        })),
      }
    : PACKAGE_FORM_EMPTY_VALUES;

/** Validade vazia vai como `null`: o pacote não vence, também na edição. */
export const toPackagePayload = (
  values: TPackageFormSchema,
): TCreateServicePackage => ({
  name: values.name.trim(),
  ...(values.description.trim() && {
    description: values.description.trim(),
  }),
  price: parseMoney(values.price) ?? 0,
  validityDays: values.validityDays ? Number(values.validityDays) : null,
  items: values.items.map((item) => ({
    serviceId: item.serviceId,
    quantity: Number(item.quantity),
  })),
});
