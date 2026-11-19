'use client';

import { COUNTRIES } from '@repo/shared/constants';
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
import { RegionSection } from './components/region-section';
import { useLocaleDialog } from './locale-dialog.hook';
import type { TLocaleDialogConfig } from './locale-dialog.types';

export const LocaleDialog = ({ open, onOpenChange }: TLocaleDialogConfig) => {
  const {
    country,
    autoTranslate,
    regions,
    recommendedCountries,
    handleCountrySelect,
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
            <TabsList className="grid w-fit grid-cols-1 h-auto p-0 bg-transparent gap-4">
              <TabsTrigger
                value="region"
                className="px-0 pb-3 data-[state=active]:bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-b-neutral-950 font-medium"
              >
                Idioma e região
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
          </ScrollArea>
        </Tabs>

        <div className="border-t px-6 py-4 flex justify-end">
          <Button onClick={handleSave}>Salvar preferências</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
