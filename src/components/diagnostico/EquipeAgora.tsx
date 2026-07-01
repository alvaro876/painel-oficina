"use client";

import { useEffect, useState } from "react";
import type { CartLogin, WorkshopOS } from "@/types";
import { equipeAgora } from "@/lib/merge";

function nome(email: string): string {
  return email.split("@")[0];
}

export function EquipeAgora({
  logins,
  workshop,
  error,
}: {
  logins: CartLogin[];
  workshop: WorkshopOS[];
  error: string | null;
}) {
  // re-render periódico só pra manter o texto coerente
  const [, setTick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(i);
  }, []);

  const team = equipeAgora(logins, workshop);
  const working = team.filter((t) => !t.idle);
  const idle = team.filter((t) => t.idle);

  return (
    <div
      className="rounded-lg px-4 py-3"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <div className="text-sm font-medium mb-3">
        Equipe agora{" "}
        <span style={{ color: "var(--text-dim)", fontWeight: 400 }}>
          · fonte: planilha de login + OS ao vivo
        </span>
      </div>

      {error && (
        <div className="text-sm" style={{ color: "var(--text-dim)" }}>
          Equipe indisponível (planilha de check-in).
        </div>
      )}

      {!error && team.length === 0 && (
        <div className="text-sm" style={{ color: "var(--text-dim)" }}>
          Ninguém logado agora.
        </div>
      )}

      {working.length > 0 && (
        <div className="flex items-start gap-2 mb-2">
          <span
            className="text-xs mt-1 shrink-0"
            style={{ color: "var(--text-dim)", width: 64 }}
          >
            Logados
          </span>
          <div className="flex flex-wrap gap-2">
            {working.map((t) => (
              <span
                key={t.mecanico}
                className="text-sm px-2 py-1 rounded-md"
                style={{ background: "var(--surface-2)" }}
              >
                {nome(t.mecanico)}{" "}
                <span style={{ color: "var(--text-dim)" }}>
                  · {t.carrinho}
                  {t.os ? ` · ${t.os.placa}` : ""}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {idle.length > 0 && (
        <div className="flex items-start gap-2">
          <span
            className="text-xs mt-1 shrink-0"
            style={{ color: "var(--warn)", width: 64 }}
          >
            Ociosos
          </span>
          <div className="flex flex-wrap gap-2">
            {idle.map((t) => (
              <span
                key={t.mecanico}
                className="text-sm px-2 py-1 rounded-md inline-flex items-center gap-1"
                style={{
                  color: "var(--warn)",
                  background: "color-mix(in srgb, var(--warn) 16%, transparent)",
                }}
              >
                {nome(t.mecanico)}
                <span style={{ opacity: 0.8 }}>· {t.carrinho}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
