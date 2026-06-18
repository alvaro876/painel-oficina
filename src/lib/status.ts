// Mapeamento status → frente e rótulos em pt-BR.
import type { Frente, OSStatus } from "@/types";

export const STATUS_LABEL: Record<OSStatus, string> = {
  IN_DIAGNOSIS: "diagnosticando",
  AWAITING_MECHANIC: "aguardando mecânico",
  IN_PROGRESS: "em reparo",
  PAUSED: "pausada",
  AWAITING_PARTS: "aguardando peça",
  QA_REJECTED: "reprovada",
  AWAITING_QA: "na fila de QA",
  IN_QA: "inspecionando",
};

// Quais status aparecem em cada tela. QA_REJECTED aparece nas duas:
// na Rampa é retrabalho (voltou pro mecânico); na Qualidade é "reprovada".
export const FRENTE_STATUSES: Record<Frente, OSStatus[]> = {
  diagnostico: ["IN_DIAGNOSIS", "AWAITING_MECHANIC"],
  rampa: ["IN_PROGRESS", "PAUSED", "AWAITING_PARTS", "QA_REJECTED"],
  qualidade: ["AWAITING_QA", "IN_QA", "QA_REJECTED"],
};

export const isFrente = (status: OSStatus, frente: Frente): boolean =>
  FRENTE_STATUSES[frente].includes(status);

// "Box rápido" = reparo expresso (confirmado nos dados: so_type FAST_REPAIR).
export const isBoxRapido = (soType: string): boolean => soType === "FAST_REPAIR";
