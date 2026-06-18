"use client";

import { Suspense, useCallback, useState } from "react";
import { usePolling } from "@/hooks/usePolling";
import { useBase } from "@/hooks/useBase";
import { useIsNarrow } from "@/hooks/useIsNarrow";
import { AppShell } from "@/components/AppShell";
import { Loading } from "@/components/Loading";
import { LiveIndicator } from "@/components/LiveIndicator";
import { RampaMap, type RampaCart } from "@/components/rampa/RampaMap";
import { RampaList } from "@/components/rampa/RampaList";
import { IdleStrip } from "@/components/rampa/IdleStrip";
import { Metric } from "@/components/Metric";
import { FRENTE_STATUSES } from "@/lib/status";
import { mecBaseMap } from "@/lib/merge";
import { REFRESH, TIME_RED } from "@/config/thresholds";
import type { CartLogin, LayoutRow, LiveResponse, WorkshopOS, WorkshopResponse } from "@/types";

const rank = (os: WorkshopOS): number => (os.status_atual === "IN_PROGRESS" ? 0 : 1);

export default function RampaPage() {
  return (
    <Suspense fallback={<Loading />}>
      <RampaInner />
    </Suspense>
  );
}

function RampaInner() {
  const base = useBase();
  const narrow = useIsNarrow();
  const [view, setView] = useState<"mapa" | "lista" | null>(null);
  const effectiveView = view ?? (narrow ? "lista" : "mapa");

  const ws = usePolling<WorkshopResponse>("/api/workshop", REFRESH.workshopMs);
  const rg = usePolling<LiveResponse<CartLogin>>("/api/registros", REFRESH.registrosMs);
  const ly = usePolling<LiveResponse<LayoutRow>>("/api/layout", REFRESH.layoutMs);

  const all = ws.data?.rows ?? [];
  const mechBase = ws.data?.mechBase ?? {};
  const allLogins = rg.data?.rows ?? [];
  const layout = ly.data?.rows ?? [];

  const rows = base ? all.filter((r) => r.location_id === base) : all;
  const bmap = mecBaseMap(all, mechBase);
  const logins = allLogins.filter((l) => !base || bmap.get(l.mecanico.toLowerCase()) === base);

  const cartByMec = new Map(allLogins.map((l) => [l.mecanico.toLowerCase(), l.carrinho]));

  const rampaRows = rows.filter((r) => FRENTE_STATUSES.rampa.includes(r.status_atual));
  const cartMap = new Map<string, RampaCart>();
  for (const os of rampaRows) {
    const carrinho = os.mecanico_email
      ? cartByMec.get(os.mecanico_email.toLowerCase()) ?? null
      : null;
    const key = carrinho ? `${os.location_id}:${carrinho}` : `so:${os.so_id}`;
    const cur = cartMap.get(key);
    if (
      !cur ||
      rank(os) < rank(cur.os) ||
      (rank(os) === rank(cur.os) && os.min_in_status < cur.os.min_in_status)
    ) {
      cartMap.set(key, { key, carrinho, os });
    }
  }
  const carts: RampaCart[] = [...cartMap.values()];

  const activeMecs = new Set(
    rampaRows.map((r) => r.mecanico_email.toLowerCase()).filter(Boolean)
  );
  const idle = logins.filter((l) => !activeMecs.has(l.mecanico.toLowerCase()));

  const acima60 = rampaRows.filter(
    (r) => r.status_atual === "IN_PROGRESS" && r.min_in_status >= (TIME_RED.IN_PROGRESS ?? 60)
  ).length;
  const acimaEstimado = rampaRows.filter(
    (r) => r.estimated_min > 0 && r.min_in_status > r.estimated_min
  ).length;

  const onMove = useCallback(
    async (carrinho: string, x: number, y: number, lado: 1 | 2) => {
      try {
        await fetch("/api/layout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ carrinho, x, y, lado }),
        });
        ly.refresh();
      } catch {
        /* posição otimista já está na tela */
      }
    },
    [ly]
  );

  return (
    <AppShell right={<LiveIndicator fetchedAt={ws.fetchedAt} error={!!ws.error} />}>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <Metric label="Na rampa" value={rampaRows.length} />
          <Metric label="Ociosos" value={idle.length} color="var(--warn)" />
          <Metric label="Acima de 60min" value={acima60} color="var(--danger)" />
          <Metric label="Acima do estimado" value={acimaEstimado} color="var(--danger)" />
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex rounded-md overflow-hidden" style={{ border: "1px solid var(--border)" }}>
            {(["mapa", "lista"] as const).map((v) => {
              const active = effectiveView === v;
              return (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className="text-xs px-3 py-1"
                  style={{
                    color: active ? "var(--text)" : "var(--text-dim)",
                    background: active ? "var(--surface-2)" : "transparent",
                    fontWeight: active ? 500 : 400,
                  }}
                >
                  {v === "mapa" ? "Mapa" : "Lista"}
                </button>
              );
            })}
          </div>
          {effectiveView === "mapa" && (
            <span className="text-xs hidden sm:block" style={{ color: "var(--text-tertiary, var(--text-dim))" }}>
              arraste os carrinhos entre os lados
            </span>
          )}
        </div>

        {effectiveView === "mapa" ? (
          <RampaMap carts={carts} layout={layout} canEdit onMove={onMove} />
        ) : (
          <RampaList carts={carts} layout={layout} canEdit onMove={onMove} />
        )}

        <IdleStrip idle={idle} />
      </div>
    </AppShell>
  );
}
