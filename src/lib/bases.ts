// Bases da oficina — fonte única (nada de nome de base hardcoded espalhado).
// location_id é o campo em oms_r.so.

export interface Base {
  id: number;
  name: string;
  slug: string;
}

export const BASES: readonly Base[] = [
  { id: 1, name: "Mooca", slug: "mooca" },
  { id: 34, name: "Osasco", slug: "osasco" },
  { id: 166, name: "São Bernardo", slug: "sbc" },
] as const;

export const BASE_IDS: readonly number[] = BASES.map((b) => b.id);

export const baseById = (id: number): Base | undefined =>
  BASES.find((b) => b.id === id);

export const baseBySlug = (slug: string): Base | undefined =>
  BASES.find((b) => b.slug === slug);
