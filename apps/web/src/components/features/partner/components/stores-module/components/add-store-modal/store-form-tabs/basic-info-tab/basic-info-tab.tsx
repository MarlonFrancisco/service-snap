import { PARTNER_FOCUS_CLASS } from '@/components/features/partner/partner.styles';
import {
  cn,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Label,
  TabsContent,
  Textarea,
} from '@repo/ui';
import { X } from 'lucide-react';
import {
  STORES_CHIP_CLASS,
  STORES_CHIP_REMOVE_CLASS,
  STORES_COMPACT_BUTTON_CLASS,
  STORES_FIELD_CLASS,
  STORES_FIELDSET_CLASS,
  STORES_HINT_CLASS,
  STORES_LABEL_CLASS,
  STORES_LEGEND_CLASS,
  STORES_TAB_PANEL_CLASS,
  STORES_TEXTAREA_CLASS,
} from '../../../../stores-module.styles';
import {
  AMENITIES_LIST,
  AMENITY_LABELS,
} from '../../../../utils/stores-module.constants';
import { StoreTextField } from '../store-text-field';
import { useBasicInfoTab } from './basic-info-tab.hook';

const CUSTOM_AMENITY_INPUT_ID = 'store-custom-amenity';

export const BasicInfoTab = () => {
  const {
    form,
    amenities,
    customAmenities,
    customAmenity,
    setCustomAmenity,
    onToggleAmenity,
    onAddCustomAmenity,
    onRemoveAmenity,
  } = useBasicInfoTab();

  return (
    <TabsContent value="basic" className={STORES_TAB_PANEL_CLASS}>
      <fieldset className={STORES_FIELDSET_CLASS}>
        <legend className={STORES_LEGEND_CLASS}>Identidade da loja</legend>

        <StoreTextField name="name" label="Nome da loja *" />

        <FormField
          name="description"
          control={form.control}
          render={({ field }) => (
            <FormItem className="gap-1.5">
              <FormLabel className={STORES_LABEL_CLASS}>Descrição *</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={3}
                  maxLength={500}
                  placeholder="Conte o que sua loja oferece e como é o atendimento."
                  className={STORES_TEXTAREA_CLASS}
                />
              </FormControl>
              <p className={STORES_HINT_CLASS}>
                {field.value?.length || 0}/500 caracteres
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
      </fieldset>

      <fieldset className={STORES_FIELDSET_CLASS}>
        <legend className={STORES_LEGEND_CLASS}>Localização</legend>

        <StoreTextField
          name="address"
          label="Endereço *"
          placeholder="Rua, número, complemento"
        />

        <div className="grid grid-cols-1 gap-3 md:grid-cols-[2fr_1fr_1fr]">
          <StoreTextField name="city" label="Cidade *" />
          <StoreTextField name="state" label="Estado *" placeholder="SP" />
          <StoreTextField
            name="zipCode"
            label="CEP *"
            placeholder="00000-000"
            hint="Aceita apenas o formato brasileiro: 00000-000."
          />
        </div>
      </fieldset>

      <fieldset className={STORES_FIELDSET_CLASS}>
        <legend className={STORES_LEGEND_CLASS}>Comodidades</legend>

        <div
          role="group"
          aria-label="Comodidades padrão"
          className="flex flex-wrap gap-2"
        >
          {AMENITIES_LIST.map((amenity) => {
            const isSelected = amenities.includes(amenity);

            return (
              <button
                key={amenity}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onToggleAmenity(amenity)}
                className={cn(
                  'min-h-11 rounded-full border px-3.5 text-[13px] font-semibold transition-colors',
                  PARTNER_FOCUS_CLASS,
                  isSelected
                    ? 'border-[#0B0B0F] bg-[#0B0B0F] text-white'
                    : 'border-[#E3E1EA] bg-white text-[#0B0B0F] hover:bg-[#F7F6FA]',
                )}
              >
                {AMENITY_LABELS[amenity]}
              </button>
            );
          })}
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor={CUSTOM_AMENITY_INPUT_ID} className={STORES_LABEL_CLASS}>
            Outra comodidade
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id={CUSTOM_AMENITY_INPUT_ID}
              value={customAmenity}
              maxLength={30}
              onChange={(event) => setCustomAmenity(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  onAddCustomAmenity();
                }
              }}
              className={STORES_FIELD_CLASS}
            />
            <button
              type="button"
              onClick={onAddCustomAmenity}
              className={cn(STORES_COMPACT_BUTTON_CLASS, 'shrink-0')}
            >
              Adicionar
            </button>
          </div>
          <p className={STORES_HINT_CLASS}>
            {customAmenity.length}/30 caracteres
          </p>
        </div>

        {customAmenities.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {customAmenities.map((amenity) => (
              <li key={amenity} className={STORES_CHIP_CLASS}>
                {amenity}
                <button
                  type="button"
                  aria-label={`Remover ${amenity}`}
                  onClick={() => onRemoveAmenity(amenity)}
                  className={STORES_CHIP_REMOVE_CLASS}
                >
                  <X aria-hidden="true" className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </fieldset>
    </TabsContent>
  );
};
