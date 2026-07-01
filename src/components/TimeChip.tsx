import { formatMin } from "@/lib/format";
import { TIME_RED } from "@/config/thresholds";
import type { OSStatus } from "@/types";

// Cronômetro com semáforo: verde → âmbar (a partir de ~2/3 do limite) → vermelho.
export function TimeChip({ min, status }: { min: number; status: OSStatus }) {
  const limit = TIME_RED[status];
  const isRed = limit != null && min >= limit;
  const isAmber = limit != null && !isRed && min >= limit * 0.66;
  const color = isRed ? "var(--danger)" : isAmber ? "var(--warn)" : "var(--text-dim)";

  return (
    <span
      className="font-mono font-medium"
      style={{ color, fontVariantNumeric: "tabular-nums", fontSize: 18 }}
    >
      {formatMin(min)}
    </span>
  );
}
