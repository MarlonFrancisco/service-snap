# Deploy na Railway (teste da web e da API)

A web (Next.js) e a API (NestJS) rodam na Railway como servidores Node comuns,
cada uma no seu container. Os serviços externos continuam os mesmos: Postgres
(`DB_URL`), Upstash Redis (`REDIS_URL`, conexão TCP normal), R2, QStash, Resend,
Stripe e o cron de lembretes no GitHub Actions. A Vercel não muda: ela continua
servindo produção até a troca de domínios.

O que o repositório já traz:

| Arquivo | Para quê |
| --- | --- |
| `apps/api/Dockerfile` | Build da API (`turbo build --filter=api`) e `node dist/main.js` |
| `apps/web/Dockerfile` | Build da web (`turbo build --filter=web`) e `next start` |
| `.railway/railway.ts` | Infrastructure as Code: os 2 serviços, Dockerfile, healthcheck, restart, watch paths e variáveis |
| `.dockerignore` | Tira `.git`, `node_modules`, builds etc. do contexto |

Os dois apps escutam na porta da variável `PORT`, que a Railway define sozinha.

## 1. Criar o projeto e os dois serviços

1. Em [railway.com](https://railway.com), **New Project → Deploy from GitHub repo**
   e escolha `MarlonFrancisco/service-snap`. Isso cria o primeiro serviço.
2. No mesmo projeto, **+ Create → GitHub Repo** de novo, mesmo repositório, para o
   segundo serviço.
3. Renomeie os serviços para **`api`** e **`web`** (clique no nome do serviço).
   Os nomes importam: as variáveis de referência abaixo usam `${{api.…}}` e `${{web.…}}`.
4. Aplique a configuração do repositório (`.railway/railway.ts`) com o
   [Railway CLI](https://docs.railway.com/cli) 5.42.1 ou mais novo, na raiz do
   repositório:

   ```bash
   railway login
   railway link            # escolha o projeto criado acima
   railway config plan     # mostra o que vai mudar, sem aplicar
   railway config apply    # aplica depois de você confirmar o plano
   ```

   O arquivo define, nos serviços `api` e `web`: repositório e branch `main`,
   build por Dockerfile (`apps/<app>/Dockerfile`, a partir da raiz do monorepo),
   healthcheck (`/health` e `/robots.txt`), restart On Failure, watch paths e as
   variáveis. Os segredos estão como `preserve()`: o valor fica o que já está no
   painel e nunca entra no repositório. Por isso cadastre as variáveis (passos 2
   e 3) **antes** do `apply`.

   Leia o plano antes de confirmar:
   - Se o nome do projeto na Railway não for `ssnap`, troque em
     `project('ssnap', …)` no fim do arquivo, senão o plano renomeia o projeto.
   - Uma variável que existe no painel e não está no arquivo (por exemplo
     `RAILWAY_DOCKERFILE_PATH`, que deixa de ser necessária) aparece como
     remoção. Remova só o que você reconhecer; se for algo que precisa ficar,
     acrescente no `env` do arquivo com `preserve()`.

   A Railway descontinuou o Config as Code (`railway.json` e o campo Railway
   Config File): serviços novos não podem mais ativá-lo. O Infrastructure as Code
   é o substituto.

   Sem o CLI, o mesmo pode ser feito no painel de cada serviço: variável
   `RAILWAY_DOCKERFILE_PATH=apps/<app>/Dockerfile`, Root Directory vazio, Branch
   `main`, Healthcheck Path, Restart Policy e Watch Paths como no arquivo.
   Sem o Dockerfile a Railway usa o Railpack e falha com "No start command detected".

   Em **Settings → Deploy → Region**, escolha a mesma região (ou a mais próxima)
   do banco Neon e do Upstash. Cada consulta atravessa essa distância.
5. Em cada serviço, **Settings → Networking → Generate Domain**. Isso cria
   `api-xxxx.up.railway.app` e `web-xxxx.up.railway.app`. Se pedir porta, use a
   sugerida (é a mesma de `PORT`).

Até as variáveis existirem, o primeiro deploy pode falhar. É esperado.

## 2. Variáveis da API (serviço `api` → Variables)

Use **Raw Editor** e cole os valores do projeto da API na Vercel
(`vercel env pull` ou a tela de Environment Variables). A lista completa está em
`apps/api/.env.example`. Diferenças em relação à Vercel:

```env
# NÃO definir IS_SERVELESS (ou deixar false): na Railway a API sobe o servidor HTTP
NODE_ENV=production            # já vem no Dockerfile; pode omitir
DB_SYNCHRONIZE=false

# Apontam para os domínios da Railway enquanto for teste
FRONTEND_URL=https://${{web.RAILWAY_PUBLIC_DOMAIN}}
API_PUBLIC_URL=https://${{api.RAILWAY_PUBLIC_DOMAIN}}
```

Todas as outras iguais às da Vercel: `DB_URL`, `REDIS_URL`, `JWT_SECRET`,
`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `STRIPE_API_KEY`,
`STRIPE_WEBHOOK_SECRET`, `R2_*`, `UPSTASH_SEARCH_*`, `RESEND_API_KEY`,
`WHATSAPP_VERIFY_TOKEN`, `CRON_SECRET`, `DATA_ENCRYPTION_KEY`,
`PLATFORM_ADMIN_EMAILS`, `QSTASH_*`, `VAPID_*`.

Atenção: cadastre todas. Sem `R2_*` ou `RESEND_API_KEY`, por exemplo, o Nest
falha no arranque e o deploy não passa do healthcheck.

**Cuidado com dados reais.** Se `DB_URL`, `REDIS_URL` e `QSTASH_*` forem os de
produção, o teste mexe em dados reais e o QStash passa a chamar a Railway nos
jobs criados por ela (por causa do `API_PUBLIC_URL`). Para um teste sem risco, use
o banco e o bucket de desenvolvimento (`ssnap-development`). Se for usar
produção, faça só leitura e fluxos que você consiga desfazer.

## 3. Variáveis da web (serviço `web` → Variables)

As `NEXT_PUBLIC_*` entram no bundle **durante o build**. O Dockerfile já as declara
como `ARG`, então a Railway as repassa ao build. Ao mudar qualquer uma, faça um
**Redeploy** (não basta reiniciar).

```env
NEXT_PUBLIC_API_URL=https://${{api.RAILWAY_PUBLIC_DOMAIN}}
NEXT_PUBLIC_SITE_URL=https://${{web.RAILWAY_PUBLIC_DOMAIN}}
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<o mesmo da Vercel>
NEXT_PUBLIC_CDN_URL=<o mesmo da Vercel>
# Opcionais
# NEXT_PUBLIC_GTM_ID=          deixe vazio no teste para não sujar o analytics
# NEXT_PUBLIC_ALLOW_INDEXING=  deixe vazio no teste (site fica noindex)
```

`VERCEL_AUTOMATION_API_BYPASS_SECRET` não é necessária na Railway.

Sem `NEXT_PUBLIC_ALLOW_INDEXING=true` a web responde `noindex` e o
`robots.txt` bloqueia tudo, porque fora da Vercel não existe `VERCEL_ENV`. No
teste é isso que queremos. Na troca para produção, defina `true`.

## 4. Login com Google

No [Google Cloud Console](https://console.cloud.google.com/apis/credentials), no
OAuth Client usado por `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, adicione
`https://web-xxxx.up.railway.app` em **Authorized JavaScript origins**. Sem isso o
botão do Google recusa o login nesse domínio.

## 5. Testar pelos domínios `*.up.railway.app`

Faça o deploy dos dois (Deployments → Deploy/Redeploy). A Railway só promove o
deploy quando o healthcheck responde 200.

1. **API de pé**: `curl https://api-xxxx.up.railway.app/health` deve devolver
   `{"status":"ok", ... "database":{"status":"up"}, "cache":{"status":"up"}}`.
   `503` mostra qual dos dois falhou.
2. **Web**: abra `https://web-xxxx.up.railway.app`. A home, `/pricing`, uma página
   de negócio (`/booking/<id>`) e a busca devem carregar com dados.
3. **Login**: entre com Google e abra o painel (`/partner`).
4. **Upload de imagem** (usa `sharp` e R2): troque a foto de uma loja de teste.
5. **Agendamento**: crie e cancele um agendamento de teste; confira o e-mail.
6. **Lembretes** (sem mexer no GitHub Actions):
   ```bash
   curl -H "Authorization: Bearer $CRON_SECRET" \
     https://api-xxxx.up.railway.app/cron/schedule-reminders
   ```
7. **Logs**: em cada serviço, aba **Deployments → View logs**. Em produção a API
   só registra avisos e erros.

Nada disso troca domínio nem webhook: a produção na Vercel segue igual.

## 6. Quando o teste passar (troca para produção)

Só depois de decidir migrar. Até lá, a Vercel é o rollback.

1. **Domínios**: Settings → Networking → Custom Domain em cada serviço
   (`ssnap.io` na web, o domínio da API na api) e ajuste o DNS conforme a
   Railway indicar.
2. **Variáveis**: `FRONTEND_URL`, `API_PUBLIC_URL`, `NEXT_PUBLIC_API_URL` e
   `NEXT_PUBLIC_SITE_URL` com os domínios definitivos;
   `NEXT_PUBLIC_ALLOW_INDEXING=true`; `NEXT_PUBLIC_GTM_ID`. Redeploy da web.
3. **Webhooks**: Stripe (`/subscription/webhook`), WhatsApp (`/whatsapp/webhook`).
   Se a API mantiver o mesmo domínio, nada muda.
4. **Cron**: variável `REMINDERS_CRON_URL` do repositório no GitHub, se o domínio
   da API mudar.
5. **Branch**: em cada serviço, Source → Branch para `main`.
6. Pausar os projetos na Vercel só depois de alguns dias estável.

## Diferenças em relação à Vercel

- A API é um processo contínuo, não uma função por requisição. O pool do
  Postgres (até 5 conexões) e a conexão com o Redis ficam abertos. Se o Redis
  cair, a API tenta reconectar sem desistir (na Vercel desiste após 3 tentativas,
  porque a instância morre logo).
- Não há cold start, então o primeiro acesso depois de um tempo parado não fica lento.
- Com uma réplica, um deploy novo só entra quando o healthcheck passa; o anterior
  segue atendendo até lá.

## Rodar as imagens localmente (opcional)

```bash
docker build -f apps/api/Dockerfile -t ssnap-api .
docker run --env-file apps/api/.env -e PORT=8080 -p 8080:8080 ssnap-api

docker build -f apps/web/Dockerfile --build-arg NEXT_PUBLIC_API_URL=http://localhost:8080 -t ssnap-web .
docker run -e PORT=3001 -p 3001:3001 ssnap-web
```
