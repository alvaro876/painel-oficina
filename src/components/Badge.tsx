export type BadgeColor = "danger" | "warn" | "info" | "ok" | "dim";

const COLOR: Record<BadgeColor, string> = {
  danger: "var(--danger)",
  warn: "var(--warn)",
  info: "var(--info)",
  ok: "var(--ok)",
  dim: "var(--text-dim)",
};

export function Badge({
  children,
  color = "dim",
}: {
  children: React.ReactNode;
  color?: BadgeColor;
}) {
  const c = COLOR[color];
  return (
    <span
      className="rounded-md inline-flex items-center gap-1 whitespace-nowrap"
      style={{
        fontSize: 13,
        padding: "3px 9px",
        color: c,
        background: `color-mix(in srgb, ${c} 16%, transparent)`,
      }}
    >
      {children}
    </span>
  );
}
