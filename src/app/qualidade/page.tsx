"use client";

import { Suspense } from "react";
import { usePolling } from "@/hooks/usePolling";
import { useBase } from "@/hooks/useBase";
import { AppShell } from "@/components/AppShell";
import { Loading } from "@/components/Loading";
import { LiveIndicator } from "@/components/LiveIndicator";
import { QaBoard } from "@/components/qualidade/QaBoard";
import { REFRESH } from "@/config/thresholds";
import type { WorkshopResponse } from "@/types";

export default function QualidadePage() {
  return (
    <Suspense fallback={<Loading />}>
      <QualidadeInner />
    </Suspense>
  );
}

function QualidadeInner() {
  const base = useBase();
  const { data, error, loading, fetchedAt } = usePolling<WorkshopResponse>(
    "/api/workshop",
    REFRESH.workshopMs
  );
  const all = data?.rows ?? [];
  const rows = base ? all.filter((r) => r.location_id === base) : all;

  return (
    <AppShell right={<LiveIndicator fetchedAt={fetchedAt} error={!!error} />}>
      <QaBoard rows={rows} loading={loading} error={error} />
    </AppShell>
  );
}
