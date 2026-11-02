# Migração de Planos para Produção - Stripe

## Pré-requisitos

1. **Chave de API de Produção**: Certifique-se de ter a chave secreta de produção (`sk_live_...`)
2. **Conta Stripe Ativada**: Sua conta Stripe deve estar ativada para produção
3. **Backup**: Faça backup dos dados atuais antes de migrar

## Passo a Passo

### 1. Configurar Variável de Ambiente

Certifique-se de que a variável `STRIPE_API_KEY` no arquivo `.env.local` (ou `.env.production`) contenha a chave de **produção**:

```bash
STRIPE_API_KEY=sk_live_...
```

⚠️ **ATENÇÃO**: O script verifica automaticamente se a chave é de produção. Se for de teste, ele não executará.

### 2. Executar Script de Migração

```bash
cd apps/api
npx tsx src/scripts/migrate-plans-to-production.ts
```

O script irá:

- ✅ Criar 4 produtos (Starter, Professional, Business, Enterprise)
- ✅ Criar 2 preços para cada produto (mensal e anual)
- ✅ Configurar toda a metadata necessária
- ✅ Configurar marketing_features
- ✅ Adicionar metadata `discount: 10` nos preços anuais
- ✅ Exibir todos os IDs criados

### 3. Atualizar IDs no Código

Após a migração, você receberá os novos IDs de produção. Atualize:

1. **Scripts de atualização** (`update-stripe-products-metadata.ts`):

   - Substitua os `productId` pelos novos IDs de produção

2. **Variáveis de ambiente** (se necessário):
   - Atualize qualquer referência hardcoded aos IDs de teste

### 4. Configurar Trial Period

O trial period de 7 dias para o Starter mensal precisa ser configurado no método `create()` do `SubscriptionService`:

```typescript
// Em subscription.service.ts
async create(priceId: string, paymentCustomerId: string) {
  const session = await this.stripeService.checkout.sessions.create({
    mode: 'subscription',
    customer: paymentCustomerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    subscription_data: {
      // Adicionar trial apenas para Starter mensal
      trial_period_days: isStarterMonthlyPrice(priceId) ? 7 : undefined,
    },
    success_url: `${process.env.FRONTEND_URL}/checkout?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/pricing`,
  });

  return {
    url: session.url,
  };
}
```

### 5. Verificar Webhooks

Certifique-se de que os webhooks estão configurados para produção:

1. Acesse https://dashboard.stripe.com/webhooks
2. Verifique se há endpoints configurados para produção
3. Configure os eventos necessários:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `customer.subscription.trial_will_end`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `checkout.session.completed`

### 6. Testar em Produção

Antes de liberar para clientes:

1. ✅ Teste a criação de uma subscription de teste
2. ✅ Verifique se os webhooks estão funcionando
3. ✅ Confirme que os planos aparecem corretamente na UI
4. ✅ Teste o fluxo completo de checkout

## Alternativa: Copiar via Dashboard

Se preferir usar o Dashboard do Stripe:

1. Acesse https://dashboard.stripe.com/test/products
2. Para cada produto:
   - Clique no produto
   - Clique em **"Copy to live mode"** no canto superior direito
   - ⚠️ **Limitação**: Só pode copiar uma vez por produto
   - Os preços são copiados automaticamente

**Desvantagens**:

- Não copia metadata automaticamente
- Não copia marketing_features
- Precisa configurar manualmente cada produto

## Checklist de Migração

- [ ] Chave de API de produção configurada
- [ ] Script de migração executado com sucesso
- [ ] IDs de produção salvos e documentados
- [ ] IDs atualizados no código (se necessário)
- [ ] Trial period configurado no código
- [ ] Webhooks configurados para produção
- [ ] Testes realizados em produção
- [ ] Documentação atualizada com novos IDs

## Troubleshooting

### Erro: "Esta chave parece ser de TEST MODE!"

- Verifique se está usando `sk_live_...` e não `sk_test_...`
- Certifique-se de que a variável de ambiente está correta

### Erro: "Product already exists"

- O produto já existe em produção
- Use o script de atualização (`update-stripe-products-metadata.ts`) em vez do de migração

### Webhooks não funcionando

- Verifique se o endpoint está acessível publicamente
- Confirme que está usando a chave de produção correta
- Verifique os logs no Dashboard do Stripe
