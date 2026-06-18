import { NextResponse } from "next/server";
import { fetchRegistrosCsv } from "@/lib/sheets";
import { currentLogins, parseRegistros } from "@/lib/registros";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const csv = await fetchRegistrosCsv();
    const rows = currentLogins(parseRegistros(csv));
    return NextResponse.json({ rows, fetchedAt: new Date().toISOString() });
  } catch (e) {
    console.error("registros fetch failed:", e);
    return NextResponse.json(
      { error: "Falha ao ler a planilha de check-in." },
      { status: 500 }
    );
  }
}
