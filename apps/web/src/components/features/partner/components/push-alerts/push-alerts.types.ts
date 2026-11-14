/** O que o Início mostra sobre os avisos deste aparelho. */
export type TPushAlertsView =
  | 'hidden'
  | 'prompt'
  | 'active'
  | 'blocked'
  | 'ios-install';

export type TPushDeviceStatus = {
  permission: NotificationPermission;
  isSubscribed: boolean;
};
