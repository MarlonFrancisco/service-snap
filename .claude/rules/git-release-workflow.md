# Fluxo Git e versionamento (service-snap)

Fluxo Git — trabalhar na release, Commitizen e merge para main. Importado de `.cursor/rules/git-release-workflow.mdc`.

## Branch de trabalho

- **Sempre** desenvolver e commitar a partir de `release` (nunca commit direto em `main`).
- Se a sessão estiver em `main` ou outra branch, fazer checkout de `release` antes de commitar.
- Commits do dia a dia usam mensagens convencionais (`feat:`, `fix:`, `chore:`, etc.) — **não** rodar bump de versão a cada commit.

## Escopo por app (obrigatório)

- **Nunca** misturar mudanças de apps diferentes no mesmo commit (ex.: `apps/api` + `apps/web`).
- Cada commit deve cobrir **um único escopo de aplicativo** (`api`, `web`, ou raiz compartilhada como `turbo.json` / `.claude` / `.cursor` / root config).
- Se o trabalho tocar mais de um app, fazer **commits separados** (um por app), mesmo que façam parte da mesma feature.
- Preferir o escopo Conventional Commits alinhado ao app: `fix(api): …`, `feat(web): …`, etc.

## Publicar uma nova versão

Só quando o usuário pedir explicitamente para publicar / liberar versão:

1. Garantir que está em `release` e que o trabalho está commitado.
2. Rodar **Commitizen** (bump + changelog), alinhado a `.cz.toml`:
   - `pnpm cz` / `npx cz` / `cz bump` conforme o que o repo usa.
3. O bump (**major** / **minor** / **patch**) deve refletir as mudanças acumuladas desde a última versão (breaking → major; feature → minor; fix/chore → patch). Com `major_version_zero = true`, breaking em `0.x` sobe minor.
4. Publicar/push da `release` (tag + branch) quando o usuário pedir push.
5. **Merge de `release` → `main`** para finalizar a publicação.
6. Continuar o próximo ciclo de volta na `release`.

## O que o agente NÃO deve fazer

- Não fazer bump/Commitizen em commits rotineiros.
- Não mergear `release` → `main` sem o usuário pedir a publicação.
- Não force-push em `main` / `release` salvo pedido explícito.
- Não commitar `.env` / secrets — só `.env.example`.
- **Nunca** incluir trailers de ferramenta nas mensagens de commit (`Co-authored-by: Cursor` / `cursoragent@cursor.com`, `Made with Cursor`, `Co-Authored-By: Claude`, `Generated with Claude Code`).
