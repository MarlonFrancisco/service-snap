import { PARTNER_PORTAL_CLASS } from '@/components/features/partner/partner.styles';
import {
  COUNTRIES,
  CURRENCIES,
  type TCountryCode,
  type TCurrencyCode,
} from '@repo/shared/constants';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  getFlagEmoji,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  TabsContent,
} from '@repo/ui';
import {
  STORES_FIELDSET_CLASS,
  STORES_HINT_CLASS,
  STORES_LABEL_CLASS,
  STORES_LEGEND_CLASS,
  STORES_SELECT_TRIGGER_CLASS,
  STORES_TAB_PANEL_CLASS,
} from '../../../../stores-module.styles';
import { useRegionTab } from './region-tab.hook';

export const RegionTab = () => {
  const {
    form,
    countryGroups,
    timezoneGroups,
    handleCountryChange,
    getTimezoneLabel,
  } = useRegionTab();

  return (
    <TabsContent value="region" className={STORES_TAB_PANEL_CLASS}>
      <fieldset className={STORES_FIELDSET_CLASS}>
        <legend className={STORES_LEGEND_CLASS}>País e região</legend>

        <FormField
          name="country"
          control={form.control}
          render={({ field }) => (
            <FormItem className="gap-1.5">
              <FormLabel className={STORES_LABEL_CLASS}>País *</FormLabel>
              <Select value={field.value} onValueChange={handleCountryChange}>
                <FormControl>
                  <SelectTrigger
                    ref={field.ref}
                    className={STORES_SELECT_TRIGGER_CLASS}
                  >
                    <SelectValue placeholder="Selecione o país">
                      {field.value ? (
                        <span className="flex items-center gap-2">
                          <span aria-hidden="true">
                            {getFlagEmoji(field.value)}
                          </span>
                          {COUNTRIES[field.value as TCountryCode]?.nativeName}
                        </span>
                      ) : null}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent className={PARTNER_PORTAL_CLASS}>
                  {countryGroups.map((group) => (
                    <SelectGroup key={group.label}>
                      <SelectLabel>{group.label}</SelectLabel>
                      {group.codes.map((code) => (
                        <SelectItem key={code} value={code}>
                          <span className="flex items-center gap-2">
                            <span aria-hidden="true">{getFlagEmoji(code)}</span>
                            {COUNTRIES[code].nativeName}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription className={STORES_HINT_CLASS}>
                O país preenche a moeda e o fuso horário. O CEP continua
                aceitando apenas o formato brasileiro (00000-000).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </fieldset>

      <fieldset className={STORES_FIELDSET_CLASS}>
        <legend className={STORES_LEGEND_CLASS}>Moeda</legend>

        <FormField
          name="currency"
          control={form.control}
          render={({ field }) => (
            <FormItem className="gap-1.5">
              <FormLabel className={STORES_LABEL_CLASS}>Moeda *</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger
                    ref={field.ref}
                    className={STORES_SELECT_TRIGGER_CLASS}
                  >
                    <SelectValue placeholder="Selecione a moeda">
                      {field.value
                        ? `${CURRENCIES[field.value as TCurrencyCode]?.name} (${CURRENCIES[field.value as TCurrencyCode]?.symbol} ${field.value})`
                        : null}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent className={PARTNER_PORTAL_CLASS}>
                  {Object.entries(CURRENCIES).map(([code, data]) => (
                    <SelectItem key={code} value={code}>
                      {data.name} ({data.symbol} {code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div
          role="note"
          className="rounded-[14px] bg-[#FFF1E0] px-[18px] py-3.5 text-sm leading-normal text-[#6E3B00]"
        >
          <p className="font-bold">Importante</p>
          <p>
            Depois de criar serviços, alterar a moeda não converte os preços
            automaticamente.
          </p>
        </div>
      </fieldset>

      <fieldset className={STORES_FIELDSET_CLASS}>
        <legend className={STORES_LEGEND_CLASS}>Fuso horário</legend>

        <FormField
          name="timezone"
          control={form.control}
          render={({ field }) => (
            <FormItem className="gap-1.5">
              <FormLabel className={STORES_LABEL_CLASS}>
                Fuso horário *
              </FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger
                    ref={field.ref}
                    className={STORES_SELECT_TRIGGER_CLASS}
                  >
                    <SelectValue placeholder="Selecione o fuso horário">
                      {field.value ? getTimezoneLabel(field.value) : null}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent className={PARTNER_PORTAL_CLASS}>
                  {timezoneGroups.map((group) => (
                    <SelectGroup key={group.label}>
                      <SelectLabel>{group.label}</SelectLabel>
                      {group.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </fieldset>
    </TabsContent>
  );
};
