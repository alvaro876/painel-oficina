import { NextResponse } from "next/server";
import { readLayout, writeLayout } from "@/lib/layoutStore";
import type { LayoutRow } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await readLayout();
    return NextResponse.json({ rows, fetchedAt: new Date().toISOString() });
  } catch (e) {
    console.error("layout read failed:", e);
    return NextResponse.json({ error: "Falha ao ler o layout." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<LayoutRow>;
    const carrinho = String(body.carrinho ?? "").trim();
    const x = Number(body.x);
    const y = Number(body.y);
    const lado: 1 | 2 = body.lado === 2 ? 2 : 1;
    if (!carrinho || !Number.isFinite(x) || !Number.isFinite(y)) {
      return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
    }
    const row: LayoutRow = {
      carrinho,
      x,
      y,
      lado,
      updated_at: new Date().toISOString(),
      updated_by: "local", // fase 6: email da sessão
    };
    await writeLayout(row);
    return NextResponse.json({ ok: true, row });
  } catch (e) {
    console.error("layout write failed:", e);
    return NextResponse.json({ error: "Falha ao salvar o layout." }, { status: 500 });
  }
}
