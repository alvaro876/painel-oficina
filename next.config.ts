import type { NextConfig } from "next";

// Sem `ignoreBuildErrors` de propósito: queremos que erros de tipo quebrem o
// build (o vammo-reserva ligava isso e mascarava bugs). Tipos strict ligados.
const nextConfig: NextConfig = {};

export default nextConfig;
