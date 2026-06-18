"use client";

import { useEffect, useState } from "react";

// "ao vivo · atualizado há Xs" — reflete a idade real desde o último fetch.
export function LiveIndicator({
  fetchedAt,
  error,
}: {
  fetchedAt: Date | null;
  error?: boolean;
}) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(i);
  }, []);

  const secs = fetchedAt
    ? Math.floor((Date.now() - fetchedAt.getTime()) / 1000)
    : null;
  const stale = secs != null && secs > 90;
  const color = error || stale ? "var(--warn)" : "var(--ok)";
  const label = error
    ? "erro ao atualizar"
    : secs == null
      ? "carregando…"
      : `ao vivo · há ${secs}s`;

  return (
    <span
      className="flex items-center gap-2 text-sm"
      style={{ color: "var(--text-dim)" }}
    >
      <span
        style={{ width: 8, height: 8, borderRadius: 9999, background: color }}
      />
      {label}
    </span>
  );
}
