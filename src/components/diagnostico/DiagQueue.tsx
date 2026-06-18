import type { WorkshopOS } from "@/types";
import { FRENTE_STATUSES, isBoxRapido } from "@/lib/status";
import { ANOMALY } from "@/config/thresholds";
import { Metric } from "@/components/Metric";
import { DiagRow } from "./DiagRow";

export function DiagQueue({
  rows,
  loading,
  error,
}: {
  rows: WorkshopOS[];
  loading: boolean;
  error: string | null;
}) {
  const fila = rows
    .filter((r) => FRENTE_STATUSES.diagnostico.includes(r.status_atual))
    .sort(
      (a, b) =>
        b.is_piso - a.is_piso ||
        Number(isBoxRapido(b.so_type)) - Number(isBoxRapido(a.so_type)) ||
        b.min_in_status - a.min_in_status
    );

  const emDiag = fila.filter((r) => r.status_atual === "IN_DIAGNOSIS").length;
  const aguardando = fila.filter(
    (r) => r.status_atual === "AWAITING_MECHANIC"
  ).length;
  const piso = fila.filter((r) => r.is_piso).length;
  const anomalias = fila.filter((r) => r.min_in_status > ANOMALY.stuckMin).length;

  return (
    <div>
      <div className="grid grid-cols-4 gap-3 mb-4">
        <Metric label="Em diagnóstico" value={emDiag} />
        <Metric label="Aguard. mecânico" value={aguardando} />
        <Metric label="Em piso" value={piso} color="var(--danger)" />
        <Metric label="Anomalias" value={anomalias} color="var(--warn)" />
      </div>

      {error && (
        <div
          className="rounded-lg px-4 py-3 mb-4 text-sm"
          style={{
            background: "color-mix(in srgb, var(--danger) 12%, transparent)",
            color: "var(--danger)",
          }}
        >
          {error}
        </div>
      )}

      {loading && fila.length === 0 && (
        <div className="text-sm" style={{ color: "var(--text-dim)" }}>
          carregando…
        </div>
      )}
      {!loading && fila.length === 0 && !error && (
        <div className="text-sm" style={{ color: "var(--text-dim)" }}>
          Nenhuma moto em diagnóstico agora.
        </div>
      )}

      <div className="flex flex-col gap-2">
        {fila.map((r) => (
          <DiagRow key={r.so_id} r={r} />
        ))}
      </div>
    </div>
  );
}
