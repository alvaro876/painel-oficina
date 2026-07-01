import type { WorkshopOS } from "@/types";
import { TIME_RED } from "@/config/thresholds";
import { isBoxRapido } from "@/lib/status";
import { EstimateMeter } from "@/components/EstimateMeter";
import { Plate } from "@/components/Plate";

function Tag({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span
      style={{
        fontSize: 10,
        padding: "1px 6px",
        borderRadius: 6,
        color,
        background: `color-mix(in srgb, ${color} 16%, transparent)`,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

export function CartCard({
  os,
  carrinho,
}: {
  os: WorkshopOS;
  carrinho: string | null;
}) {
  const piso = os.is_piso === 1;
  const limit = TIME_RED[os.status_atual] ?? 60;
  const over = os.estimated_min > 0 && os.min_in_status > os.estimated_min;
  const red = (limit != null && os.min_in_status >= limit) || over;
  const amber = !red && limit != null && os.min_in_status >= limit * 0.66;

  // Piso domina a borda (sinal mais importante da rampa); urgência de tempo
  // fica no cronômetro + barra.
  const borderColor = piso
    ? "var(--danger)"
    : red
      ? "color-mix(in srgb, var(--danger) 50%, var(--border))"
      : amber
        ? "color-mix(in srgb, var(--warn) 45%, var(--border))"
        : "var(--border)";
  const borderW = piso ? 2 : 1;
  const mec = os.mecanico_email ? os.mecanico_email.split("@")[0] : "—";

  const hasFlags =
    isBoxRapido(os.so_type) ||
    os.is_guincho === 1 ||
    os.is_recidivism === 1 ||
    os.status_atual === "PAUSED" ||
    os.status_atual === "AWAITING_PARTS" ||
    os.status_atual === "QA_REJECTED";

  return (
    <div
      style={{
        width: 162,
        boxSizing: "border-box",
        borderRadius: 10,
        background: "var(--surface)",
        border: `${borderW}px solid ${borderColor}`,
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      {piso && (
        <div
          style={{
            background: "var(--danger)",
            color: "#fff",
            fontSize: 10.5,
            fontWeight: 500,
            letterSpacing: 0.2,
            padding: "3px 10px",
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              background: "#fff",
              display: "inline-block",
            }}
          />
          Cliente em piso
        </div>
      )}

      <div style={{ padding: "9px 11px" }}>
        <div
          className="flex items-center justify-between"
          style={{ fontSize: 12.5, fontWeight: 500 }}
        >
          <span className="truncate" style={{ maxWidth: 104 }}>
            {mec}
          </span>
          {carrinho && (
            <span style={{ color: "var(--text-dim)", fontSize: 11 }}>{carrinho}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5" style={{ marginTop: 4 }}>
          <Plate value={os.placa} size="sm" />
          <span style={{ color: "var(--text-dim)", fontSize: 11 }}>{os.modelo}</span>
        </div>

        {hasFlags && (
          <div className="flex flex-wrap items-center gap-1" style={{ marginTop: 6 }}>
            {isBoxRapido(os.so_type) && <Tag color="var(--info)">box rápido</Tag>}
            {os.is_guincho === 1 && os.is_recidivism === 1 ? (
              <Tag color="var(--danger)">guincho reinc.</Tag>
            ) : os.is_guincho === 1 ? (
              <Tag color="var(--warn)">guincho</Tag>
            ) : os.is_recidivism === 1 ? (
              <Tag color="var(--warn)">reincidente</Tag>
            ) : null}
            {os.status_atual === "PAUSED" && <Tag color="var(--warn)">pausada</Tag>}
            {os.status_atual === "AWAITING_PARTS" && (
              <Tag color="var(--text-dim)">aguard. peça</Tag>
            )}
            {os.status_atual === "QA_REJECTED" && (
              <Tag color="var(--danger)">retrabalho</Tag>
            )}
          </div>
        )}

        <EstimateMeter
          elapsedMin={os.min_in_status}
          estimatedMin={os.estimated_min}
          danger={red}
        />
      </div>
    </div>
  );
}
