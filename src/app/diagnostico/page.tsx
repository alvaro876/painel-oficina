"use client";

import { Suspense } from "react";
import { usePolling } from "@/hooks/usePolling";
import { useBase } from "@/hooks/useBase";
import { AppShell } from "@/components/AppShell";
import { Loading } from "@/components/Loading";
import { LiveIndicator } from "@/components/LiveIndicator";
import { DiagQueue } from "@/components/diagnostico/DiagQueue";
import { EquipeAgora } from "@/components/diagnostico/EquipeAgora";
import { mecBaseMap } from "@/lib/merge";
import { REFRESH } from "@/config/thresholds";
import type { CartLogin, LiveResponse, WorkshopResponse } from "@/types";

export default function DiagnosticoPage() {
  return (
    <Suspense fallback={<Loading />}>
      <DiagnosticoInner />
    </Suspense>
  );
}

function DiagnosticoInner() {
  const base = useBase();
  const ws = usePolling<WorkshopResponse>("/api/workshop", REFRESH.workshopMs);
  const rg = usePolling<LiveResponse<CartLogin>>(
    "/api/registros",
    REFRESH.registrosMs
  );

  const all = ws.data?.rows ?? [];
  const mechBase = ws.data?.mechBase ?? {};
  const rows = base ? all.filter((r) => r.location_id === base) : all;

  const bmap = mecBaseMap(all, mechBase);
  const logins = (rg.data?.rows ?? []).filter(
    (l) => !base || bmap.get(l.mecanico.toLowerCase()) === base
  );

  return (
    <AppShell right={<LiveIndicator fetchedAt={ws.fetchedAt} error={!!ws.error} />}>
      <div className="max-w-5xl mx-auto flex flex-col gap-5">
        <DiagQueue rows={rows} loading={ws.loading} error={ws.error} />
        <EquipeAgora logins={logins} workshop={rows} error={rg.error} />
      </div>
    </AppShell>
  );
}
