// Cliente ClickHouse via HTTPS API (somente leitura neste app).
//
// Por que não um SDK do ClickHouse? A API HTTP é simples: manda SQL no body do
// POST, recebe JSON. Um fetch() resolve, zero dependências extras.
//
// Por que no servidor (lib/), não no browser? Porque aqui ficam as credenciais.

// Validação preguiçosa (no uso, não no load do módulo) — assim o `next build`
// não quebra se as env vars ainda não estiverem setadas no ambiente de build.
function creds() {
  const host = process.env.CLICKHOUSE_HOST;
  const user = process.env.CLICKHOUSE_USER;
  const password = process.env.CLICKHOUSE_PASSWORD;
  if (!host || !user || !password) {
    throw new Error(
      "Variáveis do ClickHouse não configuradas (CLICKHOUSE_HOST/USER/PASSWORD)."
    );
  }
  return { host, user, password };
}

// Executa SQL e retorna array tipado. O genérico <T> faz o TS inferir a linha:
//   await query<WorkshopOS>(WORKSHOP_SQL)
export async function query<T>(sql: string): Promise<T[]> {
  const { host, user, password } = creds();
  const url = `${host}/?output_format_json_quote_64bit_integers=0`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
      Authorization:
        "Basic " + Buffer.from(`${user}:${password}`).toString("base64"),
    },
    body: sql + "\nFORMAT JSONEachRow",
    cache: "no-store", // dados de oficina mudam a cada minuto
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ClickHouse error ${response.status}: ${error.slice(0, 300)}`);
  }

  const text = await response.text();
  if (!text.trim()) return [];

  return text
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as T);
}
