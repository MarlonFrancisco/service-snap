import {
  PARTNER_MUTED_TEXT_CLASS,
  PARTNER_PORTAL_CLASS,
} from '@/components/features/partner/partner.styles';
import {
  cn,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@repo/ui';
import {
  STORES_DANGER_TEXT_CLASS,
  STORES_DRAWER_CLASS,
  STORES_SECONDARY_BUTTON_CLASS,
} from '../../stores-module.styles';
import { STORE_DELETE_CONSEQUENCE } from '../../utils/stores-module.constants';
import { ConfirmDialog } from '../confirm-dialog';
import { StorePublicPresence } from '../store-public-presence';
import { useStoreDetailsDrawer } from './store-details-drawer.hook';

const DETAIL_LABEL_CLASS = cn('text-xs', PARTNER_MUTED_TEXT_CLASS);
const DETAIL_VALUE_CLASS = 'mt-0.5 font-semibold break-words';

export const StoreDetailsDrawer = () => {
  const {
    store,
    isOpen,
    isDeleting,
    hoursLabel,
    locationLabel,
    handleOpenChange,
    handleManage,
    handleDelete,
  } = useStoreDetailsDrawer();

  if (!store.id) return null;

  return (
    <Drawer open={isOpen} onOpenChange={handleOpenChange}>
      <DrawerContent className={cn(PARTNER_PORTAL_CLASS, STORES_DRAWER_CLASS)}>
        <DrawerHeader className="border-b border-[#EBE9F0] text-left">
          <DrawerTitle className="text-xl font-extrabold tracking-[-0.02em]">
            {store.name}
          </DrawerTitle>
          <DrawerDescription className={PARTNER_MUTED_TEXT_CLASS}>
            Detalhes da loja
          </DrawerDescription>
        </DrawerHeader>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <p className={cn('text-sm leading-normal', PARTNER_MUTED_TEXT_CLASS)}>
            {store.description}
          </p>

          <dl className="m-0 mt-4 grid gap-3.5 text-sm">
            <div>
              <dt className={DETAIL_LABEL_CLASS}>Endereço</dt>
              <dd className={DETAIL_VALUE_CLASS}>{locationLabel}</dd>
            </div>
            {store.zipCode ? (
              <div>
                <dt className={DETAIL_LABEL_CLASS}>CEP</dt>
                <dd className={DETAIL_VALUE_CLASS}>{store.zipCode}</dd>
              </div>
            ) : null}
            <div>
              <dt className={DETAIL_LABEL_CLASS}>Horário</dt>
              <dd className={DETAIL_VALUE_CLASS}>{hoursLabel}</dd>
            </div>
            <div>
              <dt className={DETAIL_LABEL_CLASS}>Telefone</dt>
              <dd className={DETAIL_VALUE_CLASS}>{store.telephone}</dd>
            </div>
            {store.email ? (
              <div>
                <dt className={DETAIL_LABEL_CLASS}>E-mail</dt>
                <dd className={DETAIL_VALUE_CLASS}>{store.email}</dd>
              </div>
            ) : null}
          </dl>

          <StorePublicPresence
          storeId={store.id}
          slug={store.slug}
          instagram={store.instagram}
        />

          {store.amenities?.length ? (
            <div className="mt-4">
              <p className={DETAIL_LABEL_CLASS}>Comodidades</p>
              <ul className="mt-1.5 flex flex-wrap gap-1.5">
                {store.amenities.map((amenity) => (
                  <li
                    key={amenity}
                    className="rounded-full bg-[#F4F3F7] px-2.5 py-1 text-[13px] font-semibold"
                  >
                    {amenity}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <DrawerFooter className="grid grid-cols-2 gap-2 border-t border-[#EBE9F0]">
          <button
            type="button"
            onClick={handleManage}
            className={STORES_SECONDARY_BUTTON_CLASS}
          >
            Gerenciar
          </button>
          <ConfirmDialog
            title={`Excluir a loja ${store.name}?`}
            description={STORE_DELETE_CONSEQUENCE}
            cancelLabel="Manter loja"
            confirmLabel="Excluir loja"
            onConfirm={handleDelete}
            trigger={
              <button
                type="button"
                disabled={isDeleting}
                className={cn(
                  STORES_SECONDARY_BUTTON_CLASS,
                  STORES_DANGER_TEXT_CLASS,
                )}
              >
                {isDeleting ? 'Excluindo...' : 'Excluir loja'}
              </button>
            }
          />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
