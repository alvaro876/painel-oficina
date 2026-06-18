"use client";

import type { LayoutRow } from "@/types";
import type { RampaCart } from "./RampaMap";
import { CartCard } from "./CartCard";

// Versão lista da Rampa (mobile/tablet): carrinhos agrupados por lado, com
// botão pra trocar de lado num toque (no lugar do arrasto, que é ruim no touch).
export function RampaList({
  carts,
  layout,
  canEdit,
  onMove,
}: {
  carts: RampaCart[];
  layout: LayoutRow[];
  canEdit: boolean;
  onMove: (key: string, x: number, y: number, lado: 1 | 2) => void;
}) {
  const byKey = new Map(layout.map((l) => [l.carrinho, l]));

  const enriched = carts.map((c, i) => {
    const saved = byKey.get(c.key);
    const lado: 1 | 2 = saved?.lado ?? (i % 2 === 0 ? 1 : 2);
    return { c, lado, y: saved?.y ?? 12 };
  });

  const sections: { lado: 1 | 2; title: string }[] = [
    { lado: 1, title: "Lado 1" },
    { lado: 2, title: "Lado 2" },
  ];

  return (
    <div className="flex flex-col gap-5">
      {sections.map(({ lado, title }) => {
        const items = enriched.filter((e) => e.lado === lado);
        return (
          <div key={lado}>
            <div className="text-sm font-medium mb-2" style={{ color: "var(--text-dim)" }}>
              {title}{" "}
              <span style={{ opacity: 0.7 }}>({items.length})</span>
            </div>
            {items.length === 0 ? (
              <div className="text-sm" style={{ color: "var(--text-dim)" }}>
                vazio
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {items.map(({ c, lado: l, y }) => {
                  const other: 1 | 2 = l === 1 ? 2 : 1;
                  return (
                    <div key={c.key} className="flex flex-col gap-1" style={{ width: 162 }}>
                      <CartCard os={c.os} carrinho={c.carrinho} />
                      {canEdit && (
                        <button
                          onClick={() => onMove(c.key, other === 2 ? 60 : 8, y, other)}
                          className="text-xs py-1 rounded-md"
                          style={{
                            border: "1px solid var(--border)",
                            color: "var(--text-dim)",
                            background: "transparent",
                          }}
                        >
                          → mover p/ Lado {other}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
