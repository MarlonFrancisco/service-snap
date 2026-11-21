// Pré-compila os templates de e-mail (.hbs) para o bundle do Worker.
// O Workers proíbe `new Function` (usado por handlebars.compile) e não tem disco.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import Handlebars from 'handlebars';

const here = dirname(fileURLToPath(import.meta.url));
const templatesDir = join(here, '../src/templates');
const output = join(here, 'templates.generated.mjs');

const files = (await readdir(templatesDir)).filter((f) => f.endsWith('.hbs')).sort();
const entries = await Promise.all(
  files.map(async (file) => {
    const source = await readFile(join(templatesDir, file), 'utf8');
    return `  ${JSON.stringify(file.replace(/\.hbs$/, ''))}: ${Handlebars.precompile(source)}`;
  }),
);

await writeFile(
  output,
  `// Gerado por worker/precompile-templates.mjs. Não editar.\nexport default {\n${entries.join(',\n')}\n};\n`,
);
console.log(`templates: ${files.length} pré-compilados em ${output}`);
