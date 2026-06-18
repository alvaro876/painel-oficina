// Todos os limiares num lugar só (nada hardcoded nos componentes).
import type { OSStatus } from "@/types";

/** Cadências de polling (ms). CDC do ClickHouse tem ~66s de lag → <30s é inútil. */
export const REFRESH = {
  workshopMs: 45_000, // dados do ClickHouse
  registrosMs: 12_000, // quem está logado
  layoutMs: 12_000, // posição dos carrinhos
} as const;

/** Minutos no status antes do cronômetro ficar vermelho. null = sem regra fixa. */
export const TIME_RED: Record<OSStatus, number | null> = {
  IN_DIAGNOSIS: 30,
  AWAITING_MECHANIC: 20,
  IN_PROGRESS: 60, // pedido do gestor: vermelho passando de 60min na rampa
  PAUSED: 30,
  AWAITING_PARTS: 120,
  QA_REJECTED: 15,
  AWAITING_QA: 30,
  IN_QA: 25,
};

/** "Stuck" genérico — 4h sem evoluir vira anomalia. */
export const ANOMALY = { stuckMin: 240 } as const;

/** Barra de progresso fica vermelha ao atingir 100% do tempo estimado. */
export const OVER_ESTIMATE = { warnPct: 1.0 } as const;

/** Janela de OS "fisicamente presente" — espelha o filtro da WORKSHOP_SQL. */
export const ZOMBIE = { maxStatusAgeHours: 48 } as const;

/** Buffer opcional somado ao tempo estimado (peças sem time_target contam 0). */
export const PART_TIME_BUFFER_MIN = 0;
