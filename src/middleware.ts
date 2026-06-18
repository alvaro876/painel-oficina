import { NextRequest, NextResponse } from "next/server";

// Portão de senha TEMPORÁRIO (Basic Auth).
// Fase 6 troca isto por login Google @vammo.com + token de quiosque pras TVs.
//
// Só ativa se APP_PASSWORD estiver setado:
//  - em dev (sem APP_PASSWORD)  → aberto, não atrapalha.
//  - no Vercel (com APP_PASSWORD) → exige a senha, protege os dados internos.
export function middleware(req: NextRequest) {
  const expected = process.env.APP_PASSWORD;
  if (!expected) return NextResponse.next();

  const header = req.headers.get("authorization");
  if (header?.startsWith("Basic ")) {
    try {
      const decoded = atob(header.slice(6));
      const pwd = decoded.slice(decoded.indexOf(":") + 1);
      if (pwd === expected) return NextResponse.next();
    } catch {
      // header malformado → cai no 401
    }
  }

  return new NextResponse("Autenticação necessária.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Painel de Oficina"' },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
