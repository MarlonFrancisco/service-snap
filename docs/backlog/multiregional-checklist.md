# Checklist — Multirregional (países, moedas, fusos, idiomas)

Objetivo: a aplicação funcionar para parceiros e clientes de vários países, e não só no Brasil (BRL / `America/Sao_Paulo` / pt-BR).
Mapeamento feito em 08/11/2026 sobre a branch `claude/multiregional-implementation-76a096` (versão 0.26.0).

Marque com `[x]` conforme for fechando. As fases estão em ordem de dependência.

---

## 0. Estado atual (resumo)

**O que já existe**

- `packages/shared/src/constants/countries.ts` define 17 países (BR, AR, CL, CO, PE, US, MX, PT, ES, FR, DE, IT, NL, GB, IE, BE, AT). Cada país tem moeda, locale, DDI, máscara/regex de CEP e timezone.
- `packages/shared/src/formatters/` tem formatters de preço e data parametrizados por locale e moeda.
- `Store` já tem as colunas `country`, `currency` e `timezone` (`apps/api/src/modules/partner/stores/store.entity.ts:72-79`).
- O timezone da loja já é respeitado no cálculo de "agora" e de disponibilidade (`apps/api/src/utils/helpers/schedule.helpers.ts:170-209`).
- O cadastro (signup) já valida e normaliza o telefone por país (E.164).
- O front tem um `locale.store` (país, moeda e locale), mas ele não muda nenhum texto da interface.

**O que trava**

- Não há biblioteca de i18n e todo o texto está em português, tanto na web quanto em e-mails e no WhatsApp.
- Stripe:
  - Os preços só existem em BRL e `SUPPORTED_CURRENCIES = ['BRL']`.
  - O Checkout não recebe `currency`, `locale` nem configuração de impostos.
  - O DTO de plano não devolve a moeda.
  - O `/100` assume moedas de 2 casas decimais.
- O onboarding do parceiro só aceita endereço brasileiro (CEP, UF, telefone com DDD) e não grava país, moeda nem timezone.
- Várias formatações e cálculos de data usam pt-BR, Sao_Paulo ou o relógio UTC do servidor em vez do fuso da loja.
- Não existe nenhuma coluna `timestamptz`.
- Termos de uso, privacidade e consentimento de cookies cobrem só a LGPD e o Brasil.
- Não há Stripe Connect nem pagamento online de agendamento. Hoje o Stripe cobra só a assinatura do parceiro.

---

## 1. Decisões de produto (antes de codar)

- [ ] **Países do lançamento.** Recomendo começar com um grupo pequeno, por exemplo BR + PT + US, e usar a lista de `countries.ts` como teto.
- [ ] **Idiomas.** pt-BR, en e es? Decidir também se pt-PT é separado de pt-BR.
- [ ] **Estratégia de URL por idioma:**
  - prefixo (`/en/...`, `/es/...`), recomendado para SEO e para ter um único domínio;
  - ou domínio por país (`ssnap.io` / `ssnap.com.br`).
- [ ] **Preço por país.** Preço manual por moeda (paridade de poder de compra) ou conversão automática pelo Stripe (Adaptive Pricing)? Detalhes na seção 2.
- [ ] **Moeda da assinatura.** Segue o país da *conta do parceiro*, recomendado, ou o IP de quem acessa?
- [ ] **Entidade Stripe.** Verificar se a conta Stripe atual (país da empresa) pode cobrar em USD/EUR e liquidar nessas moedas. Isso define se dá para usar uma conta só ou se é preciso uma conta por região.
- [ ] **Impostos.** Ativar Stripe Tax e definir onde a empresa precisa se registrar, por exemplo IVA/OSS na União Europeia e sales tax nos EUA. Precisa de contador.
- [ ] **Jurídico.** Termos e privacidade por jurisdição: LGPD, GDPR (UE e Reino Unido) e CCPA (EUA).

---

## 2. Stripe (assinaturas dos parceiros)

### 2.1 Catálogo de preços

Abordagem recomendada: um Price por plano e intervalo, com `currency_options` (preço manual por moeda) e um `lookup_key` estável.

- [ ] Definir as `lookup_key`, por exemplo `basic_monthly`, `basic_yearly`, `pro_monthly`.
  - Hoje os produtos são encontrados **pelo nome** (`apps/api/src/scripts/update-stripe-products-metadata.ts`) e por IDs fixos (`update-annual-prices-discount.ts:15-19`).
  - Trocar isso por `lookup_key` e/ou `product.metadata.PLAN_KEY`.
- [ ] Criar (ou recriar) os Prices com `currency: 'brl'` como padrão e `currency_options` para `usd`, `eur` etc.
  - Observação: os prices são imutáveis. Para adicionar uma moeda a um price existente é preciso criar um price novo e usar `transfer_lookup_key: true`.
  - O desconto anual (`metadata.discount`) precisa continuar coerente em todas as moedas.
- [ ] Atualizar `apps/api/src/scripts/migrate-plans-to-production.ts`. Hoje ele está fixo em `currency: 'brl'` (linhas 165 e 176) e com log em `R$`. A versão nova lê uma tabela de preços por moeda.
- [ ] Traduzir os `marketing_features` e as descrições dos produtos, que hoje estão em português dentro do Stripe.
  - Opção A: guardar chaves de i18n nos metadados e traduzir no front. Recomendo esta.
  - Opção B: metadados por idioma.
- [ ] Atualizar `docs/stripe-plans-config.md`. Ele está desatualizado: diz que o trial é de 7 dias, enquanto o script usa 30, e os limites também divergem.

### 2.2 Listagem de planos (`GET /plans`)

- [ ] `apps/api/src/modules/plans/plans.service.ts:6-16,28-75`:
  - Remover a lista fixa `SUPPORTED_CURRENCIES` e derivar as moedas de `packages/shared` (`currencies.ts`).
  - Buscar os prices por `lookup_keys` com `expand: ['data.currency_options']` e escolher o valor de `currency_options[moeda]`.
  - Colocar o resultado em cache no Redis, como a própria documentação do Stripe recomenda.
- [ ] Hoje, se a moeda pedida não for suportada, a API devolve prices **de todas as moedas** sem filtro. O certo é cair para a moeda padrão.
- [ ] `apps/api/src/modules/plans/plans.dto.ts:42-65`: adicionar `currency` ao `PlanDto` e devolver o `unit_amount` da moeda escolhida.
- [ ] `apps/api/src/modules/plans/plans.controller.ts:13`: tirar o default `'BRL'`. A moeda passa a ser derivada do país do usuário autenticado ou do parâmetro `country`/`currency`.

### 2.3 Checkout (`POST /subscription`)

- [ ] `apps/api/src/modules/subscription/subscription.service.ts:255-270`: incluir em `checkout.sessions.create`:
  - [ ] `currency`: a moeda da conta do parceiro, explícita, para não depender do IP.
  - [ ] `locale`: o idioma do usuário (`'pt-BR'`, `'en'`, `'es'`…) ou `'auto'`.
  - [ ] `automatic_tax: { enabled: true }` e `customer_update: { address: 'auto', name: 'auto' }`, se a decisão sobre Stripe Tax for sim.
  - [ ] `billing_address_collection: 'auto'` (ou `'required'`).
  - [ ] `tax_id_collection: { enabled: true }`, para coletar o VAT de empresas na UE e o CNPJ no Brasil.
  - [ ] `success_url`/`cancel_url` com o prefixo de idioma, se a estratégia de URL for por prefixo.
- [ ] Validar que `price.currency_options` contém a moeda pedida. Hoje a validação (linhas 240-247) só compara com `price.currency`.
- [ ] Payment methods: usar métodos dinâmicos configurados no Dashboard. Pix e boleto só existem em BRL. SEPA e iDEAL exigem EUR. Não fixar `payment_method_types`.
- [ ] **Customer travado em uma moeda.** No Stripe, um customer que já teve assinatura em uma moeda não consegue assinar em outra. Tratar a troca de país de quem já assina: bloquear a troca ou criar um customer novo.

### 2.4 Customer

- [ ] `apps/api/src/modules/users/users.service.ts:74-97,243-252`: enviar `address.country` (de `User.country`) e `preferred_locales: [locale]` ao criar e ao atualizar o customer.
  - Isso define o idioma das faturas e e-mails do Stripe e o endereço usado no cálculo de imposto.
- [ ] Opcional: `tax_id_data` quando o parceiro informar CNPJ ou VAT. Depende da seção 3.4.

### 2.5 Persistência e valores

- [ ] `apps/api/src/modules/subscription/subscription.entity.ts`:
  - adicionar `currency char(3)` e `amount int` (em unidades menores), preenchidos no `syncSubscription` (linhas 346-395);
  - converter `currentPeriodStart/End` de `date` para `timestamptz`.
- [ ] `apps/api/src/modules/subscription/dto/current-plan.dto.ts:144-145` e o `InvoiceDto` (linhas 39-40): trocar o `/100` por um helper que respeite moedas sem casas decimais (CLP, JPY, KRW) e tirar o fallback `'BRL'`.
  - Criar `toMajorUnits(amount, currency)` em `packages/shared`.
- [ ] `getCurrentPlan` (`subscription.service.ts:144-153`): usar o `current_period_end` do Stripe em vez de calcular a data com `setMonth`.

### 2.6 Webhooks e e-mails de cobrança

- [ ] `subscription.service.ts:592-600,637-639`: as datas usam `pt-BR` + `America/Sao_Paulo` e os textos estão em português ("1 dia"). Passar a usar o locale e o timezone do usuário.
- [ ] Os webhooks atuais continuam servindo. Se o Adaptive Pricing for ativado, gravar `presentment_details` (moeda apresentada) do `customer.subscription.created`.
- [ ] Opcional: ativar o **Billing Portal** do Stripe, que tem faturas, cartão e cancelamento já localizados, no lugar dos endpoints próprios de cancelar e reativar (linhas 67-108).

### 2.7 Fora de escopo agora

- **Stripe Connect** e pagamento online de agendamentos: hoje não existem, e o reminder já assume pagamento "no local" (`reminders.service.ts:346-349`).
- Se isso entrar no roadmap, será um projeto separado: contas Connect por país, `application_fee` e moeda da loja.

---

## 3. Backend — modelo de dados e regras regionais

### 3.1 Datas e fusos

- [ ] Migrar `createdAt`/`updatedAt` (`apps/api/src/modules/database/base.entity.ts:11-15`) e os demais `timestamp` para `timestamptz`:
  - `authCodeExpiresAt`;
  - `StoreOnboarding.*At`;
  - `NotificationsHistory.timestamp`.
- [ ] Manter `Schedule.date` + `startTime`/`endTime` como horário de parede da loja (é o modelo certo). Documentar que eles são sempre interpretados no `Store.timezone`.
- [x] Trocar o cálculo de datas no relógio do servidor pelo fuso da loja (a Vercel roda em UTC):
  - `apps/api/src/utils/helpers/metrics.helpers.ts:19-85` (`setHours`, `getDate`, `getMonth`);
  - `new Date()` nos serviços `dashboard-*` (customers:48,294; operational:55; overview:42; sales:44);
  - `apps/api/src/utils/helpers/schedule.helpers.ts:84,99,120` (`toISOString().split('T')[0]`);
  - `reminders.service.ts:200-202`.
- [x] Centralizar o default `America/Sao_Paulo` em uma única constante derivada do país. Hoje ele está espalhado:
  - `store.entity.ts:78`;
  - `schedule.helpers.ts:224`;
  - `schedule/schedule.helpers.ts:42`;
  - `reminders.service.ts:216`;
  - `whatsapp-bot.service.ts:59`.
- [ ] `dashboard-sales.service.ts:325-343`: os nomes dos meses estão fixos em português. Usar `Intl.DateTimeFormat(locale, { month: 'short' })`.

### 3.2 Loja: país, moeda e timezone

- [x] `apps/api/src/modules/partner/onboarding/onboarding.service.ts:155-180`: gravar `country`, `currency` e `timezone` vindos do onboarding. Hoje caem nos defaults BR.
- [x] `create-store.dto.ts:33-53` / `update-store.dto.ts:36-60`:
  - validar `country` com `IsISO31661Alpha2`, restrito aos países de `countries.ts`;
  - validar `currency` com `IsISO4217CurrencyCode`;
  - validar `timezone` como IANA válido (`Intl.supportedValuesOf('timeZone')`).
- [ ] Decidir se a moeda pode mudar depois que já existem serviços e agendamentos. Recomendo travar ou exigir confirmação.

### 3.3 Endereço e telefone

- [x] `onboarding.dto.ts:42,56,60`: a validação de CEP, UF e telefone hoje é fixa para o Brasil. Validar por país usando a regex de CEP e o `stateLabel` de `countries.ts`. Para países sem estados, o estado vira opcional.
- [ ] Endereço genérico na `Store`: avaliar `addressLine2` e renomear semanticamente `zipCode` → `postalCode` e `state` → `region` (com migração).
- [x] Telefone em E.164 com `libphonenumber-js`, que já está no `package.json` mas não é usado:
  - `apps/api/src/utils/helpers/user.helpers.ts:7-15`;
  - `whatsapp-reminder-template.ts:47-56` (hoje coloca `55` em qualquer número de 10 ou 11 dígitos);
  - normalizar os telefones de loja vindos do onboarding.
- [x] Script de migração para converter os telefones existentes (sem DDI) para `+55…`.

### 3.4 Documento fiscal (opcional)

- [ ] Se for preciso nota fiscal ou VAT: adicionar `taxIdType` e `taxId` ao usuário ou à loja (CPF/CNPJ, VAT, EIN), com validação por tipo. Hoje não existe nenhum campo.

### 3.5 Dinheiro

- [x] `apps/api/src/utils/helpers/format.helpers.ts:1-5`: `formatCurrency` está fixo em pt-BR. Ele deve receber `locale` e `currency` (ou `country`). Chamadas que hoje ignoram `Store.currency`:
  - `schedule/schedule.helpers.ts:18`;
  - `whatsapp-bot.service.ts:378,741`.
- [ ] `Service.price` está como `decimal` sem precisão. Definir `numeric(12,2)` e documentar que a moeda é a da loja.
- [x] `Schedule`: adicionar um snapshot `price` + `currency` no momento do agendamento.
  - Hoje a receita do dashboard soma o preço *atual* do serviço (`dashboard-sales-queries.ts:14,23,46`), o que distorce o histórico e mistura moedas.
- [ ] Métricas com várias lojas: não somar valores de moedas diferentes. Agrupar por moeda ou converter.
- [ ] Ajustar os limiares em R$ (VIP > R$1000 em `dashboard-customers-queries.ts:214`) para valores por moeda.

### 3.6 Idioma do usuário

- [ ] Adicionar `User.locale` (ex.: `pt-BR`, `en`, `es`) e opcionalmente `User.timezone`.
- [ ] Interceptor ou decorator que resolve o locale a partir de `User.locale` → `Accept-Language` → default.
- [ ] Traduzir as mensagens de erro e validação da API, ou devolver **códigos** de erro para o front traduzir (recomendo códigos).

---

## 4. Notificações (e-mail e WhatsApp)

- [ ] Os templates Handlebars (`apps/api/src/templates/*.hbs`) estão em português, com `lang='pt-BR'`. Criar um conjunto por idioma ou usar helpers `{{t 'chave'}}` com dicionários.
- [ ] `apps/api/src/modules/notification/notification.service.ts:84-278,137`: assuntos e rodapés em português, e `toLocaleDateString('pt-BR')` sem fuso.
- [ ] `schedule.helpers.ts:290-304`: `formatLongDate` está em pt-BR e usa " às ". Passar a usar locale + timezone da loja (no lembrete ao cliente, usar o idioma do cliente ou o da loja).
- [ ] O valor `{{price}}` dos e-mails de agendamento deve ser formatado com a moeda da loja.
- [ ] WhatsApp: o template da Meta está em `pt_BR` (`whatsapp-reminder-template.ts:6-32`). Registrar e aprovar o template em cada idioma (`en_US`, `es`…) e escolher pelo idioma.
- [ ] Mensagens livres do bot (`whatsapp-bot.service.ts`) e o histórico de notificações (`schedule-notifications.service.ts:79,112,157`) também precisam de tradução.

---

## 5. Frontend

### 5.1 i18n

- [ ] Adotar o **next-intl**, que tem integração nativa com o App Router, mensagens em server components e roteamento por prefixo.
- [ ] `apps/web/src/middleware.ts`: compor o middleware atual (redirect de `/booking`) com a detecção de locale.
- [ ] Mover as rotas para `app/[locale]/...`. Decidir o que fazer com os slugs em português (`/categoria`, `/sistema-de-agendamento`): pathnames localizados no next-intl ou manter.
- [ ] Extrair os textos. São cerca de 180 `.tsx` com português e 112 toasts. Os conteúdos editoriais grandes ficam por último:
  - `business-pages.constants.ts`;
  - `category-guides.constants.ts`;
  - `terms/page.tsx`;
  - `privacy/page.tsx`.
- [ ] `packages/ui`: textos de acessibilidade em idiomas misturados (`pagination.tsx:75,93`, `dialog.tsx:68` etc.). Receber os textos por props ou usar o provider de i18n.
- [ ] Botão do Google Sign-In: o locale está fixo em `pt-BR` (`google-auth.hook.ts:59`).

### 5.2 SEO

- [ ] `app/layout.tsx:80,119`: `lang` e o `inLanguage` do JSON-LD devem ser dinâmicos.
- [ ] `utils/helpers/site-metadata.helper.ts:47-55`: `openGraph.locale` dinâmico e `alternates.languages` (hreflang).
- [ ] `app/sitemap.ts`: entradas por locale, com alternates.
- [ ] `/categoria/[category]/[city]`: incluir o país no slug para evitar colisão entre cidades com o mesmo nome (`category-city.helper.ts:37-42`).
- [ ] `site.constants.ts:7-9` e `platform.constants.ts:3` ("marketplace brasileiro"): traduzir e tornar o texto neutro.

### 5.3 Formatação (usar sempre `packages/shared`)

- [ ] Criar um hook `useRegionFormat()`, com o locale vindo do i18n e a moeda/fuso vindos da loja ou do usuário, que expõe `formatPrice`, `formatDate` e `formatNumber`. Trocar os pontos que hoje estão fixos em pt-BR/BRL:
  - Moeda:
    - `partner-onboarding.helpers.ts:26-28`;
    - `pricing-roi-calculator.hook.ts:21-27`;
    - `pricing-plan-card.hook.ts:8-10`;
    - `plans-module.utils.ts:4-16`;
    - `upgrade-plan.hook.ts:13`;
    - `dashboard-module/utils/metrics.helpers.ts:9,75`.
  - "R$" literal:
    - `services-step.tsx:180`;
    - `services-step.hook.ts:99`;
    - `onboarding-home-checklist.hook.ts:168`;
    - `pricing-roi-calculator.tsx:23,35`;
    - `notification-preview-modal.tsx:27`.
  - Datas:
    - `checkout.hook.ts:16`;
    - `date-time-selection-step.tsx:130`;
    - `date-picker-horizontal.tsx:91,99`;
    - `booking-calendar.tsx` (`ptBR` do react-day-picker, trocar pelo locale dinâmico);
    - `profile-header.hook.ts:7`;
    - `bookings-section.helpers.ts:4-20`;
    - `agenda.helpers.ts:65`;
    - `agenda-grid.helpers.ts:38`;
    - `agenda-grid-mobile-view.hook.ts:25`;
    - `notifications-module.utils.ts:30`;
    - `stores-module.helpers.ts:84`;
    - `payment-history-card.hook.ts:29`;
    - `customer-metrics.hook.ts:147,153`;
    - `review-card.hook.ts:10`.
  - Outros:
    - `packages/ui/.../calendar.tsx:40,196`;
    - `chart.tsx:239`;
    - `csv.helper.ts:1` (separador `;` só para pt-BR);
    - `services-sections.ts:51` (`localeCompare` em pt-BR).
- [ ] `partner-onboarding.helpers.ts`: `maskCurrency`/`parseCurrency` assumem 2 casas decimais. Usar `getCurrencySymbol`/`parsePrice` do shared.

### 5.4 Fuso no agendamento

- [ ] O booking usa o relógio do **cliente** para "hoje" e para os próximos dias (`date-time-selection-step.tsx:25,153`, `date-picker-horizontal.tsx:30,133-136`, `booking.helpers.ts:32-37`). Passar a calcular as datas no `store.timezone`.
- [ ] Mostrar o fuso nos horários quando o fuso do cliente for diferente do da loja ("horário de Lisboa").
- [ ] A agenda do parceiro também deve exibir as datas no fuso da loja.
- [ ] `region-tab.constants.ts`: a lista de fusos tem offsets GMT fixos (ignora horário de verão) e rótulos em português. Gerar a lista a partir de `Intl.supportedValuesOf('timeZone')` com o offset calculado.

### 5.5 Formulários

- [x] Onboarding, etapa de espaço (`space-step.hook.ts:26-32`, `space-step.tsx:92-140`, `partner-onboarding.helpers.ts:5-19`):
  - adicionar um seletor de país (que define moeda e fuso padrão);
  - regex e máscara de CEP, rótulo de estado e `PhoneInput` por país;
  - enviar `country`, `currency` e `timezone` no `TSaveSpacePayload` (`onboarding.types.ts:64-73`).
- [ ] Formulário de loja (`store-form.schema.ts:5,57-64`, `basic-info-tab.tsx:90,93`, `region-tab.tsx:90`): validar CEP e estado conforme o país escolhido. Usar a lista de estados de `countries.ts` quando existir (BR, US).
- [ ] `whatsapp.helper.ts:16-21`: o `wa.me` depende de o telefone estar em E.164 (ver 3.3).

### 5.6 Planos, pricing e checkout

- [ ] `app/pricing/page.tsx:22-23`: o prefetch usa `'BRL'` fixo, enquanto o client usa a moeda do `locale.store`, o que gera refetch e divergência. Derivar a moeda no servidor (cookie de região, header de geolocalização da Vercel `x-vercel-ip-country` ou país do usuário logado).
- [ ] Os cards de plano devem usar o `currency` devolvido pela API (seção 2.2) e o locale do i18n.
- [ ] `pricing-roi-calculator`: trabalhar com a moeda da região.
- [ ] Meta e textos ("teste grátis por 30 dias" em `pricing/page.tsx:13`) e a cláusula "Preços em BRL" (`terms/page.tsx:234`).
- [ ] Analytics: eventos de checkout com a moeda real, sem fallback BRL (`pricing-plan-card.hook.ts:42-48`).

### 5.7 Busca

- [ ] `search.service.ts`: adicionar filtro por país, com default a partir do locale ou da geolocalização, para não misturar resultados de países diferentes.

---

## 6. Jurídico, privacidade e consentimento

- [ ] Banner de cookies (`components/layout/cookie-consent/*`): o modelo opt-in com Consent Mode v2 negado por padrão já atende a GDPR. Faltam:
  - traduzir os textos;
  - trocar a referência "LGPD" por uma menção à lei aplicável conforme a região.
- [ ] Termos e privacidade por jurisdição (`app/terms/page.tsx:417-432`, `app/privacy/page.tsx`):
  - versões para UE/Reino Unido (GDPR: base legal, DPO/representante, transferência internacional com SCCs) e para EUA (CCPA, se aplicável);
  - preencher o placeholder "[CIDADE], Brasil".
- [ ] Contato de DPO/encarregado.

---

## 7. Infraestrutura

- [ ] Fazer o inventário das regiões atuais, que não estão no repositório: função Vercel, Postgres (Neon?), Supabase Storage e Redis.
- [ ] **Residência de dados.** A GDPR não exige dados na UE, mas exige uma base para transferência (SCCs/DPA com Vercel, Neon, Supabase, Resend e Stripe). Recomendo começar com uma região única e os DPAs assinados. Só avaliar DB e storage na UE se algum cliente ou contrato exigir.
- [ ] Latência: com o DB em uma única região, manter a função Vercel na mesma região do DB. O cache Redis e o ISR das páginas públicas já ajudam no restante.
- [ ] CORS (`apps/api/src/main.ts:43-46`): aceita uma única origem. Isso só muda se houver domínio por país.
- [ ] `FRONTEND_URL` usado em links de e-mail e em URLs do Stripe: incluir o prefixo de idioma do usuário.
- [ ] Migrations: hoje não há pasta de migrations (`DB_SYNCHRONIZE` + scripts). As mudanças de schema deste plano (timestamptz, novos campos) pedem migrations do TypeORM versionadas.

---

## 8. Ordem sugerida de entrega

1. **Fundação de dados**
   - Onboarding gravando país, moeda e fuso.
   - Validação ISO/IANA.
   - Telefone em E.164.
   - `formatCurrency` e as datas no backend respeitando a loja.
   - Snapshot de preço no `Schedule`.
2. **Stripe multimoeda**
   - Catálogo com `lookup_key` + `currency_options`.
   - `/plans` com moeda.
   - Checkout com `currency`/`locale`.
   - Customer com país e locale.
   - `toMajorUnits`.
   - Stripe Tax, se aprovado.
3. **Fuso no booking e na agenda (front).**
4. **i18n no front**
   - next-intl, rotas com `[locale]`, SEO com hreflang.
   - Extração dos textos em fases: autenticação/booking → painel do parceiro → páginas editoriais.
5. **i18n no backend**
   - `User.locale`, e-mails e templates de WhatsApp por idioma.
6. **Jurídico e consentimento por região.**
7. **Infraestrutura**
   - DPAs; residência de dados se necessário.
