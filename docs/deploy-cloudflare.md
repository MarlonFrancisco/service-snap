# Deploy na Cloudflare (Workers)

A web (Next.js) e a API (NestJS) rodam no Cloudflare Workers. Os serviços continuam os mesmos de hoje: Postgres (Neon), Upstash (Redis, Search, QStash), R2, Stripe, Resend e a Meta (WhatsApp). Muda só onde o código executa.

- **web:** `apps/web`, empacotada pelo [OpenNext](https://opennext.js.org/cloudflare) (`@opennextjs/cloudflare`). Config em `apps/web/wrangler.jsonc` e `apps/web/open-next.config.ts`.
- **api:** `apps/api`, o mesmo Nest/Express sobre o `node:http` do Workers. Entrada em `apps/api/worker/index.mjs`, config em `apps/api/wrangler.jsonc`.

O deploy pela Vercel continua funcionando. Os dois podem rodar em paralelo até a troca de DNS.

## O que mudou no código e por quê

| Ponto | Em Node/Vercel | No Worker | Motivo |
| --- | --- | --- | --- |
| Conexão do Postgres | Um pool por instância | Um pool por requisição, para o mesmo `DB_URL` (`worker/request-scoped-pg.mjs`) | O Workers não deixa uma requisição usar um socket aberto em outra |
| Redis (cache) | `REDIS_URL` (TCP) | API REST do **mesmo** banco Upstash (`UPSTASH_REDIS_REST_URL`/`_TOKEN`) | Mesmo motivo. Sem as duas variáveis, o cache fica em memória |
| Upload no R2 | API S3 com chaves | Binding `STORAGE_BUCKET` para o **mesmo** bucket | O AWS SDK quebra no bundle do Worker |
| Conversão para WebP | `sharp` | Binding `IMAGES` (Cloudflare Images) | O `sharp` é um binário nativo |
| Templates de e-mail | `.hbs` lidos do disco e compilados | Pré-compilados no build (`worker/precompile-templates.mjs`) | O Workers não tem disco e proíbe `new Function` |
| `/booking` sem busca → 301 | `src/proxy.ts` | `redirects()` no `next.config.js` | O OpenNext não suporta o proxy em Node do Next 16 |

O cron de lembretes continua no GitHub Actions (`.github/workflows/schedule-reminders.yml`).

## Requisitos da conta

1. **Plano Workers Paid (US$ 5/mês).** O plano grátis limita a 10 ms de CPU por requisição, e a primeira requisição de cada isolate monta o Nest inteiro. O Paid dá 30 s de CPU.
2. **Cloudflare Images** ativo na conta, para o binding `IMAGES`. A API usa para converter fotos, a web para o `next/image`. O plano grátis cobre 5 mil transformações por mês.
3. O domínio `ssnap.io` já está na Cloudflare, então os domínios personalizados podem ser ligados direto nos Workers.

## Primeira vez (uma vez por conta)

Na raiz do repositório:

```bash
pnpm install
npx wrangler login

# Bucket do cache do ISR da web (novo, usado só pelo Next)
npx wrangler r2 bucket create ssnap-next-cache
```

O bucket de arquivos da API é o mesmo de hoje (`ssnap-production`, em `apps/api/wrangler.jsonc`). Se o nome for outro, ajuste `bucket_name` lá.

### Secrets da API

Os mesmos valores de hoje na Vercel (projeto da API), mais dois do Upstash. Em `apps/api`:

```bash
npx wrangler secret put DB_URL
# ...repita para cada um, ou use: npx wrangler secret bulk secrets.json
```

Lista: `DB_URL`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET`, `R2_BUCKET`, `RESEND_API_KEY`, `WHATSAPP_VERIFY_TOKEN`, `CRON_SECRET`, `DATA_ENCRYPTION_KEY`, `PLATFORM_ADMIN_EMAILS`, `FRONTEND_URL`, `API_PUBLIC_URL`, `QSTASH_TOKEN`, `QSTASH_URL`, `QSTASH_CURRENT_SIGNING_KEY`, `QSTASH_NEXT_SIGNING_KEY`, `UPSTASH_SEARCH_REST_URL`, `UPSTASH_SEARCH_REST_TOKEN`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`.

Novos (mesmo banco Redis, aba **REST API** no painel do Upstash): `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.

Não são necessários no Worker: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` (o binding substitui), `REDIS_URL`, `IS_SERVELESS` e `NODE_ENV` (já vêm de `vars`). Mantenha `DB_SYNCHRONIZE` desligado: no Worker ele rodaria a cada cold start.

### Variáveis de build da web

O Next grava as `NEXT_PUBLIC_*` no bundle durante o build, então elas precisam estar no ambiente de quem roda o build (sua máquina ou o CI), não como secret do Worker:

```bash
NEXT_PUBLIC_API_URL=https://api.ssnap.io        # URL da API no Worker
NEXT_PUBLIC_SITE_URL=https://ssnap.io
NEXT_PUBLIC_ALLOW_INDEXING=true                 # OBRIGATÓRIO em produção
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
NEXT_PUBLIC_CDN_URL=...
NEXT_PUBLIC_GTM_ID=...
```

**Atenção:** sem `NEXT_PUBLIC_ALLOW_INDEXING=true`, o site sai com `noindex`. Hoje ele decide pela `VERCEL_ENV`, que não existe fora da Vercel.

## Deploy

```bash
# API
cd apps/api && pnpm deploy:cf

# Web (build dos pacotes do monorepo antes)
pnpm turbo run build --filter='web^...'
cd apps/web && pnpm deploy:cf
```

Cada comando mostra a URL `*.workers.dev`. Teste por ela antes de trocar o domínio.

## Troca de domínio (cutover)

1. No painel: Workers & Pages → `ssnap-api` → Settings → Domains & Routes → **Add custom domain**, por exemplo `api.ssnap.io`. Faça o mesmo para `ssnap-web` com `ssnap.io`. Antes, apague no DNS da Cloudflare o registro que hoje aponta o domínio para a Vercel. A Cloudflare não cria o domínio personalizado enquanto houver um registro com o mesmo nome. Faça isso só quando os testes pelo `workers.dev` estiverem ok.
2. Se a URL da API mudar, atualize:
   - Stripe: endpoint do webhook (`/subscription/webhook`).
   - Meta/WhatsApp: URL de callback do webhook.
   - `API_PUBLIC_URL` (secret da API): o QStash chama `${API_PUBLIC_URL}/queue/jobs`.
   - Variável `REMINDERS_CRON_URL` do repositório no GitHub (cron de lembretes).
   - Google Cloud Console: origens autorizadas do OAuth, se o domínio da web mudar.
   - `NEXT_PUBLIC_API_URL` no build da web e `FRONTEND_URL` na API (CORS).
3. Para voltar atrás: reaponte o domínio para a Vercel. O banco e os serviços são os mesmos, então não há dado para migrar.

## Rodar localmente no runtime da Cloudflare

```bash
# API: copie apps/api/.dev.vars.example para .dev.vars e preencha
cd apps/api && pnpm dev:worker            # http://localhost:8787

# Web
cd apps/web && NEXT_PUBLIC_API_URL=http://localhost:8787 pnpm preview:cf
```

R2 e Images são simulados pelo wrangler. `pnpm dev` (Node) continua igual.

## Opcional: Hyperdrive

Cada requisição abre conexões novas ao Postgres (TCP + TLS), o que soma algumas dezenas de ms. O Hyperdrive mantém essas conexões quentes na frente do **mesmo** banco:

```bash
npx wrangler hyperdrive create ssnap-db --connection-string="<DB_URL>"
```

Depois descomente o bloco `hyperdrive` em `apps/api/wrangler.jsonc` com o id. Com o binding presente, ele substitui o `DB_URL`.

## Limites a acompanhar

- **Bundle:** API em ~2,3 MB e web em ~2,2 MB (gzip). O limite do Paid é 10 MB.
- **Cold start:** a primeira requisição de um isolate monta o Nest (~0,5 s medido localmente, com o banco local).
- **Promessas soltas:** o pool da requisição fecha 2 s depois da resposta. Um `void promessa` que use o banco além disso falha.
