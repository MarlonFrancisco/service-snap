# Checklist P1 — Confiança & higiene (Roadmap)

Fonte: [ServiceSnap — Roadmap de Produto e Crescimento](https://servicesnap-roadmap-de-produto-e-m6ob.pages.grok.bot/) (auditoria 22–23/10/2026).  
Objetivo: corrigir confiança pública antes de escalar. Ver também [`P2-checklist.md`](./P2-checklist.md) e [`P3-checklist.md`](./P3-checklist.md).

Marque com `[x]` conforme for fechando.

---

## Confiança pública

- [x] **Contato real** — placeholders removidos; só e-mail `general@ssnap.io` até haver telefone/endereço reais  
  → `apps/web/src/app/contact/page.tsx`
- [x] **Redes sociais** — `href="#"` removidos; footer aponta para contato/planos (sem perfis inventados)  
  → `apps/web/src/components/layout/footer/footer.tsx`, `contact/page.tsx`
- [x] **JSON-LD `sameAs`** — removido até existirem URLs reais  
  → `apps/web/src/app/layout.tsx`
- [x] **Claims honestos** — “milhares…” removido na home/pricing  
  → `features/features.tsx`, `pricing/pricing.tsx`
- [x] **Formulário de contato** — submit abre `mailto:` com a mensagem composta

---

## SEO & indexação

- [x] **Title / description únicos** por rota pública (`/`, `/booking`, `/pricing`, `/about`, `/contact`, `/help`)
- [x] **Open Graph + Twitter Card** (title, description, image)
- [x] **Canonical** por página
- [x] **Sitemap** incluir `/pricing` (e rotas públicas estáveis)  
  → `apps/web/src/app/sitemap.ts`
- [x] **`noindex` em preview/dev** — `app/robots.ts` + `robots` metadata via `VERCEL_ENV` / `NEXT_PUBLIC_ALLOW_INDEXING`

---

## Home & busca (cold-start visível)

- [x] **Empty state útil na home** — indicar profissional, lista de espera, seja parceiro  
  → `recomendations/`, empty states
- [x] **Busca: relevância** — parse de intent (categoria/local), filtro pós-Upstash (vazio > irrelevante), params `category`/`location`, index com `categoryNames`/`serviceNames`/`searchText`
- [x] **Busca: empty state honesto** — empty só após load; loading com skeleton; sem `hidden`+`flex` conflitante

---

## Performance (prod)

- [x] **Home / busca / loja** — investigar streaming lento (~35–42 s observados em prod); meta: TTFB/interativo aceitável para demo
- [x] Confirmar se é ambiente, waterfall de dados ou bloqueio de streaming; documentar causa e fix  
  → **Causa (prod):** `DB_URL` inválida na API (`password authentication failed for user "postgres"` → Neon `ECIRCUITBREAKER`). TypeORM retryava ~10× (~28–35 s) no boot Nest; a home SSR `await` o `GET /recommendation/popular-stores` e bloqueava o HTML. `service-snap-dev-api` (release) responde ~1 s; `service-snap-api` (prod/main) falha.  
  → **Fix código:** fail-fast TypeORM (`retryAttempts: 1`, timeout 3 s); budget no prefetch SSR home/busca/loja (`withBudget` helper); remoção do Redis SSR na search; payload da loja sem `schedules` top-level.  
  → **Ops pendente:** corrigir `DB_URL`/senha Postgres no projeto Vercel `service-span-api` (production).

---

## Área parceiro

- [x] **WhatsApp usável** — status Meta, teste de envio, lista de templates, link para histórico; token de webhook mascarado na UI  
  → `whatsapp-settings-module/` + `GET/POST .../whatsapp/status|templates|test`
- [x] **Billing UX** — fluxo claro de cancelamento vs upgrade; faturas coerentes (sem estados contraditórios)  
  → `plans-module/` + `PlanCard` (badge único); upgrade bloqueado com cancel agendado; faturas sem draft

---

## Done when

- [x] Contato/redes/claims não enganam um visitante novo
- [x] Dev/preview não indexa; prod tem meta/OG básicos
- [x] Home vazia comunica próximo passo (não parece bug)
- [x] Busca não mente sobre resultados
- [x] WhatsApp e billing não bloqueiam um parceiro piloto

---

*Checklist local — não são issues do GitHub. Atualize este arquivo conforme o progresso.*
