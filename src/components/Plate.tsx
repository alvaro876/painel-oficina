// Placa no estilo Mercosul (barra "BRASIL" azul + número).
export function Plate({
  value,
  size = "md",
}: {
  value: string;
  size?: "sm" | "md" | "lg";
}) {
  const numF = size === "lg" ? 26 : size === "sm" ? 15 : 20;
  const topF = size === "lg" ? 9 : size === "sm" ? 7 : 8;

  return (
    <span
      style={{
        display: "inline-block",
        background: "#fff",
        borderRadius: 5,
        border: "1px solid #0e1f3d",
        overflow: "hidden",
        lineHeight: 1.1,
        verticalAlign: "middle",
        flex: "none",
      }}
    >
      <span
        style={{
          display: "block",
          background: "#1f49c9",
          color: "#fff",
          fontSize: topF,
          letterSpacing: 1.5,
          textAlign: "center",
          padding: "1px 0",
          fontWeight: 600,
        }}
      >
        BRASIL
      </span>
      <span
        style={{
          display: "block",
          fontFamily: "var(--font-mono)",
          fontWeight: 700,
          color: "#0e1f3d",
          fontSize: numF,
          textAlign: "center",
          padding: "2px 10px 3px",
          letterSpacing: 1,
        }}
      >
        {value || "—"}
      </span>
    </span>
  );
}
