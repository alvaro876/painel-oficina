import { NextResponse } from "next/server";

// Diagnóstico: mostra quais env vars existem (sem valores) e testa cada fonte,
// incluindo a ESCRITA no layout (grava uma linha __healthcheck__ inofensiva).
export const dynamic = "force-dynamic";

export async function GET() {
  const env = {
    CLICKHOUSE_HOST: Boolean(process.env.CLICKHOUSE_HOST),
    CLICKHOUSE_USER: Boolean(process.env.CLICKHOUSE_USER),
    CLICKHOUSE_PASSWORD: Boolean(process.env.CLICKHOUSE_PASSWORD),
    REGISTROS_SHEET_ID: Boolean(process.env.REGISTROS_SHEET_ID),
    LAYOUT_SHEET_ID: Boolean(process.env.LAYOUT_SHEET_ID),
    GOOGLE_SERVICE_ACCOUNT_JSON: Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
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

  try {
    const { readLayout } = await import("@/lib/layoutStore");
    const rows = await readLayout();
    checks.layout_read = `ok (${rows.length} linhas)`;
  } catch (e) {
    checks.layout_read = "erro: " + (e instanceof Error ? e.message : String(e));
  }

  try {
    const { writeLayout, readLayout } = await import("@/lib/layoutStore");
    await writeLayout({
      carrinho: "__healthcheck__",
      x: 1,
      y: 1,
      lado: 1,
      updated_at: new Date().toISOString(),
      updated_by: "health",
    });
    const back = await readLayout();
    checks.layout_write = back.some((r) => r.carrinho === "__healthcheck__")
      ? "ok (gravou e leu de volta)"
      : "gravou mas não apareceu na leitura";
  } catch (e) {
    checks.layout_write = "erro: " + (e instanceof Error ? e.message : String(e));
  }

  return NextResponse.json({ env, checks });
}
