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
      <div className="text-xs" style={{ color: "var(--text-dim)" }}>
        {label}
      </div>
      <div
        className="text-2xl font-medium mt-1"
        style={{ color: color ?? "var(--text)" }}
      >
        {value}
      </div>
    </div>
  );
}
