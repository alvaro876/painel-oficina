import { NextResponse } from "next/server";

// Diagnóstico: mostra quais env vars existem (sem valores) e testa cada fonte.
// Útil pra debugar deploy. Protegido pelo mesmo portão de senha (middleware).
export const dynamic = "force-dynamic";

export async function GET() {
  const env = {
    CLICKHOUSE_HOST: Boolean(process.env.CLICKHOUSE_HOST),
    CLICKHOUSE_USER: Boolean(process.env.CLICKHOUSE_USER),
    CLICKHOUSE_PASSWORD: Boolean(process.env.CLICKHOUSE_PASSWORD),
    REGISTROS_SHEET_ID: Boolean(process.env.REGISTROS_SHEET_ID),
    APP_PASSWORD: Boolean(process.env.APP_PASSWORD),
  };

  const checks: Record<string, string> = {};

  try {
    const { query } = await import("@/lib/clickhouse");
    const r = await query<{ ok: number }>("SELECT 1 AS ok");
    checks.clickhouse = r.length ? "ok" : "respondeu vazio";
  } catch (e) {
    checks.clickhouse = "erro: " + (e instanceof Error ? e.message : String(e));
  }

  try {
    const { fetchRegistrosCsv } = await import("@/lib/sheets");
    const csv = await fetchRegistrosCsv();
    checks.registros = `ok (${csv.length} bytes)`;
  } catch (e) {
    checks.registros = "erro: " + (e instanceof Error ? e.message : String(e));
  }

  return NextResponse.json({ env, checks });
}
