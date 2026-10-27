import { cn } from '@repo/ui/lib/utils';
import * as React from 'react';
import { CountryFlag } from './country-flag';
import { Input } from './input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';

export interface PhoneCodeOption {
  countryCode: string;
  phoneCode: string;
  name: string;
}

export interface PhoneInputProps
  extends Omit<React.ComponentProps<'input'>, 'onChange' | 'value'> {
  value?: string;
  onChange?: (value: string) => void;
  countryCode?: string;
  onCountryChange?: (countryCode: string) => void;
  phoneCodeOptions?: PhoneCodeOption[];
  showCountrySelect?: boolean;
  phonePlaceholder?: string;
  /** Mask using `#` for digits, e.g. `(##) #####-####` */
  mask?: string;
  triggerClassName?: string;
  inputClassName?: string;
}

function applyPhoneMask(raw: string, mask?: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!mask) return digits;

  let result = '';
  let digitIndex = 0;

  for (const char of mask) {
    if (digitIndex >= digits.length) break;
    if (char === '#') {
      result += digits[digitIndex];
      digitIndex += 1;
    } else {
      result += char;
    }
  }

  return result;
}

function PhoneInput({
  value = '',
  onChange,
  countryCode = 'BR',
  onCountryChange,
  phoneCodeOptions = [],
  showCountrySelect = true,
  phonePlaceholder = '(00) 00000-0000',
  mask,
  className,
  triggerClassName,
  inputClassName,
  disabled,
  ...props
}: PhoneInputProps) {
  const selectedOption = phoneCodeOptions.find(
    (opt) => opt.countryCode === countryCode,
  );

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(applyPhoneMask(e.target.value, mask));
  };

  const handleCountryChange = (nextCountry: string) => {
    onCountryChange?.(nextCountry);
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {showCountrySelect && phoneCodeOptions.length > 0 && (
        <Select
          value={countryCode}
          onValueChange={handleCountryChange}
          disabled={disabled}
        >
          <SelectTrigger
            className={cn(
              'w-[7.5rem] shrink-0 [&>span]:flex [&>span]:items-center',
              triggerClassName,
            )}
          >
            <SelectValue>
              {selectedOption && (
                <span className="flex items-center gap-2 leading-none">
                  <CountryFlag code={selectedOption.countryCode} />
                  <span className="text-sm font-medium text-foreground">
                    {selectedOption.phoneCode}
                  </span>
                </span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {phoneCodeOptions.map((option) => (
              <SelectItem key={option.countryCode} value={option.countryCode}>
                <span className="flex items-center gap-2 leading-none">
                  <CountryFlag code={option.countryCode} />
                  <span className="w-10 text-sm">{option.phoneCode}</span>
                  <span className="truncate text-sm text-muted-foreground">
                    {option.name}
                  </span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <Input
        type="tel"
        inputMode="tel"
        value={value}
        onChange={handlePhoneChange}
        placeholder={phonePlaceholder}
        disabled={disabled}
        className={cn('flex-1', inputClassName)}
        {...props}
      />
    </div>
  );
}

export { PhoneInput, applyPhoneMask };
