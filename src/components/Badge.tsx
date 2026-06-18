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
      className="text-xs px-2 py-0.5 rounded-md inline-flex items-center gap-1 whitespace-nowrap"
      style={{ color: c, background: `color-mix(in srgb, ${c} 16%, transparent)` }}
    >
      {children}
    </span>
  );
}
