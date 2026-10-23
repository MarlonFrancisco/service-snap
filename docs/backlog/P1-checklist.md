# Checklist P1 — Confiança & higiene (Roadmap)

Fonte: [ServiceSnap — Roadmap de Produto e Crescimento](https://servicesnap-roadmap-de-produto-e-m6ob.pages.grok.bot/) (auditoria 22–23/10/2026).  
Objetivo: corrigir confiança pública antes de escalar. Ver também [`P2-checklist.md`](./P2-checklist.md) e [`P3-checklist.md`](./P3-checklist.md).

Marque com `[x]` conforme for fechando.

---

## Confiança pública

- [ ] **Contato real** — trocar placeholders em `/contact` (telefone `(11) 9999-9999`, WhatsApp, endereço “Rua das Flores”) por dados reais ou omitir até existirem  
  → `apps/web/src/app/contact/page.tsx`
- [ ] **Redes sociais** — remover `href="#"` no footer e em `/contact`; links válidos ou seção oculta  
  → `apps/web/src/components/layout/footer/footer.tsx`, `contact/page.tsx`
- [ ] **JSON-LD `sameAs`** — alinhar (ou remover) perfis em `layout.tsx` com as URLs reais  
  → `apps/web/src/app/layout.tsx`
- [ ] **Claims honestos** — remover “milhares…” sem fonte na home/pricing; copy comprovável  
  → `features/features.tsx`, `pricing/pricing.tsx`
- [ ] **Formulário de contato** — submit funcional ou CTA claro (mailto/WhatsApp), sem botão morto

---

## SEO & indexação

- [ ] **Title / description únicos** por rota pública (`/`, `/booking`, `/pricing`, `/about`, `/contact`, `/help`)
- [ ] **Open Graph + Twitter Card** (title, description, image)
- [ ] **Canonical** por página
- [ ] **Sitemap** incluir `/pricing` (e rotas públicas estáveis)  
  → `apps/web/src/app/sitemap.ts`
- [ ] **`noindex` em preview/dev** (`dev.ssnap.io` / Vercel preview); prod continua indexável  
  → preferir `robots.ts` dinâmico por `VERCEL_ENV`

---

## Home & busca (cold-start visível)

- [ ] **Empty state útil na home** — lista de espera / “indique profissional” / CTA claro quando não há lojas (estado vazio não some / não fica quebrado)  
  → `recomendations/`, empty states
- [ ] **Busca: relevância** — filtro real de categoria/local; resultados coerentes com a query
- [ ] **Busca: empty state honesto** — não mostrar “nenhum resultado” quando há resultados (e vice-versa)

---

## Performance (prod)

- [ ] **Home / busca / loja** — investigar streaming lento (~35–42 s observados em prod); meta: TTFB/interativo aceitável para demo
- [ ] Confirmar se é ambiente, waterfall de dados ou bloqueio de streaming; documentar causa e fix

---

## Área parceiro

- [ ] **WhatsApp usável** — status da conexão, teste de envio, templates, log/histórico (não só formulários técnicos Meta)  
  → `notifications-module/whatsapp-settings/`
- [ ] **Billing UX** — fluxo claro de cancelamento vs upgrade; faturas coerentes (sem estados contraditórios)  
  → `plans-module/`

---

## Done when

- [ ] Contato/redes/claims não enganam um visitante novo
- [ ] Dev/preview não indexa; prod tem meta/OG básicos
- [ ] Home vazia comunica próximo passo (não parece bug)
- [ ] Busca não mente sobre resultados
- [ ] WhatsApp e billing não bloqueiam um parceiro piloto

---

*Checklist local — não são issues do GitHub. Atualize este arquivo conforme o progresso.*
