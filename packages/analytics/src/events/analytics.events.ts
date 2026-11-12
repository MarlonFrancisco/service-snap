/**
 * Catálogo de eventos do produto: o contrato entre quem dispara e quem coleta.
 *
 * Os nomes seguem os eventos recomendados do GA4 quando existe um equivalente
 * (`search`, `view_item_list`, `select_item`, `view_item`, `add_to_cart`,
 * `add_to_wishlist`, `share`, `select_content`, `generate_lead`, `login`,
 * `sign_up`, `begin_checkout`, `add_payment_info`, `purchase`), para que os
 * relatórios padrão funcionem sem mapeamento extra. Os demais usam snake_case
 * no formato objeto_ação.
 *
 * Nunca envie dados pessoais (e-mail, telefone, nome, texto livre digitado
 * pelo usuário) nas propriedades.
 */
export interface IAnalyticsEventMap {
  // ── Descoberta e busca ──────────────────────────────────────────────
  search: {
    search_term: string;
    category?: string;
    location?: string;
    results_count?: number;
    source?: TSearchSource;
  };
  search_no_results: {
    search_term: string;
    category?: string;
    location?: string;
  };
  search_failed: { search_term: string };
  view_item_list: {
    item_list_name: string;
    results_count: number;
    item_ids?: string[];
  };
  select_item: {
    item_id: string;
    item_list_name: string;
    index?: number;
  };
  select_content: {
    content_type: string;
    item_id?: string;
    destination?: string;
  };
  partner_cta_clicked: {
    placement: string;
    destination?: string;
    segment?: string;
    is_active_partner?: boolean;
  };
  faq_opened: { page: string; question_index: number };
  footer_link_clicked: { destination: string };
  locale_changed: { setting: TLocaleSetting; value?: string };
  referral_link_landed: Record<string, never>;
  sign_up_deep_link: Record<string, never>;
  add_to_wishlist: { item_id: string; source: string };
  remove_from_wishlist: { item_id: string; source: string };
  contact_whatsapp_clicked: { store_id: string; placement: string };
  contact_phone_clicked: { store_id: string; placement: string };

  // ── Loja e agendamento do cliente ───────────────────────────────────
  view_item: {
    item_id: string;
    services_count: number;
    review_count?: number;
    rating?: number;
    currency?: string;
  };
  store_not_found: { store_id: string };
  share: {
    method: TShareMethod;
    content_type: TShareContent;
    item_id?: string;
  };
  gallery_opened: { image_index: number; total: number };
  gallery_image_downloaded: { image_index: number };
  reviews_opened: { store_id: string; review_count?: number };
  social_link_clicked: { network: string; store_id?: string; page?: string };
  add_to_cart: {
    item_id: string;
    store_id: string;
    price: number;
    quantity: number;
    duration?: number;
  };
  remove_from_cart: { item_id: string; store_id: string; price: number };
  booking_started: {
    store_id: string;
    service_id?: string;
  };
  booking_step_completed: {
    store_id: string;
    from_step: TBookingStep;
    to_step: TBookingStep;
    services_count: number;
    total_price: number;
    total_duration: number;
  };
  booking_step_back: { store_id: string; from_step: TBookingStep };
  booking_services_pruned: {
    store_id: string;
    removed_count: number;
    professional_id: string;
  };
  select_professional: {
    store_id: string;
    is_any_professional: boolean;
    professional_id?: string;
  };
  select_date: { store_id: string; days_ahead: number; weekday: number };
  select_time_slot: {
    store_id: string;
    time: string;
    professional_id?: string;
  };
  no_slots_available: {
    store_id: string;
    date: string;
    professional_id?: string;
  };
  slots_load_failed: { store_id: string; date: string };
  booking_confirm_clicked: {
    store_id: string;
    service_ids: string[];
    value: number;
    currency: string;
  };
  booking_completed: {
    store_id: string;
    service_ids: string[];
    value: number;
    currency: string;
    appointment_ids?: string[];
    professional_id?: string;
  };
  booking_failed: {
    store_id: string;
    reason: TBookingFailureReason;
    http_status?: number;
  };

  // ── Login e cadastro ────────────────────────────────────────────────
  login_modal_opened: { source: TLoginSource };
  login_modal_closed: { step: TAuthStep };
  auth_step_viewed: { step: TAuthStep };
  login_code_requested: { method: TAuthMethod };
  login_code_resent: { method: TAuthMethod };
  login: { method: TAuthMethod };
  login_failed: { method: TAuthMethod; stage: TLoginFailureStage };
  sign_up: { method: TAuthMethod; has_referral?: boolean };
  sign_up_failed: { method: TAuthMethod };
  profile_type_selected: { profile_type: 'client' | 'partner' };

  // ── Perfil do cliente ───────────────────────────────────────────────
  profile_tab_viewed: { tab: string };
  appointment_details_opened: { appointment_id: string; store_id?: string };
  appointment_cancel_started: { appointment_id: string };
  appointment_cancel_failed: {
    appointment_id: string;
    source: TAppointmentSource;
  };
  rebook_clicked: { store_id: string };
  review_started: { store_id: string; source: string };
  review_submitted: {
    store_id: string;
    rating: number;
    comment_length: number;
  };
  review_failed: { reason: string; store_id?: string };
  avatar_updated: Record<string, never>;
  avatar_update_failed: Record<string, never>;
  account_deleted: Record<string, never>;
  referral_shared: {
    action: 'copy_code' | 'copy_link' | 'share';
    variant: 'client' | 'partner';
    method?: TShareMethod;
  };

  // ── Contato e consentimento ─────────────────────────────────────────
  generate_lead: {
    method: 'mailto';
    has_subject: boolean;
    message_length: number;
  };
  contact_email_clicked: { page: string };
  consent_updated: {
    analytics: boolean;
    marketing: boolean;
  };

  // ── Planos, checkout e assinatura ───────────────────────────────────
  plans_viewed: {
    source: 'pricing' | 'upgrade';
    billing_period: TBillingPeriod;
    current_plan_id?: string;
  };
  billing_period_toggled: {
    billing_period: TBillingPeriod;
    source: 'pricing' | 'upgrade';
  };
  roi_calculated: { appointments: number; avg_price: number };
  begin_checkout: {
    plan_id: string;
    billing_period: TBillingPeriod;
    value: number;
    currency: string;
    from_plan_id?: string;
    change_type?: TPlanChangeType;
  };
  add_payment_info: { plan_id?: string; price_id?: string };
  checkout_failed: { reason: string; source: string };
  checkout_status: { status: string };
  checkout_retry: Record<string, never>;
  purchase: {
    transaction_id: string;
    plan_id: string;
    billing_period: TBillingPeriod;
    value: number;
    currency: string;
  };
  partner_onboarding_started: Record<string, never>;
  current_plan_viewed: { plan_id?: string; cancel_scheduled: boolean };
  subscription_cancel_started: { plan_id?: string };
  /** Cancelamento agendado para o fim do período pago. */
  subscription_cancel_scheduled: {
    plan_id: string;
    billing_period?: TBillingPeriod;
  };
  subscription_cancel_failed: Record<string, never>;
  subscription_reactivated: { plan_id?: string };
  invoice_downloaded: { status?: string };

  // ── Onboarding do parceiro ──────────────────────────────────────────
  onboarding_step_viewed: {
    step: TOnboardingView;
    step_index: number;
    is_resume: boolean;
  };
  onboarding_business_type_selected: {
    business_type: string;
    is_custom: boolean;
  };
  onboarding_step_completed: {
    step: TOnboardingStep;
    services_count?: number;
    members_count?: number;
    days_open_count?: number;
  };
  onboarding_service_added: {
    services_count: number;
    is_new_category?: boolean;
    from_suggestion?: boolean;
  };
  onboarding_service_removed: { services_count: number };
  onboarding_team_member_invited: {
    members_count: number;
    plan_limit?: number;
  };
  onboarding_team_member_invite_failed: { error: 'not_found' | 'other' };
  onboarding_photo_uploaded: { count: number };
  onboarding_photo_upload_failed: { reason: TUploadFailureReason };
  onboarding_save_and_exit: {
    step: TOnboardingStep;
    had_changes: boolean;
  };
  onboarding_complete_failed: { missing_step?: string };
  partner_onboarding_completed: {
    store_id: string;
    services_count?: number;
    photos_count?: number;
  };
  onboarding_checklist_viewed: {
    store_id: string;
    completed_count: number;
    total: number;
  };
  onboarding_checklist_dismissed: {
    store_id: string;
    completed_count: number;
  };
  onboarding_checklist_item_clicked: { item_id: string };
  booking_link_copied: {
    store_id: string;
    source: TBookingLinkSource;
    method: TShareMethod;
  };

  // ── Agenda do parceiro ──────────────────────────────────────────────
  agenda_view_changed: { view_mode: string };
  agenda_navigated: {
    direction: 'previous' | 'next' | 'today';
    unit: 'day' | 'week';
  };
  agenda_professional_filtered: { is_all: boolean };
  agenda_focus_mode_toggled: { enabled: boolean };
  agenda_block_mode_toggled: { enabled: boolean };
  appointment_form_opened: { source: string };
  appointment_created: {
    store_id: string;
    service_ids: string[];
    value: number;
    source: TAppointmentSource;
  };
  appointment_create_failed: {
    store_id: string;
    reason: 'conflict' | 'other';
    http_status?: number;
  };
  appointment_cancelled: {
    appointment_id: string;
    store_id: string;
    source: TAppointmentSource;
    hours_before?: number;
  };
  appointment_completed: {
    appointment_id: string;
    store_id: string;
    previous_status: TAppointmentStatus;
  };
  appointment_no_show: {
    appointment_id: string;
    store_id: string;
    previous_status: TAppointmentStatus;
  };
  appointment_status_update_failed: { status: TAppointmentStatus };
  time_blocked: { store_id: string; slots_count: number; is_bulk: boolean };
  time_unblocked: { store_id: string; slots_count: number; is_bulk: boolean };

  // ── Dashboard ───────────────────────────────────────────────────────
  dashboard_viewed: { section: TDashboardSection };
  dashboard_period_changed: { section: TDashboardSection; period: string };
  dashboard_refreshed: { section: TDashboardSection };
  dashboard_load_failed: { section: TDashboardSection };
  customers_exported: { store_id: string; period: string; rows: number };
  monthly_goal_set: {
    store_id: string;
    value: number;
    had_goal: boolean;
    source: 'sales_dashboard' | 'checklist';
  };

  // ── Serviços, lojas e equipe ────────────────────────────────────────
  service_created: { service_id: string; price?: number; duration?: number };
  service_updated: { service_id: string; category_changed?: boolean };
  service_deleted: { service_id: string };
  service_status_changed: { service_id: string; is_active: boolean };
  category_created: { category_id: string };
  category_updated: { category_id: string };
  category_deleted: { category_id: string };
  services_filtered: { has_query: boolean; has_category: boolean };
  store_created: { store_id: string };
  store_updated: { store_id: string };
  store_deleted: { store_id: string };
  store_status_changed: { store_id: string; is_active: boolean };
  store_image_uploaded: { store_id: string; count: number };
  store_image_deleted: { store_id: string };
  store_image_main_set: { store_id: string };
  team_member_invited: { store_id: string; role?: string };
  team_member_updated: { store_id: string; is_active?: boolean };
  team_member_removed: { store_id: string };
  team_member_invite_failed: { store_id: string; http_status?: number };
  active_store_switched: { store_id: string; stores_count: number };
  partner_mutation_failed: { entity: TPartnerEntity; operation: TCrudOperation };

  // ── Notificações e WhatsApp ─────────────────────────────────────────
  reminder_settings_updated: {
    channel: TNotificationChannel;
    enabled: boolean;
    advance_hours?: number;
  };
  reminder_settings_blocked: { reason: string };
  whatsapp_template_submitted: Record<string, never>;
  whatsapp_template_failed: Record<string, never>;
  notification_marked_read: { all: boolean };
  notification_deleted: Record<string, never>;
  whatsapp_connected: { store_id: string; is_first_config: boolean };
  whatsapp_disconnected: { store_id: string };
  whatsapp_config_save_failed: Record<string, never>;
  whatsapp_test_message_sent: { store_id?: string };
  whatsapp_test_message_failed: { store_id?: string };

  // ── Limites do plano e paywall ──────────────────────────────────────
  paywall_viewed: {
    module: TPaywallModule;
    current_plan?: string;
    min_plan?: string;
  };
  paywall_upgrade_clicked: {
    module: TPaywallModule;
    destination: string;
  };
  plan_limit_reached: {
    limit_type: TPlanLimitType;
    current: number;
    limit: number;
    source: TPlanLimitSource;
  };
  plan_limit_warning_viewed: { is_at_limit: boolean; is_near_limit: boolean };
  plan_upgrade_cta_clicked: { source: string };

  // ── Erros de página ─────────────────────────────────────────────────
  /** `digest` liga o evento ao log do servidor; nunca a mensagem do erro. */
  error_page_viewed: { path: string; digest?: string };
  error_page_retry_clicked: { path: string; digest?: string };
}

export type TAuthMethod = 'google' | 'email';

export type TAuthStep =
  | 'login'
  | 'verification'
  | 'signup'
  | 'profile-selection';

export type TLoginSource =
  | 'header'
  | 'tab_bar'
  | 'checkout'
  | 'favorite'
  | 'plan'
  | 'deep_link'
  | 'other';

export type TLoginFailureStage = 'request_code' | 'verify' | 'google';

export type TBillingPeriod = 'monthly' | 'yearly';

export type TSearchSource = 'home_hero' | 'header';

export type TLocaleSetting = 'country' | 'currency' | 'auto_translate' | 'save';

export type TShareContent = 'store' | 'gallery' | 'referral';

export type TBookingStep = 'services' | 'professional' | 'datetime' | 'checkout';

export type TBookingFailureReason =
  | 'slot_taken'
  | 'no_professional'
  | 'validation'
  | 'api_error';

export type TPlanChangeType = 'new' | 'upgrade' | 'downgrade' | 'interval_change';

export type TOnboardingStep = 'space' | 'hours' | 'services' | 'team' | 'photos';

export type TOnboardingView = 'welcome' | TOnboardingStep | 'ready';

export type TUploadFailureReason = 'type' | 'size' | 'max' | 'api';

export type TBookingLinkSource =
  | 'onboarding_ready'
  | 'home_checklist'
  | 'store_details';

export type TShareMethod = 'clipboard' | 'native_share';

export type TAppointmentSource = 'customer' | 'partner';

export type TAppointmentStatus =
  | 'scheduled'
  | 'completed'
  | 'cancelled'
  | 'no-show';

export type TDashboardSection = 'overview' | 'customers' | 'operational' | 'sales';

export type TPartnerEntity =
  | 'service'
  | 'category'
  | 'store'
  | 'store_image'
  | 'team_member'
  | 'blocked_time'
  | 'notification';

export type TCrudOperation = 'create' | 'update' | 'delete';

export type TNotificationChannel = 'email' | 'sms' | 'whatsapp';

export type TPaywallModule =
  | 'home'
  | 'sales'
  | 'operational'
  | 'customers'
  | 'whatsappReminders'
  | 'whatsappIntegration';

export type TPlanLimitType = 'stores' | 'professionals';

export type TPlanLimitSource = 'stores_page' | 'store_form' | 'onboarding';

export type TAnalyticsEventName = keyof IAnalyticsEventMap;

export type TAnalyticsEventProperties<E extends TAnalyticsEventName> =
  IAnalyticsEventMap[E];
