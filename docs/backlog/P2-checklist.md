# Checklist P2 — Prioridade média (Roadmap)

Fonte: [ServiceSnap — Roadmap de Produto e Crescimento](https://servicesnap-roadmap-de-produto-e-m6ob.pages.grok.bot/)  
Prioridade no doc: **Média = P2**. Marque com `[x]` conforme for fechando.

---

## Público / site

- [x] **E-mails em domínios diferentes** — unificar para `general@ssnap.io` (terms/privacy; sem `privacy@…`)
- [x] **Links do header/footer** — “Entrar ou registrar-se” não aponta para `#`; “Seja um parceiro” sem duplicata; “Como funciona” com destino correto (hoje `/about`)
- [x] **H1 da home** — animação letra a letra não quebra o H1 (“ServiceSnap. S e r v i c e S n a p .”)
- [x] **Sitemap** — além do P1 (`/pricing`): categorias/lojas quando existirem; `lastmod` coerente (não dez/2025 em prod)
- [x] **Pricing** — planos no HTML inicial (não só seletor Mensal/Anual); calculadora de ROI sem valores padrão sem fonte
- [x] **Termos vs home** — alinhar escopo legal (beleza/bem-estar) com categorias da home (advocacia, mecânica, etc.) ou ajustar copy
- [x] **Soft 404 de loja** — loja inexistente não fica em shell vazia; `ApiHttpError` 404 → `BookingNotFound` (sem retry)  
  → ex.: `/booking/<uuid-inexistente>`
- [x] **`/checkout` sem sessão** — não ficar em “Verificando pagamento…” sem contexto; redirect ou empty state claro

---

## Área parceiro (dev)

- [ ] **A1 — Painel** — telas de Profissionais e Clientes; onboarding para parceiro novo; relatórios/exportação  
  → limites `PRO_LIMIT` na UI/API (aba Equipe + 403 no create) feitos; falta Clientes/onboarding/exportação
- [x] **A3 — WhatsApp** — Verify Token do webhook **não** em texto puro *(UI mask no P1; checklist alinhado)*
- [x] **A4 — Analytics** — remover placeholders (CAC R$ 50, Tempo Médio 30min, heatmap fake); formato BR (`R$ 14.000`); eixo do gráfico legível; empty state em agendamentos
- [x] **A6 — Moeda** — padronizar (`R$ 199,90` etc.; sem misturar `R$199.90` / `100.00 R$`)
- [x] **A10 — Upgrade** — card Enterprise sem corte; não marcar Business como “Mais popular” e “Plano Atual” ao mesmo tempo
- [x] **A11 — Histórico de notificações** — datas localizadas; e-mail legível; paginação em PT (“Anterior/Próximo”)
- [x] **A12 — Perfil do cliente** — contador “1 Agendamento” coerente com a lista (ou lista preenchida)
- [x] **A13 — Home logada** — imagens do carrossel; erros de console; camada invisível não intercepta menu; © ano atual

---

## Funcionalidades (produto)

- [x] **F5** — Páginas `/categoria/[categoria]/[cidade]` com metadata própria + JSON-LD `LocalBusiness` (sitemap só quando a loja indexada tem categoria pública e cidade)
- [x] **F6** — Busca IA com filtro real de categoria/local + empty state honesto *(shipped no P1 — relevância + empty state)*
- [ ] **F7** — Sinal/depósito Pix anti no-show

---

## Crescimento

- [ ] **G6** — Programa de indicação bilateral (cliente ↔ profissional)
- [ ] **G7** — Instagram com conteúdo de parceiros + Google Perfil da Empresa apontando para ServiceSnap

---

## Done when

- [x] Visitante não encontra soft 404, checkout órfão nem H1 quebrado
- [x] Painel parceiro não mostra analytics/moeda/placeholder mentindo
- [ ] F5–F7 e G6–G7 têm caminho claro no backlog de produto (mesmo que ainda não shipados)

---

*Checklist local. Atualize este arquivo conforme o progresso.*
