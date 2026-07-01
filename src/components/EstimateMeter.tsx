import { formatMin } from "@/lib/format";

// Medidor de tempo: decorrido em destaque + meta (estimado) + barra de progresso.
export function EstimateMeter({
  elapsedMin,
  estimatedMin,
  danger,
}: {
  elapsedMin: number;
  estimatedMin: number;
  danger?: boolean;
}) {
  const hasEst = estimatedMin > 0;
  const pct = hasEst ? (elapsedMin / estimatedMin) * 100 : 0;
  const over = hasEst && elapsedMin > estimatedMin;
  const color =
    over || danger ? "var(--danger)" : pct >= 80 ? "var(--warn)" : "var(--ok)";
  const fill = hasEst ? Math.max(3, Math.min(100, pct)) : 0;

  return (
    <div style={{ marginTop: 7 }}>
      <div className="flex items-baseline justify-between" style={{ marginBottom: 4 }}>
        <span
          className="font-mono"
          style={{ fontSize: 20, fontWeight: 500, color, lineHeight: 1 }}
        >
          {formatMin(elapsedMin)}
        </span>
        {hasEst ? (
          over ? (
            <span style={{ fontSize: 13, color: "var(--danger)", fontWeight: 500 }}>
              +{formatMin(elapsedMin - estimatedMin)}
            </span>
          ) : (
            <span style={{ fontSize: 13, color: "var(--text-dim)" }}>
              meta {formatMin(estimatedMin)}
            </span>
          )
        ) : (
          <span style={{ fontSize: 13, color: "var(--text-dim)" }}>sem estimativa</span>
        )}
      </div>
      <div
        style={{ height: 7, background: "var(--surface-2)", borderRadius: 999, overflow: "hidden" }}
      >
        <div
          style={{ width: `${fill}%`, height: "100%", background: color, borderRadius: 999, transition: "width 0.3s ease" }}
        />
      </div>
    </div>
  );
}
