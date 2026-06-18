import type { WorkshopOS } from "@/types";
import { STATUS_LABEL, isBoxRapido } from "@/lib/status";
import { ANOMALY, TIME_RED } from "@/config/thresholds";
import { baseById } from "@/lib/bases";
import { TimeChip } from "@/components/TimeChip";
import { Badge } from "@/components/Badge";
import { IncidentBadge } from "@/components/IncidentBadge";

export function DiagRow({ r }: { r: WorkshopOS }) {
  const anomalia = r.min_in_status > ANOMALY.stuckMin;
  const limit = TIME_RED[r.status_atual];
  const red = anomalia || (limit != null && r.min_in_status >= limit);
  const amber = !red && limit != null && r.min_in_status >= limit * 0.66;
  const dot = red ? "var(--danger)" : amber ? "var(--warn)" : "var(--ok)";
  const base = baseById(r.location_id);
  const mec = r.mecanico_email ? r.mecanico_email.split("@")[0] : null;

  return (
    <div
      className="flex items-center gap-3 px-3 py-3 rounded-lg"
      style={{
        background: "var(--surface)",
        border: anomalia
          ? "1px solid color-mix(in srgb, var(--danger) 45%, var(--border))"
          : "1px solid var(--border)",
      }}
    >
      <span
        className="shrink-0 rounded-full"
        style={{ width: 9, height: 9, background: dot }}
      />
      <div className="min-w-0">
        <div className="font-mono font-medium">{r.placa}</div>
        <div className="text-xs truncate" style={{ color: "var(--text-dim)" }}>
          {r.modelo} · {STATUS_LABEL[r.status_atual]}
          {mec ? ` · ${mec}` : ""}
          {base ? ` · ${base.name}` : ""}
        </div>
      </div>
      <div className="ml-auto flex items-center gap-2 shrink-0">
        {r.is_piso === 1 && <Badge color="danger">piso</Badge>}
        {isBoxRapido(r.so_type) && <Badge color="info">box rápido</Badge>}
        <IncidentBadge guincho={r.is_guincho === 1} recidivism={r.is_recidivism === 1} />
        {anomalia && <Badge color="danger">anomalia</Badge>}
        <TimeChip min={r.min_in_status} status={r.status_atual} />
      </div>
    </div>
  );
}
