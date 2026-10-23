# Checklist P3 — Prioridade baixa (Roadmap)

Fonte: [ServiceSnap — Roadmap de Produto e Crescimento](https://servicesnap-roadmap-de-produto-e-m6ob.pages.grok.bot/)  
Prioridade no doc: **Baixa = P3**. Marque com `[x]` conforme for fechando.

---

## Público / site

- [ ] **`/booking` redirect** — hoje 307 → `/`; ideal **301** para SEO (status no doc: Parcial)
- [ ] **Dados de teste no dev** — evitar negócios não agendáveis (sorveteria, café, churrascaria) como vitrine
- [ ] **Peso da home no dev** — ~466 KB HTML + 78 imagens no primeiro load; reduzir payload
- [ ] **`/profile` sem login** — 307 → `/` sem pedir login; confirmar se é o esperado ou exigir auth

---

## Área parceiro (dev)

- [ ] **A7 — WhatsApp** — títulos das páginas WhatsApp não ser “Dashboard”
- [x] **A8 — Upgrade** — quem já é Enterprise não vê calculadora de ROI / “Por que fazer upgrade?”
- [ ] **A9 — Console** — zerar o erro de console comum a todas as páginas do parceiro
- [ ] **A14 — Agenda** — horário repetido nas células; filtro sem truncar (“Todos os Profissionais”); “Outubro de 2026” com capitalização correta
- [ ] **A15 — Rotas do cliente** — `/bookings`, `/favorites`, `/settings` (ou IA clara de que tudo vive em `/profile`)
- [ ] **A16 — Dados de teste** — categoria coerente (academia ≠ “cabelo”); sem “asdasdas”; endereço com número
- [ ] **A17 — Navegação** — “Meu painel” deixa claro que é o painel do parceiro
- [ ] **A18 — Desempenho** — `/partner/notifications/history` não fica em branco por vários segundos

---

## Funcionalidades (produto)

- [ ] **F8** — Avaliações verificadas pedidas por WhatsApp aos clientes do parceiro (evitar nota “0 (0)” no cold-start)

---

## Crescimento

- [ ] **G8** — SEO local programático (“preço de corte em [bairro]”) **depois** de haver lojas reais

---

## Done when

- [ ] Polish de parceiro (títulos, agenda, console, empty flashes) não distrai piloto
- [ ] Redirects/SEO menores alinhados
- [ ] F8/G8 só entram após densidade mínima de oferta

---

*Checklist local. Atualize este arquivo conforme o progresso.*
