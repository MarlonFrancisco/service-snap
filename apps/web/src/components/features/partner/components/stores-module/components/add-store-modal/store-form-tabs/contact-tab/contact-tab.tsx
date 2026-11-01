import { TabsContent } from '@repo/ui';
import {
  STORES_FIELDSET_CLASS,
  STORES_LEGEND_CLASS,
  STORES_TAB_PANEL_CLASS,
  STORES_TWO_COLUMNS_CLASS,
} from '../../../../stores-module.styles';
import { StoreTextField } from '../store-text-field';

export const ContactTab = () => (
  <TabsContent value="contact" className={STORES_TAB_PANEL_CLASS}>
    <fieldset className={STORES_FIELDSET_CLASS}>
      <legend className={STORES_LEGEND_CLASS}>Contato</legend>

      <div className={STORES_TWO_COLUMNS_CLASS}>
        <StoreTextField name="telephone" label="Telefone *" type="tel" />
        <StoreTextField
          name="email"
          label="E-mail"
          type="email"
          placeholder="contato@exemplo.com"
        />
      </div>

      <StoreTextField
        name="website"
        label="Website"
        type="url"
        placeholder="https://exemplo.com"
        hint="Informe o endereço completo, com https://"
      />
    </fieldset>

    <fieldset className={STORES_FIELDSET_CLASS}>
      <legend className={STORES_LEGEND_CLASS}>Redes sociais</legend>

      <div className={STORES_TWO_COLUMNS_CLASS}>
        <StoreTextField
          name="instagram"
          label="Instagram"
          placeholder="@sualoja"
        />
        <StoreTextField
          name="facebook"
          label="Facebook"
          placeholder="facebook.com/sualoja"
        />
      </div>
    </fieldset>
  </TabsContent>
);
