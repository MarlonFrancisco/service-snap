import { Logger } from '@nestjs/common';
import { waitUntil } from '@vercel/functions';

const logger = new Logger('Background');

/**
 * Roda o trabalho depois da resposta. Na Vercel, `waitUntil` mantém a função
 * viva até a promessa terminar; fora dela (API local) não há contexto e a
 * promessa segue sozinha no processo. O erro só vai para o log: quem chamou já
 * respondeu e não tem como tratá-lo.
 */
export const runInBackground = (label: string, task: () => unknown): void => {
  let promise: Promise<unknown>;

  try {
    // Começa já, na mesma pilha: o contexto (ex.: AsyncLocalStorage) vai junto
    promise = Promise.resolve(task());
  } catch (error) {
    promise = Promise.reject(error);
  }

  waitUntil(
    promise.catch((error: unknown) =>
      logger.error(
        `${label} falhou`,
        error instanceof Error ? error.stack : String(error),
      ),
    ),
  );
};

/**
 * Método que dispara efeitos colaterais (e-mail, WhatsApp, webhook) sem segurar
 * a requisição: quem chama recebe uma promessa já resolvida.
 */
export const InBackground =
  (): MethodDecorator => (target, key, descriptor: PropertyDescriptor) => {
    const original = descriptor.value as (...args: unknown[]) => unknown;
    const label = `${target.constructor.name}.${String(key)}`;

    descriptor.value = function (this: unknown, ...args: unknown[]) {
      runInBackground(label, () => original.apply(this, args));
      return Promise.resolve();
    };

    return descriptor;
  };
