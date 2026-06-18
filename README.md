# Painel de Oficina · Vammo

Visão de **gestão em tempo real** da oficina de manutenção, em 3 frentes — **Diagnóstico, Rampa, Qualidade**. Pensado pra rodar em TVs no chão de fábrica e em tablets/desktop dos gestores.

> É um painel de **monitoramento**: tudo é só-leitura, **exceto** o gestor arrastar os carrinhos no mapa da Rampa. Mecânico não toca em nada aqui.

---

## As 3 telas

- **Diagnóstico** — fila priorizada (piso → box rápido → tempo) das motos em diagnóstico / aguardando mecânico, com badges (piso, box rápido, guincho reincidente, anomalia) e o painel **"Equipe agora"** (quem está logado e quem está ocioso).
- **Rampa** — mapa 2D da oficina dividido em **Lado 1 / Lado 2**. Cada carrinho mostra mecânico, placa, modelo, **tempo decorrido vs. estimado** (barra que fica vermelha ao passar da meta), pausa e **destaque forte pra cliente em piso**. O gestor arrasta os carrinhos pra organizar os lados.
- **Qualidade** — quadro enxuto (status, placa, mecânico, piso, tempo) das motos na QA.

Tudo com refresh automático e indicador "ao vivo · há Xs".

---

## Arquitetura (sem banco de dados)

```
  ClickHouse (oms_r, ims_r, maestro)  ──►  /api/workshop   ┐
  Planilha "Registros" (gviz CSV)     ──►  /api/registros  ├──►  React (3 telas, polling)
  Planilha "Layout" (posições)        ◄─►  /api/layout     ┘
```

| Dado | Fonte | Acesso |
|---|---|---|
| OS / moto / status / tempos / peças / flags | ClickHouse (db 38), via API HTTP | somente leitura |
| Quem logou em qual carrinho | Google Sheet **Registros** (cópia IMPORTRANGE), via endpoint `gviz` CSV | somente leitura |
| Posição dos carrinhos no mapa | Google Sheet **Layout** (em dev: `data/layout.json`) | leitura **e escrita** |

Nenhum Postgres/Supabase. O único estado gravável é a posição dos carrinhos.

---

## De onde vêm os flags (descoberto explorando o DW)

| Flag | Fonte |
|---|---|
| **Cliente em piso** | check-in do Maestro (`maestro_scheduler_r.checkin`): manutenção ativa, sem reserva entregue, não concluída, ≤24h |
| **Box rápido** | `oms_r.so.so_type = 'FAST_REPAIR'` |
| **Guincho / Reincidente** | `maintenance_metadata.triage.incidents.towing` / `.recidivism` |
| **Tempo estimado** | soma do `time_target` (tabela do Beraldo, `ims_r.item_group`) das peças **diagnosticadas** (`so_item.quantity > 0`) |
| **Mecânico ocioso** | logado na planilha **sem** OS `IN_PROGRESS` no ClickHouse |

> ⚠️ O `maintenance_metadata` foi reestruturado (~jun/2026): saiu `checklist_tags`, entrou `triage.incidents`. O piso (`client_present`) saiu do metadata de vez → hoje vem do Maestro.

---

## Stack

Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind v4 · deploy na Vercel. Espelha as convenções do app irmão `vammo-reserva`.

---

## Variáveis de ambiente

Copie `.env.example` → `.env.local` e preencha. **Nunca** commite o `.env.local`.

| Variável | Pra quê |
|---|---|
| `CLICKHOUSE_HOST` / `CLICKHOUSE_USER` / `CLICKHOUSE_PASSWORD` | acesso ao DW (mesmas do vammo-reserva) |
| `REGISTROS_SHEET_ID` | ID da planilha de check-in (cópia IMPORTRANGE) |
| `APP_PASSWORD` | portão de senha temporário (Basic Auth). Vazio em dev = aberto; setado no Vercel = protege |
| `LAYOUT_SHEET_ID` / `GOOGLE_SERVICE_ACCOUNT_JSON` | persistência do layout em prod (fase 5) |
| `AUTH_*` / `KIOSK_SECRET` | login Google + quiosque (fase 6) |

---

## Rodar local

```bash
npm install
cp .env.example .env.local   # e preencher CLICKHOUSE_* + REGISTROS_SHEET_ID
npm run dev                  # http://localhost:3000
```

---

## Deploy (Vercel)

1. Importe o repositório no Vercel (New Project → from GitHub).
2. Em **Environment Variables**, antes do primeiro build, adicione: `CLICKHOUSE_HOST`, `CLICKHOUSE_USER`, `CLICKHOUSE_PASSWORD`, `REGISTROS_SHEET_ID` e **`APP_PASSWORD`** (pra não ficar público).
3. Deploy. As 3 telas funcionam; o **arrasto não persiste em prod** até a fase 5 (filesystem da Vercel é read-only — precisa do backend Google Sheets).

---

## Config

Limiares em `src/config/thresholds.ts` — cadência de refresh, minutos pro cronômetro ficar vermelho por status, anomalia, janela de "zumbi" (OS travada). Bases em `src/lib/bases.ts` (1=Mooca, 34=Osasco, 166=SBC).

---

## Roadmap

- [x] 3 telas ao vivo + filtro por base
- [x] Flags: piso, box rápido, guincho/reincidente, estimado
- [x] Mapa da Rampa com arrasto (persistência local em dev)
- [ ] **Fase 5** — persistência do layout via Google Sheets (service account) → arrasto reflete em todas as telas em prod
- [ ] **Fase 6** — login Google @vammo.com + modo quiosque pras TVs (substitui o `APP_PASSWORD`)
- [ ] Detalhe da Qualidade (clique → peças + diagnóstico)
- [ ] Flag de urgência (moto imobilizada / acidente no topo)

---

## Notas

- Calibração: "ocioso" hoje inclui quem está em diagnóstico/QA (não capturamos atividade por mecânico além de `IN_PROGRESS`).
- O dado do ClickHouse tem ~66s de lag (CDC PeerDB) — por isso o refresh é de 30-60s, não menos.
