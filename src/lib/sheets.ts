// Leitura de Google Sheets.
//
// Registros (somente leitura): usamos o endpoint gviz CSV, que entrega o CSV
// direto. O /export?format=csv faz 307 pra googleusercontent e complica no
// servidor — gviz é mais simples e estável.

const REGISTROS_ID = process.env.REGISTROS_SHEET_ID;

export async function fetchRegistrosCsv(): Promise<string> {
  if (!REGISTROS_ID) {
    throw new Error("REGISTROS_SHEET_ID não configurado no .env.local");
  }
  const url = `https://docs.google.com/spreadsheets/d/${REGISTROS_ID}/gviz/tq?tqx=out:csv`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Falha ao ler Registros (gviz ${res.status})`);
  }
  return res.text();
}
