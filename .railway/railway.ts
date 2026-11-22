/**
 * Infraestrutura da Railway (Infrastructure as Code).
 *
 * Aplicar: `railway link` (escolha o projeto), `railway config plan` e, se o
 * plano estiver certo, `railway config apply`. Precisa do Railway CLI 5.42.1+.
 * Passo a passo em docs/deploy-railway.md.
 *
 * Só os dois apps rodam na Railway. Postgres, Upstash, R2, QStash etc. ficam
 * onde estão: os valores vêm das variáveis já cadastradas no painel, que
 * `preserve()` mantém sem trazer o segredo para o repositório.
 */
import { defineRailway, github, preserve, project, service } from 'railway/iac';

const REPO = 'MarlonFrancisco/service-snap';
const BRANCH = 'main';

/** Fora daqui, os dois builds compartilham estes arquivos do monorepo. */
const SHARED_WATCH = [
  '/packages/**',
  '/package.json',
  '/pnpm-lock.yaml',
  '/pnpm-workspace.yaml',
  '/turbo.json',
];

export default defineRailway(() => {
  const api = service('api', {
    // Sem rootDirectory: o Dockerfile precisa da raiz do monorepo.
    source: github(REPO, { branch: BRANCH }),
    build: {
      builder: 'DOCKERFILE',
      dockerfilePath: 'apps/api/Dockerfile',
      watchPatterns: ['/apps/api/**', ...SHARED_WATCH],
    },
    deploy: {
      healthcheckPath: '/health',
      healthcheckTimeout: 120,
      restartPolicyType: 'ON_FAILURE',
      restartPolicyMaxRetries: 5,
    },
    env: {
      DB_SYNCHRONIZE: 'false',
      FRONTEND_URL: 'https://${{web.RAILWAY_PUBLIC_DOMAIN}}',
      API_PUBLIC_URL: 'https://${{api.RAILWAY_PUBLIC_DOMAIN}}',

      DB_URL: preserve(),
      REDIS_URL: preserve(),
      JWT_SECRET: preserve(),
      GOOGLE_CLIENT_ID: preserve(),
      GOOGLE_CLIENT_SECRET: preserve(),
      STRIPE_API_KEY: preserve(),
      STRIPE_WEBHOOK_SECRET: preserve(),
      R2_BUCKET: preserve(),
      R2_ACCOUNT_ID: preserve(),
      R2_ACCESS_KEY_ID: preserve(),
      R2_SECRET_ACCESS_KEY: preserve(),
      UPSTASH_SEARCH_REST_URL: preserve(),
      UPSTASH_SEARCH_REST_TOKEN: preserve(),
      RESEND_API_KEY: preserve(),
      WHATSAPP_VERIFY_TOKEN: preserve(),
      CRON_SECRET: preserve(),
      DATA_ENCRYPTION_KEY: preserve(),
      PLATFORM_ADMIN_EMAILS: preserve(),
      QSTASH_TOKEN: preserve(),
      QSTASH_CURRENT_SIGNING_KEY: preserve(),
      QSTASH_NEXT_SIGNING_KEY: preserve(),
      VAPID_PUBLIC_KEY: preserve(),
      VAPID_PRIVATE_KEY: preserve(),
      VAPID_SUBJECT: preserve(),
    },
  });

  const web = service('web', {
    source: github(REPO, { branch: BRANCH }),
    build: {
      builder: 'DOCKERFILE',
      dockerfilePath: 'apps/web/Dockerfile',
      watchPatterns: ['/apps/web/**', ...SHARED_WATCH],
    },
    deploy: {
      healthcheckPath: '/robots.txt',
      healthcheckTimeout: 120,
      restartPolicyType: 'ON_FAILURE',
      restartPolicyMaxRetries: 5,
    },
    env: {
      // NEXT_PUBLIC_* entram no build: o Dockerfile as declara como ARG.
      NEXT_PUBLIC_API_URL: 'https://${{api.RAILWAY_PUBLIC_DOMAIN}}',
      NEXT_PUBLIC_SITE_URL: 'https://${{web.RAILWAY_PUBLIC_DOMAIN}}',
      NEXT_PUBLIC_GOOGLE_CLIENT_ID: preserve(),
      NEXT_PUBLIC_CDN_URL: preserve(),
    },
  });

  return project('ssnap', { resources: [api, web] });
});
