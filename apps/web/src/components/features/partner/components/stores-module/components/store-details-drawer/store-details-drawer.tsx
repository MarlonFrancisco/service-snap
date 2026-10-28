import { StorePublicPresence } from '@/components/features/partner/components/stores-module/components/store-public-presence';
import { useStoreMutations } from '@/hooks/partner/store/use-store-mutations/use-store-mutations.hook';
import { useStoresStore } from '@/store';
import {
  Badge,
  Button,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  ScrollArea,
} from '@repo/ui';
import {
  Clock,
  Mail,
  MapPin,
  Phone,
  Settings,
  Trash2,
} from 'lucide-react';

export const StoreDetailsDrawer = () => {
  const {
    store,
    isViewDetailsStoreOpen,
    setViewDetailsStore,
    setIsAddModalOpen,
  } = useStoresStore();
  const { deleteStoreMutation } = useStoreMutations();

  if (!store?.id) return null;

  return (
    <Drawer
      open={isViewDetailsStoreOpen}
      onOpenChange={(open) => !open && setViewDetailsStore({ isOpen: false })}
    >
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="border-b border-gray-200">
          <DrawerTitle className="text-gray-900">{store?.name}</DrawerTitle>
          <DrawerDescription className="text-gray-600">
            Detalhes da loja
          </DrawerDescription>
        </DrawerHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Description */}
            <div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {store.description}
              </p>
            </div>

            {/* Address */}
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-gray-600 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-1">Endereço</p>
                  <p className="text-sm text-gray-900 leading-snug mb-1">
                    {store.address}
                  </p>
                  <p className="text-xs text-gray-600">
                    {store.city} - {store.state}
                  </p>
                  {store.zipCode && (
                    <p className="text-xs text-gray-600">
                      CEP: {store.zipCode}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 gap-2.5">
              <div className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Phone className="h-4 w-4 text-gray-600 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">Telefone</p>
                  <p className="text-sm text-gray-900">{store.telephone}</p>
                </div>
              </div>

              {store.email && (
                <div className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <Mail className="h-4 w-4 text-gray-600 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500 mb-0.5">E-mail</p>
                    <p className="text-sm text-gray-900 truncate">
                      {store.email}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Clock className="h-4 w-4 text-gray-600 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">
                    Horário de Funcionamento
                  </p>
                  <p className="text-sm text-gray-900">horários variados</p>
                </div>
              </div>
            </div>

            <StorePublicPresence
              storeId={store.id}
              instagram={store.instagram}
            />

            {/* Amenities */}
            {store.amenities && store.amenities.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Comodidades</p>
                <div className="flex flex-wrap gap-1.5">
                  {store.amenities.map((amenity) => (
                    <Badge
                      key={amenity}
                      variant="outline"
                      className="text-xs border-gray-300 bg-white"
                    >
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <DrawerFooter className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddModalOpen({ isOpen: true, store });
              }}
              className="min-h-[48px]"
            >
              <Settings className="h-4 w-4 mr-2" />
              Gerenciar
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                deleteStoreMutation.mutate(store.id!);
              }}
              className="min-h-[48px] text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
