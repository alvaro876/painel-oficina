// Armazenamento do layout dos carrinhos (a ÚNICA coisa que o app grava).
//
// Backend dual, escolhido por env (mesma API /api/layout):
//  - LAYOUT_SHEET_ID + GOOGLE_SERVICE_ACCOUNT_JSON setados → Google Sheets (prod/multi-tela)
//  - senão → arquivo local data/layout.json (dev)
//
// Sem SDK: assina o JWT do service account com o `crypto` nativo e fala com a
// Sheets API v4 via fetch (mesma pegada do cliente ClickHouse).
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import type { LayoutRow } from "@/types";

const useSheets = Boolean(
  process.env.LAYOUT_SHEET_ID && process.env.GOOGLE_SERVICE_ACCOUNT_JSON
);

// ============================ backend ARQUIVO (dev) ============================
const FILE = path.join(process.cwd(), "data", "layout.json");

async function readFileBackend(): Promise<LayoutRow[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as LayoutRow[];
  } catch {
    return [];
  }
}

async function writeFileBackend(row: LayoutRow): Promise<void> {
  const rows = await readFileBackend();
  const i = rows.findIndex((r) => r.carrinho === row.carrinho);
  if (i === -1) rows.push(row);
  else rows[i] = row;
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(rows, null, 2), "utf8");
}

// ========================= backend GOOGLE SHEETS (prod) ========================
const RANGE = "Layout!A2:F";

function b64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

let tokenCache: { token: string; exp: number } | null = null;

async function sheetsToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.exp - 30_000) return tokenCache.token;

  const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!) as {
    client_email: string;
    private_key: string;
  };
  const now = Math.floor(Date.now() / 1000);
  const head = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(
    JSON.stringify({
      iss: creds.client_email,
      scope: "https://www.googleapis.com/auth/spreadsheets",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    })
  );
  const input = `${head}.${claim}`;
  const sig = crypto.createSign("RSA-SHA256").update(input).sign(creds.private_key);
  const assertion = `${input}.${b64url(sig)}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!res.ok) {
    throw new Error(`Google token ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  const json = (await res.json()) as { access_token: string; expires_in: number };
  tokenCache = { token: json.access_token, exp: Date.now() + json.expires_in * 1000 };
  return json.access_token;
}

function sheetUrl(range: string, suffix = ""): string {
  return `https://sheets.googleapis.com/v4/spreadsheets/${process.env.LAYOUT_SHEET_ID}/values/${encodeURIComponent(range)}${suffix}`;
}

async function readSheetBackend(): Promise<LayoutRow[]> {
  const res = await fetch(sheetUrl(RANGE), {
    headers: { Authorization: `Bearer ${await sheetsToken()}` },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Sheets read ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  const json = (await res.json()) as { values?: string[][] };
  return (json.values ?? [])
    .filter((r) => r[0])
    .map((r) => ({
      carrinho: r[0],
      x: Number(r[1]) || 0,
      y: Number(r[2]) || 0,
      lado: (Number(r[3]) === 2 ? 2 : 1) as 1 | 2,
      updated_at: r[4] ?? "",
      updated_by: r[5] ?? "",
    }));
}

async function writeSheetBackend(row: LayoutRow): Promise<void> {
  const rows = await readSheetBackend();
  const i = rows.findIndex((r) => r.carrinho === row.carrinho);
  const values = [
    [row.carrinho, String(row.x), String(row.y), String(row.lado), row.updated_at, row.updated_by],
  ];
  const headers = {
    Authorization: `Bearer ${await sheetsToken()}`,
    "Content-Type": "application/json",
  };
  if (i === -1) {
    const res = await fetch(sheetUrl(RANGE, ":append?valueInputOption=RAW"), {
      method: "POST",
      headers,
      body: JSON.stringify({ values }),
    });
    if (!res.ok) throw new Error(`Sheets append ${res.status}: ${(await res.text()).slice(0, 200)}`);
  } else {
    const n = i + 2; // +2: linha 1 = cabeçalho, índice 0-based
    const res = await fetch(sheetUrl(`Layout!A${n}:F${n}`, "?valueInputOption=RAW"), {
      method: "PUT",
      headers,
      body: JSON.stringify({ values }),
    });
    if (!res.ok) throw new Error(`Sheets update ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
}

// ============================== API pública ===================================
// Cache leve de leitura (5s) pra N telas em polling não estourarem a quota.
let readCache: { at: number; rows: LayoutRow[] } | null = null;
const READ_TTL = 5_000;

export async function readLayout(): Promise<LayoutRow[]> {
  if (!useSheets) return readFileBackend();
  if (readCache && Date.now() - readCache.at < READ_TTL) return readCache.rows;
  const rows = await readSheetBackend();
  readCache = { at: Date.now(), rows };
  return rows;
}

export async function writeLayout(row: LayoutRow): Promise<void> {
  if (!useSheets) return writeFileBackend(row);
  await writeSheetBackend(row);
  readCache = null; // invalida pra próxima leitura pegar fresco
}
