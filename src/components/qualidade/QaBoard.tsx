import type { OSStatus, WorkshopOS } from "@/types";
import { FRENTE_STATUSES } from "@/lib/status";
import { baseById } from "@/lib/bases";
import { TimeChip } from "@/components/TimeChip";
import { Badge } from "@/components/Badge";
import { Metric } from "@/components/Metric";
import { Plate } from "@/components/Plate";

const ORDER: Record<string, number> = { IN_QA: 0, QA_REJECTED: 1, AWAITING_QA: 2 };
const CHIP: Record<string, { label: string; color: string }> = {
  IN_QA: { label: "inspecionando", color: "var(--info)" },
  QA_REJECTED: { label: "reprovada", color: "var(--danger)" },
  AWAITING_QA: { label: "na fila", color: "var(--text-dim)" },
};

export function QaBoard({
  rows,
  loading,
  error,
}: {
  rows: WorkshopOS[];
  loading: boolean;
  error: string | null;
}) {
  const qa = rows
    .filter((r) => FRENTE_STATUSES.qualidade.includes(r.status_atual))
    .sort(
      (a, b) =>
        (ORDER[a.status_atual] ?? 9) - (ORDER[b.status_atual] ?? 9) ||
        b.min_in_status - a.min_in_status
    );

  const count = (s: OSStatus) => qa.filter((r) => r.status_atual === s).length;
  const piso = qa.filter((r) => r.is_piso).length;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-5">
        <Metric label="Na fila de QA" value={count("AWAITING_QA")} />
        <Metric label="Inspecionando" value={count("IN_QA")} color="var(--info)" />
        <Metric label="Reprovadas" value={count("QA_REJECTED")} color="var(--danger)" />
        <Metric label="Em piso" value={piso} color="var(--danger)" />
      </div>

      {error && (
        <div
          className="rounded-lg px-4 py-3 mb-4 text-sm"
          style={{ background: "color-mix(in srgb, var(--danger) 12%, transparent)", color: "var(--danger)" }}
        >
          {error}
        </div>
      )}
      {loading && qa.length === 0 && (
        <div className="text-sm" style={{ color: "var(--text-dim)" }}>carregando…</div>
      )}
      {!loading && qa.length === 0 && !error && (
        <div className="text-sm" style={{ color: "var(--text-dim)" }}>
          Nenhuma moto na qualidade agora.
        </div>
      )}

      <div className="flex flex-col gap-2">
        {qa.map((r) => {
          const chip = CHIP[r.status_atual] ?? { label: r.status_atual, color: "var(--text-dim)" };
          const base = baseById(r.location_id);
          const mec = r.mecanico_email ? r.mecanico_email.split("@")[0] : null;
          return (
            <div
              key={r.so_id}
              className="px-3 py-3 rounded-lg"
              style={{
                background: "var(--surface)",
                border:
                  r.status_atual === "QA_REJECTED"
                    ? "1px solid color-mix(in srgb, var(--danger) 45%, var(--border))"
                    : "1px solid var(--border)",
              }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="px-2 py-1 rounded-md text-center shrink-0"
                  style={{ width: 124, fontSize: 13, color: chip.color, background: `color-mix(in srgb, ${chip.color} 16%, transparent)` }}
                >
                  {chip.label}
                </span>
                <Plate value={r.placa} size="md" />
                <div className="min-w-0">
                  <div className="truncate" style={{ fontSize: 15, color: "var(--text-dim)" }}>
                    {r.modelo}
                    {mec ? ` · ${mec}` : ""}
                    {base ? ` · ${base.name}` : ""}
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-3 shrink-0">
                  {r.is_piso === 1 && <Badge color="danger">piso</Badge>}
                  <TimeChip min={r.min_in_status} status={r.status_atual} />
                </div>
              </div>

              {r.pecas_nomes && r.pecas_nomes.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <div className="mb-1.5" style={{ fontSize: 13, color: "var(--text-dim)" }}>
                    Peças trocadas ({r.pecas_nomes.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {r.pecas_nomes.map((p, i) => (
                      <span
                        key={i}
                        className="rounded-md"
                        style={{
                          fontSize: 14,
                          padding: "4px 10px",
                          background: "var(--surface-2)",
                          color: "var(--text)",
                        }}
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
