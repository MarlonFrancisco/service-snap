import { useStoresQuery } from '@/hooks/use-query/use-stores-query/use-stores-query.hook';
import { usePartnerStore } from '@/store/partner';
import { cookies } from '@/utils/helpers/cookie.helper';
import { useMemo } from 'react';
import type { TStoreMemberRole } from './use-agenda-member-role.types';

/**
 * Papel de quem está logado na loja ativa. O `memberRole` vem na lista de
 * lojas (`GET /partner/stores`); antes de a loja ativa carregar, vale a
 * primeira da lista, que é a que o painel abre. Sem papel, é dono.
 */
export const useAgendaMemberRole = () => {
  const { stores } = useStoresQuery();
  const activeStoreId = usePartnerStore((state) => state.activeStore.id);
  const activeMemberRole = usePartnerStore(
    (state) => state.activeStore.memberRole,
  );
  const storeMembers = usePartnerStore(
    (state) => state.activeStore.storeMembers,
  );

  const storeId = activeStoreId || stores[0]?.id;
  const role: TStoreMemberRole =
    activeMemberRole ??
    stores.find((store) => store.id === storeId)?.memberRole ??
    'owner';

  const ownMember = useMemo(() => {
    const userId = cookies.get('user_identification');
    return userId
      ? storeMembers?.find((member) => member.user?.id === userId)
      : undefined;
  }, [storeMembers]);

  return {
    role,
    isProfessional: role === 'professional',
    canManageStore: role !== 'professional',
    ownMember,
  };
};
