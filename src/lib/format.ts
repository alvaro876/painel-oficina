// Formatação de tempo.

/** 9 → "9min", 75 → "1h15", 120 → "2h". Pra listas. */
export function formatMin(min: number): string {
  if (!Number.isFinite(min) || min <= 0) return "0min";
  const m = Math.round(min);
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem > 0 ? `${h}h${rem.toString().padStart(2, "0")}` : `${h}h`;
}

/** 34 → "0:34", 72 → "1:12". Pro cronômetro dos carrinhos. */
export function clock(min: number): string {
  const m = Math.max(0, Math.round(min));
  const h = Math.floor(m / 60);
  return `${h}:${(m % 60).toString().padStart(2, "0")}`;
}
