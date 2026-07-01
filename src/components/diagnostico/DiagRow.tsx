import type { WorkshopOS } from "@/types";
import { STATUS_LABEL, isBoxRapido } from "@/lib/status";
import { ANOMALY, TIME_RED } from "@/config/thresholds";
import { baseById } from "@/lib/bases";
import { oneLine } from "@/lib/format";
import { TimeChip } from "@/components/TimeChip";
import { Badge } from "@/components/Badge";
import { IncidentBadge } from "@/components/IncidentBadge";
import { Plate } from "@/components/Plate";

export function DiagRow({ r }: { r: WorkshopOS }) {
  const anomalia = r.min_in_status > ANOMALY.stuckMin;
  const limit = TIME_RED[r.status_atual];
  const red = anomalia || (limit != null && r.min_in_status >= limit);
  const amber = !red && limit != null && r.min_in_status >= limit * 0.66;
  const dot = red ? "var(--danger)" : amber ? "var(--warn)" : "var(--ok)";
  const base = baseById(r.location_id);
  const mec = r.mecanico_email ? r.mecanico_email.split("@")[0] : null;
  const reclam = oneLine(r.reclamacao);

  return (
    <div
      className="flex items-start gap-3 px-3 py-3 rounded-lg"
      style={{
        background: "var(--surface)",
        border: anomalia
          ? "1px solid color-mix(in srgb, var(--danger) 45%, var(--border))"
          : "1px solid var(--border)",
      }}
    >
      <span
        className="shrink-0 rounded-full"
        style={{ width: 12, height: 12, background: dot, marginTop: 8 }}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <Plate value={r.placa} size="md" />
          <span style={{ fontSize: 18 }}>{r.modelo}</span>
          <span style={{ fontSize: 15, color: "var(--text-dim)" }}>
            · {STATUS_LABEL[r.status_atual]}
            {mec ? ` · ${mec}` : ""}
            {base ? ` · ${base.name}` : ""}
          </span>
        </div>
        {reclam && (
          <div
            className="clamp2"
            style={{ fontSize: 15, color: "var(--text-dim)", marginTop: 5 }}
            title={reclam}
          >
            <span style={{ color: "var(--text)" }}>Reclamação:</span> {reclam}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0" style={{ marginTop: 3 }}>
        {r.is_piso === 1 && <Badge color="danger">piso</Badge>}
        {isBoxRapido(r.so_type) && <Badge color="info">box rápido</Badge>}
        <IncidentBadge guincho={r.is_guincho === 1} recidivism={r.is_recidivism === 1} />
        {anomalia && <Badge color="danger">anomalia</Badge>}
        <TimeChip min={r.min_in_status} status={r.status_atual} />
      </div>
    </div>
  );
}
