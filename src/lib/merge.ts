// Junta o login (planilha) com a OS ao vivo (ClickHouse) por email.
import type { CartLogin, WorkshopOS } from "@/types";

// email → base. Prioriza a base da OS ativa; cai pra base "casa" (mechBase).
export function mecBaseMap(
  workshop: WorkshopOS[],
  mechBase: Record<string, number>
): Map<string, number> {
  const m = new Map<string, number>();
  for (const [email, loc] of Object.entries(mechBase)) {
    m.set(email.toLowerCase(), loc);
  }
  for (const r of workshop) {
    if (r.mecanico_email) m.set(r.mecanico_email.toLowerCase(), r.location_id);
  }
  return m;
}

export interface MecStatus {
  mecanico: string;
  carrinho: string;
  since: string; // ISO UTC do checkin
  os: WorkshopOS | null; // OS em IN_PROGRESS, se houver
  idle: boolean; // logado mas sem OS em andamento
}

export function equipeAgora(
  logins: CartLogin[],
  workshop: WorkshopOS[]
): MecStatus[] {
  const inProgressByMec = new Map<string, WorkshopOS>();
  for (const r of workshop) {
    if (r.status_atual === "IN_PROGRESS" && r.mecanico_email) {
      inProgressByMec.set(r.mecanico_email.toLowerCase(), r);
    }
  }

  return logins
    .map((l) => {
      const os = inProgressByMec.get(l.mecanico.toLowerCase()) ?? null;
      return {
        mecanico: l.mecanico,
        carrinho: l.carrinho,
        since: l.since,
        os,
        idle: os === null,
      };
    })
    .sort((a, b) => Number(a.idle) - Number(b.idle)); // trabalhando primeiro
}
