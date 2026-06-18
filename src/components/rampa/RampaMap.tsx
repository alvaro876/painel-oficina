"use client";

import { useRef, useState } from "react";
import type { LayoutRow, WorkshopOS } from "@/types";
import { CartCard } from "./CartCard";

export interface RampaCart {
  key: string; // carrinho, ou "so:<id>" quando não há login casado
  carrinho: string | null;
  os: WorkshopOS;
}

const CARD_W = 164;
const CARD_H = 132;

type XY = { x: number; y: number }; // percentuais 0..100

export function RampaMap({
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
  const floorRef = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState<Record<string, XY>>({});
  const drag = useRef<{ key: string; offX: number; offY: number; moved: boolean; x: number; y: number } | null>(null);

  const saved = new Map(layout.map((l) => [l.carrinho, l]));

  const posFor = (c: RampaCart, i: number): XY => {
    if (live[c.key]) return live[c.key];
    const s = saved.get(c.key);
    if (s) return { x: s.x, y: s.y };
    const cols = 6;
    return { x: (i % cols) * 16 + 1, y: Math.floor(i / cols) * 20 + 4 };
  };

  function down(e: React.PointerEvent<HTMLDivElement>, key: string) {
    if (!canEdit) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    drag.current = { key, offX: e.clientX - r.left, offY: e.clientY - r.top, moved: false, x: 0, y: 0 };
    el.setPointerCapture(e.pointerId);
  }
  function move(e: React.PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    const floor = floorRef.current;
    if (!d || !floor) return;
    d.moved = true;
    const f = floor.getBoundingClientRect();
    let xpx = e.clientX - f.left - d.offX;
    let ypx = e.clientY - f.top - d.offY;
    xpx = Math.max(0, Math.min(xpx, f.width - CARD_W));
    ypx = Math.max(0, Math.min(ypx, f.height - CARD_H));
    const x = (xpx / f.width) * 100;
    const y = (ypx / f.height) * 100;
    d.x = x;
    d.y = y;
    setLive((p) => ({ ...p, [d.key]: { x, y } }));
  }
  function up() {
    const d = drag.current;
    drag.current = null;
    if (d && d.moved) {
      const lado: 1 | 2 = d.x < 50 ? 1 : 2;
      onMove(d.key, Math.round(d.x * 10) / 10, Math.round(d.y * 10) / 10, lado);
    }
  }

  return (
    <div
      ref={floorRef}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      style={{
        position: "relative",
        height: "62vh",
        minHeight: 460,
        borderRadius: 12,
        border: "1px solid var(--border)",
        background: "var(--bg)",
        overflow: "hidden",
      }}
    >
      <span style={{ position: "absolute", top: 8, left: 12, fontSize: 11, fontWeight: 500, color: "var(--text-dim)" }}>
        Lado 1
      </span>
      <span style={{ position: "absolute", top: 8, left: "52%", fontSize: 11, fontWeight: 500, color: "var(--text-dim)" }}>
        Lado 2
      </span>
      <div style={{ position: "absolute", top: 8, bottom: 8, left: "50%", borderLeft: "1px dashed var(--border)" }} />

      {carts.map((c, i) => {
        const p = posFor(c, i);
        return (
          <div
            key={c.key}
            onPointerDown={(e) => down(e, c.key)}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${p.y}%`,
              cursor: canEdit ? "grab" : "default",
              touchAction: "none",
              zIndex: live[c.key] ? 5 : 1,
            }}
          >
            <CartCard os={c.os} carrinho={c.carrinho} />
          </div>
        );
      })}

      {carts.length === 0 && (
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "var(--text-dim)", fontSize: 14 }}>
          Nenhuma moto na rampa agora.
        </div>
      )}
    </div>
  );
}
