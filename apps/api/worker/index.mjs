// Entrada da API no Cloudflare Workers.
//
// O Nest roda sobre o `node:http` do Workers (`httpServerHandler`): o Express
// recebe req/res como em Node. A app é criada na primeira requisição e fica em
// cache no isolate; o banco usa um pool por requisição (request-scoped-pg.mjs).
import 'reflect-metadata';
import { httpServerHandler } from 'cloudflare:node';
import { createServer } from 'node:http';
import emailTemplates from './templates.generated.mjs';
import {
  closeRequestScope,
  currentRequestScope,
  requestScopedPg,
  runInRequestScope,
} from './request-scoped-pg.mjs';

const PORT = 3000;
/** Folga para promessas soltas (ex.: `void repo.save()`) terminarem antes de fechar o pool. */
const POOL_CLOSE_GRACE_MS = 2000;

globalThis.__SSNAP_EMAIL_TEMPLATES__ = emailTemplates;

let appPromise;

function getApp(env) {
  if (!appPromise) {
    // Hyperdrive dá uma connection string local, com o pool dele por trás.
    if (env.HYPERDRIVE) process.env.DB_URL = env.HYPERDRIVE.connectionString;
    globalThis.__SSNAP_WORKER_ENV__ = { ...env, __PG_DRIVER__: requestScopedPg };

    // Import dinâmico: o bundle do Nest só é avaliado aqui, depois do env pronto.
    appPromise = import('../dist/main.js')
      .then(({ createApp }) => createApp())
      .catch((error) => {
        appPromise = undefined;
        throw error;
      });
  }
  return appPromise;
}

const server = createServer(async (req, res) => {
  const scope = currentRequestScope();
  res.on('close', () => scope?.finish());

  try {
    const app = await getApp(scope.env);
    app.getHttpAdapter().getInstance()(req, res);
  } catch (error) {
    console.error('Falha ao iniciar a API', error);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
});
server.listen(PORT);

const nodeHandler = httpServerHandler({ port: PORT });

export default {
  async fetch(request, env, ctx) {
    let finish;
    const finished = new Promise((resolve) => (finish = resolve));
    const scope = { env, finish };

    ctx.waitUntil(
      finished
        .then(() => new Promise((r) => setTimeout(r, POOL_CLOSE_GRACE_MS)))
        .then(() => closeRequestScope(scope)),
    );

    return runInRequestScope(scope, () => nodeHandler.fetch(request, env, ctx));
  },
};
