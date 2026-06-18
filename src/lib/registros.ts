// Parse da planilha "Registros" (log de check-in/checkout) → estado atual.
import { parseCsv } from "@/lib/csv";
import type { CartLogin } from "@/types";

export interface RegistroEvent {
  id: string;
  tipo: "checkin" | "checkout";
  carrinho: string;
  mecanico: string; // email (minúsculo) — chave de join com ims_r.user.email
  ncCount: number;
  timestamp: string; // ISO UTC
}

export function parseRegistros(csv: string): RegistroEvent[] {
  const rows = parseCsv(csv);
  if (rows.length < 2) return [];

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const col = (name: string) => header.indexOf(name);
  const iId = col("id");
  const iTipo = col("tipo");
  const iCarrinho = col("carrinho");
  const iMec = col("mecanico");
  const iNc = col("nc_count");
  const iTs = col("timestamp");

  const out: RegistroEvent[] = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const carrinho = (row[iCarrinho] ?? "").trim();
    const mecanico = (row[iMec] ?? "").trim().toLowerCase();
    const timestamp = (row[iTs] ?? "").trim();
    if (!carrinho || !mecanico || !timestamp) continue;
    out.push({
      id: (row[iId] ?? "").trim(),
      tipo:
        (row[iTipo] ?? "").trim().toLowerCase() === "checkout"
          ? "checkout"
          : "checkin",
      carrinho,
      mecanico,
      ncCount: Number(row[iNc] ?? 0) || 0,
      timestamp,
    });
  }
  return out;
}

// Estado atual: último evento por carrinho E por mecânico.
// Um checkin sem checkout posterior = logado naquele carrinho.
// (VMO-FORCE-* são checkouts forçados — eventos normais aqui.)
export function currentLogins(events: RegistroEvent[]): CartLogin[] {
  const sorted = [...events].sort((a, b) =>
    a.timestamp.localeCompare(b.timestamp)
  ); // ISO UTC ordena lexicograficamente

  const latestByCart = new Map<string, RegistroEvent>();
  const latestByMec = new Map<string, RegistroEvent>();
  for (const e of sorted) {
    latestByCart.set(e.carrinho, e);
    latestByMec.set(e.mecanico, e);
  }

  const logins: CartLogin[] = [];
  for (const [carrinho, e] of latestByCart) {
    if (e.tipo !== "checkin") continue; // carrinho com último evento = checkout → vazio
    if (latestByMec.get(e.mecanico)?.id !== e.id) continue; // mecânico já se moveu/saiu
    logins.push({
      carrinho,
      mecanico: e.mecanico,
      since: e.timestamp,
      ncCount: e.ncCount,
    });
  }
  return logins;
}
