import fs from 'fs/promises';
import handlebars from 'handlebars';
import path from 'path';

/**
 * Templates pré-compilados no build do Worker (`worker/precompile-templates.mjs`).
 * O Workers proíbe `new Function`, que o `handlebars.compile` usa, e não tem
 * disco para ler os `.hbs`. Em Node a chave fica vazia e compilamos do arquivo.
 */
const PRECOMPILED_KEY = '__SSNAP_EMAIL_TEMPLATES__';

type TTemplateGlobal = typeof globalThis & {
  [PRECOMPILED_KEY]?: Record<string, TemplateSpecification>;
};

const cache = new Map<string, HandlebarsTemplateDelegate>();

export async function loadEmailTemplate(
  name: string,
): Promise<HandlebarsTemplateDelegate> {
  const cached = cache.get(name);
  if (cached) return cached;

  const precompiled = (globalThis as TTemplateGlobal)[PRECOMPILED_KEY];
  let template: HandlebarsTemplateDelegate;

  if (precompiled) {
    const spec = precompiled[name];
    if (!spec) throw new Error(`Template de e-mail ausente: ${name}`);
    template = handlebars.template(spec);
  } else {
    template = handlebars.compile(
      await fs.readFile(
        path.join(__dirname, '../../templates', `${name}.hbs`),
        'utf8',
      ),
    );
  }

  cache.set(name, template);
  return template;
}
