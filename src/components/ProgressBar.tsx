export function ProgressBar({ pct }: { pct: number }) {
  const clamped = Math.max(0, Math.min(100, pct));
  const color =
    pct >= 100 ? "var(--danger)" : pct >= 66 ? "var(--warn)" : "var(--ok)";
  return (
    <div
      style={{
        height: 4,
        background: "var(--surface-2)",
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      <div style={{ width: `${clamped}%`, height: "100%", background: color }} />
    </div>
  );
}
