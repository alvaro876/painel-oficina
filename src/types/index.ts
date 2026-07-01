// Tipos compartilhados entre backend (rotas) e frontend.

export type OSStatus =
  | "IN_DIAGNOSIS"
  | "AWAITING_MECHANIC"
  | "IN_PROGRESS"
  | "PAUSED"
  | "AWAITING_PARTS"
  | "QA_REJECTED"
  | "AWAITING_QA"
  | "IN_QA";

export type Frente = "diagnostico" | "rampa" | "qualidade";

/** Uma OS ativa, vinda da query core do ClickHouse (WORKSHOP_SQL). */
export interface WorkshopOS {
  so_id: number;
  placa: string;
  modelo: string;
  so_type: string;
  location_id: number;
  status_atual: OSStatus;
  min_in_status: number;
  mecanico_email: string;
  estimated_min: number;
  n_pecas: number;
  pecas_nomes: string[]; // peças diagnosticadas/trocadas
  reclamacao: string; // so_description (reclamação do cliente)
  is_piso: number; // 0 | 1
  is_guincho: number; // 0 | 1 — triage.incidents.towing
  is_recidivism: number; // 0 | 1 — triage.incidents.recidivism (reincidente)
  is_paused: number; // 0 | 1
}

/** Envelope padrão das rotas de dados ao vivo. */
export interface LiveResponse<T> {
  rows: T[];
  fetchedAt: string; // ISO
}

/** Resposta de /api/workshop — OS ativas + base "casa" por mecânico (email→location_id). */
export interface WorkshopResponse {
  rows: WorkshopOS[];
  mechBase: Record<string, number>;
  fetchedAt: string;
}

/** Login atual de um carrinho (derivado da planilha Registros). */
export interface CartLogin {
  carrinho: string; // ex.: "MC 17"
  mecanico: string; // email, chave de join com ims_r.user.email
  since: string; // ISO UTC do checkin
  ncCount: number;
}

/** Posição persistida de um carrinho (planilha Layout). */
export interface LayoutRow {
  carrinho: string;
  x: number;
  y: number;
  lado: 1 | 2;
  updated_at: string;
  updated_by: string;
}
