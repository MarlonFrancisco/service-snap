'use client';

import { COUNTRIES, CURRENCIES } from '@repo/shared/constants';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  ScrollArea,
  Separator,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@repo/ui';
import { Languages } from 'lucide-react';
import { CountryOption } from './components/country-option';
import { CurrencyOption } from './components/currency-option';
import { RegionSection } from './components/region-section';
import { useLocaleDialog } from './locale-dialog.hook';
import type { TLocaleDialogConfig } from './locale-dialog.types';

export const LocaleDialog = ({ open, onOpenChange }: TLocaleDialogConfig) => {
  const {
    country,
    currency,
    autoTranslate,
    regions,
    recommendedCountries,
    currencyCodes,
    handleCountrySelect,
    handleCurrencySelect,
    handleAutoTranslateToggle,
    handleSave,
  } = useLocaleDialog({ onOpenChange });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl! max-h-[85vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-lg font-semibold">
            Preferências
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="region" className="w-full">
          <div className="px-6 pt-4">
            <TabsList className="grid w-fit grid-cols-2 h-auto p-0 bg-transparent gap-4">
              <TabsTrigger
                value="region"
                className="px-0 pb-3 data-[state=active]:bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-b-neutral-950 font-medium"
              >
                Idioma e região
              </TabsTrigger>
              <TabsTrigger
                value="currency"
                className="px-0 pb-3 data-[state=active]:bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-b-neutral-950 font-medium"
              >
                Moeda
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-[60vh]">
            <TabsContent value="region" className="mt-0 px-6 py-6">
              {/* Auto Translate Toggle */}
              <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl mb-8">
                <div className="flex items-center gap-3">
                  <Languages className="h-5 w-5 text-neutral-600" />
                  <div>
                    <p className="font-medium text-sm">Tradução</p>
                    <p className="text-xs text-neutral-500">
                      Traduzir automaticamente descrições e avaliações
                    </p>
                  </div>
                </div>
                <Switch
                  checked={autoTranslate}
                  onCheckedChange={handleAutoTranslateToggle}
                />
              </div>

              {/* Recommended */}
              <div className="mb-8">
                <h3 className="text-base font-semibold mb-4">
                  Idiomas e regiões recomendados
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {recommendedCountries.map((code) => {
                    const countryData = COUNTRIES[code];
                    return (
                      <CountryOption
                        key={code}
                        code={code}
                        name={countryData.nativeName}
                        locale={countryData.locale}
                        isSelected={country === code}
                        onClick={() => handleCountrySelect(code)}
                      />
                    );
                  })}
                </div>
              </div>

              <Separator className="my-6" />

              {/* All Countries by Region */}
              <div>
                <h3 className="text-base font-semibold mb-4">
                  Escolha um idioma e uma região
                </h3>

                <RegionSection
                  title="América do Sul"
                  countries={regions.southAmerica}
                  selectedCountry={country}
                  onSelect={handleCountrySelect}
                />

                <RegionSection
                  title="América do Norte"
                  countries={regions.northAmerica}
                  selectedCountry={country}
                  onSelect={handleCountrySelect}
                />

                <RegionSection
                  title="Europa"
                  countries={regions.europe}
                  selectedCountry={country}
                  onSelect={handleCountrySelect}
                />
              </div>
            </TabsContent>

            <TabsContent value="currency" className="mt-0 px-6 py-6">
              <p className="text-sm text-neutral-500 mb-6">
                Escolha a moeda para exibir preços.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {currencyCodes.map((code) => {
                  const currencyData = CURRENCIES[code];
                  return (
                    <CurrencyOption
                      key={code}
                      code={code}
                      name={currencyData.name}
                      symbol={currencyData.symbol}
                      isSelected={currency === code}
                      onClick={() => handleCurrencySelect(code)}
                    />
                  );
                })}
              </div>

              <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-sm text-amber-800">
                  <strong>Nota:</strong> Por enquanto, os planos são cobrados em
                  reais (BRL).
                </p>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="border-t px-6 py-4 flex justify-end">
          <Button onClick={handleSave}>Salvar preferências</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
