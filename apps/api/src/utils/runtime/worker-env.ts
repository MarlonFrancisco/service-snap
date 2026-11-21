/**
 * Ponte entre o Nest e o runtime da Cloudflare. A entrada do Worker
 * (`worker/index.mjs`) grava aqui os bindings; em Node (dev, testes, Docker)
 * nada é gravado e as funções devolvem `undefined`.
 */
const WORKER_ENV_KEY = '__SSNAP_WORKER_ENV__';

type TWorkerGlobal = typeof globalThis & {
  [WORKER_ENV_KEY]?: Record<string, unknown>;
};

export function isWorkerRuntime(): boolean {
  return Boolean((globalThis as TWorkerGlobal)[WORKER_ENV_KEY]);
}

export function getWorkerBinding<T>(name: string): T | undefined {
  return (globalThis as TWorkerGlobal)[WORKER_ENV_KEY]?.[name] as
    | T
    | undefined;
}

/**
 * Módulo `pg` com pool por requisição, gravado pela entrada do Worker
 * (`worker/request-scoped-pg.mjs`). O TypeORM o recebe na opção `driver`.
 */
export function getWorkerPgDriver(): unknown {
  return getWorkerBinding('__PG_DRIVER__');
}
