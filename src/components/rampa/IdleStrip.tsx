import type { CartLogin } from "@/types";

export function IdleStrip({ idle }: { idle: CartLogin[] }) {
  return (
    <div
      className="rounded-lg px-4 py-3 mt-3"
      style={{
        border: "1px solid color-mix(in srgb, var(--warn) 35%, var(--border))",
      }}
    >
      <div
        className="text-sm font-medium mb-2"
        style={{ color: "var(--warn)" }}
      >
        Mecânicos ociosos ({idle.length}){" "}
        <span style={{ color: "var(--text-dim)", fontWeight: 400 }}>
          · logados sem moto em andamento
        </span>
      </div>
      {idle.length === 0 ? (
        <div className="text-sm" style={{ color: "var(--text-dim)" }}>
          Ninguém ocioso.
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {idle.map((l) => (
            <span
              key={l.mecanico}
              className="text-xs px-2 py-1 rounded-md"
              style={{ background: "var(--surface-2)" }}
            >
              {l.mecanico.split("@")[0]}{" "}
              <span style={{ color: "var(--text-dim)" }}>· {l.carrinho}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
