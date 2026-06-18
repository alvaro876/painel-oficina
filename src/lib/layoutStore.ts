// Armazenamento do layout dos carrinhos (a ÚNICA coisa que o app grava).
//
// Backend dual:
//  - Se LAYOUT_SHEET_ID + GOOGLE_SERVICE_ACCOUNT_JSON estão setados → Google Sheets (fase 5, prod/multi-tela).
//  - Senão → arquivo local data/layout.json (dev: funciona no localhost na hora).
// A API /api/layout é a mesma; só o backend muda.
import { promises as fs } from "fs";
import path from "path";
import type { LayoutRow } from "@/types";

const FILE = path.join(process.cwd(), "data", "layout.json");
const useSheets = Boolean(
  process.env.LAYOUT_SHEET_ID && process.env.GOOGLE_SERVICE_ACCOUNT_JSON
);

export async function readLayout(): Promise<LayoutRow[]> {
  if (useSheets) return readLayoutSheet();
  try {
    const raw = await fs.readFile(FILE, "utf8");
    return JSON.parse(raw) as LayoutRow[];
  } catch {
    return [];
  }
}

export async function writeLayout(row: LayoutRow): Promise<void> {
  if (useSheets) return writeLayoutSheet(row);
  const rows = await readLayout();
  const idx = rows.findIndex((r) => r.carrinho === row.carrinho);
  if (idx === -1) rows.push(row);
  else rows[idx] = row;
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(rows, null, 2), "utf8");
}

// Stubs do backend Sheets — implementados na fase 5 (service account).
async function readLayoutSheet(): Promise<LayoutRow[]> {
  throw new Error("Layout via Google Sheets ainda não implementado (fase 5).");
}
async function writeLayoutSheet(_row: LayoutRow): Promise<void> {
  throw new Error("Layout via Google Sheets ainda não implementado (fase 5).");
}
