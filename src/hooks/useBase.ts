"use client";

import { useSearchParams } from "next/navigation";
import { baseBySlug } from "@/lib/bases";

// Lê a base selecionada da URL (?base=slug). null = todas as bases.
export function useBase(): number | null {
  const sp = useSearchParams();
  const slug = sp.get("base");
  if (!slug || slug === "todas") return null;
  return baseBySlug(slug)?.id ?? null;
}
