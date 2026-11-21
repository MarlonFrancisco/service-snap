// `pg` com um pool por requisição para o TypeORM.
//
// No Workers, um socket aberto numa requisição não pode ser usado por outra
// ("Cannot perform I/O on behalf of a different request"). O TypeORM guarda um
// único Pool por DataSource e o Nest fica em cache entre requisições, então o
// Pool que ele recebe aqui é uma fachada: cada chamada vai para o pool real da
// requisição atual (AsyncLocalStorage). O Hyperdrive mantém as conexões quentes
// com o Postgres, e abrir conexões novas por requisição sai barato.
import { AsyncLocalStorage } from 'node:async_hooks';
import { EventEmitter } from 'node:events';
import pg from 'pg';

const scopeStorage = new AsyncLocalStorage();

class RequestScopedPool extends EventEmitter {
  constructor(options) {
    super();
    this.options = options;
  }

  current() {
    const scope = scopeStorage.getStore();
    if (!scope) {
      throw new Error('Consulta ao banco fora de uma requisição do Worker');
    }
    if (!scope.pool) {
      scope.pool = new pg.Pool(this.options);
      scope.pool.on('error', (error) => this.emit('error', error));
    }
    return scope.pool;
  }

  connect(callback) {
    return this.current().connect(callback);
  }

  query(...args) {
    return this.current().query(...args);
  }

  // Os pools reais fecham no fim de cada requisição (closeRequestScope).
  end(callback) {
    callback?.();
    return Promise.resolve();
  }

  get totalCount() {
    return scopeStorage.getStore()?.pool?.totalCount ?? 0;
  }

  get idleCount() {
    return scopeStorage.getStore()?.pool?.idleCount ?? 0;
  }

  get waitingCount() {
    return scopeStorage.getStore()?.pool?.waitingCount ?? 0;
  }
}

export const requestScopedPg = { ...pg, Pool: RequestScopedPool };

export function runInRequestScope(scope, fn) {
  return scopeStorage.run(scope, fn);
}

export function currentRequestScope() {
  return scopeStorage.getStore();
}

export async function closeRequestScope(scope) {
  const pool = scope.pool;
  scope.pool = undefined;
  await pool?.end().catch(() => undefined);
}
