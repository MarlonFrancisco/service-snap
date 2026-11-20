# Funil de aquisição e ativação

Decisões da #31, tomadas em consenso com o agente CEO em 19/11/2026:

- O funil fica **dividido** entre três fontes. As etapas de cima estão no GA4, a ativação está na base de dados e a primeira fatura está no Stripe.
- Nesta fase **não usamos Measurement Protocol**. Para o usar, era preciso criar um segredo novo no GA4 e guardar o `client_id` no servidor, e com o volume atual o ganho é pequeno. Por isso, os eventos do servidor não entram no GA4.
- Para a primeira fatura depois do trial, a fonte de verdade é o Stripe (`invoice.paid`).
- A primeira marcação é medida no servidor, a partir da base de dados, e não com um evento no browser. Quem faz a marcação é o cliente final e não o dono, e a medição não se perde quando os cookies são recusados.

## Etapas

| # | Etapa | Nome | Fonte | Onde se lê |
|---|---|---|---|---|
| 1 | Cadastro do dono | `sign_up` | GA4 | Relatórios › Engajamento › Eventos, ou conversão `sign_up` |
| 2 | Onboarding concluído | `partner_onboarding_completed` | GA4 | Conversão `partner_onboarding_completed` |
| 3 | Início do checkout | `begin_checkout` | GA4 | Eventos › `begin_checkout` |
| 4a | Início do trial | `trial_start` | GA4 | Conversão `trial_start` (só depois do #41 estar em main) |
| 4b | Assinatura paga sem trial | `purchase` | GA4 | Conversão `purchase`. Com o #41, deixa de contar os trials |
| 5 | 1.ª fatura paga depois do trial | `invoice.paid` com `billing_reason = subscription_cycle` | Stripe | Query Sigma abaixo, ou o webhook `invoice.paid` |
| 6 | Ativação: 1.ª marcação real em até 7 dias | `first_real_booking` | Base de dados | Query SQL abaixo |

As conversões do GA4 (`sign_up`, `partner_onboarding_completed`, `trial_start` e `purchase`) só se criam depois de o #41 estar em main. Antes disso, o `purchase` ainda conta os trials.

## GA4 e base de dados não batem certo

O GTM só dispara o GA4 depois de o visitante aceitar os cookies. A base de dados e o Stripe registam todos os casos. Por isso, as etapas 1 a 4 (GA4) ficam sempre **abaixo** dos números reais, e a conversão entre a etapa 4 e as etapas 5 e 6 parece maior do que é. Para comparar volumes, conte os cadastros também na base de dados (`users.created_at`). Use o GA4 para ver a origem dos visitantes e a proporção entre etapas dentro do próprio GA4.

## Etapa 5: primeira fatura depois do trial (Stripe Sigma)

```sql
-- Primeira fatura paga de cada assinatura que nasceu com trial.
select
  s.id as subscription_id,
  s.customer_id,
  s.trial_end,
  min(i.status_transitions_paid_at) as first_paid_at
from subscriptions s
join invoices i on i.subscription_id = s.id
where s.trial_end is not null
  and i.status = 'paid'
  and i.billing_reason = 'subscription_cycle'
  and i.amount_paid > 0
group by 1, 2, 3
order by first_paid_at desc
```

## Etapa 6: ativação (`first_real_booking`)

É a primeira marcação real de cada loja, comparada com a data de registo da loja (`stores.created_at`). Conta como "real" a marcação que cumpre estas condições:

- não está cancelada;
- não foi feita pelo dono da loja (`schedules."userId" <> stores."ownerId"`);
- não foi feita por alguém da equipe da loja (`store_members`).

```sql
with first_booking as (
  select s."storeId" as store_id, min(s.created_at) as first_booking_at
  from schedules s
  join stores st on st.id = s."storeId"
  where s.status is distinct from 'cancelled'
    and s."userId" is distinct from st."ownerId"
    and not exists (
      select 1
      from store_members sm
      where sm."storeId" = s."storeId"
        and sm."userId" = s."userId"
    )
  group by s."storeId"
)
select
  st.id as store_id,
  st.name,
  st.created_at as registered_at,
  fb.first_booking_at,
  coalesce(
    fb.first_booking_at < st.created_at + interval '7 days',
    false
  ) as activated_in_7_days
from stores st
join users owner on owner.id = st."ownerId"
left join first_booking fb on fb.store_id = st.id
where st.created_at >= now() - interval '90 days'
  -- Lojas de teste ou demo: hoje não há uma coluna que as marque.
  -- Exclua pelos e-mails dos donos, por exemplo:
  -- and owner.email not in ('teste@exemplo.com')
order by st.created_at desc;
```

A taxa de ativação é `count(*) filter (where activated_in_7_days) / count(*)` sobre o mesmo resultado. Exclua as lojas com menos de 7 dias desde o registo, porque ainda não tiveram o prazo inteiro.

**Limites desta query:**

- Uma marcação lançada pelo dono no painel em nome de um cliente conta como real quando fica associada ao utilizador desse cliente. É o comportamento desejado, porque o cliente existe de facto.
- Não há uma flag de loja de teste ou demo. Se for preciso excluí-las com frequência, vale criar uma coluna própria (nullable).

## Cadastros, trials e pagantes por canal

A origem é first-touch, guardada no cadastro (`users.signup_*`, #31 ponto 2). Não depende de cookies.

```sql
select
  coalesce(
    u.signup_utm_source,
    case when u.signup_ref is not null then 'indicacao' else '(direto)' end
  ) as canal,
  count(*) as cadastros,
  count(distinct s."userId") filter (where s.status = 'trialing') as em_trial,
  count(distinct s."userId") filter (where s.status = 'active') as pagantes
from users u
left join subscriptions s on s."userId" = u.id
where u.created_at >= now() - interval '90 days'
group by 1
order by cadastros desc;
```

Para cruzar com a receita, o `subscriptions.subscriptionId` aponta para a assinatura no Stripe.
