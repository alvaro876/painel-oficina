import { NextResponse } from "next/server";
import { query } from "@/lib/clickhouse";
import { WORKSHOP_SQL } from "@/lib/queries/workshop";
import { MECH_BASE_SQL } from "@/lib/queries/mechBase";
import type { WorkshopOS } from "@/types";

export const dynamic = "force-dynamic";

// A base "casa" do mecânico muda devagar — cache de 5min pra não rodar a query
// de 21 dias a cada 45s.
let mechBaseCache: { at: number; map: Record<string, number> } | null = null;

async function getMechBase(): Promise<Record<string, number>> {
  if (mechBaseCache && Date.now() - mechBaseCache.at < 300_000) {
    return mechBaseCache.map;
  }
  const rows = await query<{ email: string; location_id: number }>(MECH_BASE_SQL);
  const map: Record<string, number> = {};
  for (const r of rows) {
    if (r.email) map[r.email.toLowerCase()] = r.location_id;
  }
  mechBaseCache = { at: Date.now(), map };
  return map;
}

export async function GET() {
  try {
    const [rows, mechBase] = await Promise.all([
      query<WorkshopOS>(WORKSHOP_SQL),
      getMechBase(),
    ]);
    return NextResponse.json({ rows, mechBase, fetchedAt: new Date().toISOString() });
  } catch (e) {
    console.error("workshop query failed:", e);
    return NextResponse.json(
      { error: "Falha ao buscar dados da oficina." },
      { status: 500 }
    );
  }
}
