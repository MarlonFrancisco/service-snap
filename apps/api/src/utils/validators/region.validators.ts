import { registerDecorator, type ValidationOptions } from 'class-validator';
import {
  isSupportedCountry,
  isSupportedCurrency,
  isValidPhoneFor,
  isValidPostalCodeFor,
  isValidStateFor,
  isValidTimeZone,
} from '../helpers/region.helpers';

type TValueCheck = (value: unknown) => boolean;
type TCountryCheck = (value: string, country?: string | null) => boolean;

const register = (
  name: string,
  check: TValueCheck,
  defaultMessage: string,
  options?: ValidationOptions,
) =>
  function (object: object, propertyName: string) {
    registerDecorator({
      name,
      target: object.constructor,
      propertyName,
      options: { message: defaultMessage, ...options },
      validator: { validate: check },
    });
  };

/**
 * Valida o campo conforme o país de outro campo do mesmo DTO. Sem país no
 * corpo, vale o país padrão: o mesmo que a loja recebe ao ser criada.
 */
const registerForCountry = (
  name: string,
  check: TCountryCheck,
  countryField: string,
  defaultMessage: string,
  options?: ValidationOptions,
) =>
  function (object: object, propertyName: string) {
    registerDecorator({
      name,
      target: object.constructor,
      propertyName,
      constraints: [countryField],
      options: { message: defaultMessage, ...options },
      validator: {
        validate(value, args) {
          const country = (args.object as Record<string, string>)[
            args.constraints[0]
          ];
          // Campo ausente vira '': o país decide se ele é obrigatório
          return check(typeof value === 'string' ? value : '', country);
        },
      },
    });
  };

export const IsSupportedCountry = (options?: ValidationOptions) =>
  register(
    'isSupportedCountry',
    (value) => typeof value === 'string' && isSupportedCountry(value),
    'País não suportado',
    options,
  );

export const IsSupportedCurrency = (options?: ValidationOptions) =>
  register(
    'isSupportedCurrency',
    (value) =>
      typeof value === 'string' && isSupportedCurrency(value.toUpperCase()),
    'Moeda não suportada',
    options,
  );

export const IsTimeZone = (options?: ValidationOptions) =>
  register(
    'isTimeZone',
    (value) => typeof value === 'string' && isValidTimeZone(value),
    'Fuso horário inválido',
    options,
  );

export const IsPostalCodeFor = (
  countryField = 'country',
  options?: ValidationOptions,
) =>
  registerForCountry(
    'isPostalCodeFor',
    isValidPostalCodeFor,
    countryField,
    'CEP / código postal inválido',
    options,
  );

export const IsStateFor = (
  countryField = 'country',
  options?: ValidationOptions,
) =>
  registerForCountry(
    'isStateFor',
    isValidStateFor,
    countryField,
    'Estado inválido',
    options,
  );

export const IsPhoneFor = (
  countryField = 'country',
  options?: ValidationOptions,
) =>
  registerForCountry(
    'isPhoneFor',
    isValidPhoneFor,
    countryField,
    'Telefone inválido',
    options,
  );
