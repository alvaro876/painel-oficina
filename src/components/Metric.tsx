export function Metric({
  label,
  value,
  color,
}: {
  label: string;
  value: number | string;
  color?: string;
}) {
  return (
    <div
      className="rounded-lg px-4 py-3"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <div style={{ fontSize: 14, color: "var(--text-dim)" }}>{label}</div>
      <div
        style={{ fontSize: 32, fontWeight: 500, marginTop: 2, color: color ?? "var(--text)", lineHeight: 1.1 }}
      >
        {value}
      </div>
    </div>
  );
}
