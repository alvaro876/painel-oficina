"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BASES } from "@/lib/bases";

const OPTS = [{ slug: "todas", name: "Todas" }, ...BASES.map((b) => ({ slug: b.slug, name: b.name }))];

export function BaseSelector() {
  const sp = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const cur = sp.get("base") ?? "todas";

  const set = (slug: string) => {
    const p = new URLSearchParams(sp.toString());
    if (slug === "todas") p.delete("base");
    else p.set("base", slug);
    const q = p.toString();
    router.replace(q ? `${path}?${q}` : path, { scroll: false });
  };

  return (
    <div
      className="flex rounded-md overflow-hidden"
      style={{ border: "1px solid var(--border)" }}
    >
      {OPTS.map((o) => {
        const active = cur === o.slug;
        return (
          <button
            key={o.slug}
            onClick={() => set(o.slug)}
            className="text-xs px-2.5 py-1"
            style={{
              color: active ? "var(--text)" : "var(--text-dim)",
              background: active ? "var(--surface-2)" : "transparent",
              fontWeight: active ? 500 : 400,
            }}
          >
            {o.name}
          </button>
        );
      })}
    </div>
  );
}
