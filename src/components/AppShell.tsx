"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { BaseSelector } from "./BaseSelector";

const TABS = [
  { href: "/diagnostico", label: "Diagnóstico" },
  { href: "/rampa", label: "Rampa" },
  { href: "/qualidade", label: "Qualidade" },
];

export function AppShell({
  children,
  right,
}: {
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  const path = usePathname();
  const sp = useSearchParams();
  const base = sp.get("base");
  const qs = base ? `?base=${base}` : "";

  return (
    <div className="min-h-full flex flex-col">
      <header
        className="flex items-center justify-between px-5 h-14 border-b"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <div className="flex items-center gap-6">
          <span className="font-medium whitespace-nowrap">
            Painel de Oficina{" "}
            <span style={{ color: "var(--text-dim)" }}>· Vammo</span>
          </span>
          <nav className="flex gap-1">
            {TABS.map((t) => {
              const active = path === t.href;
              return (
                <Link
                  key={t.href}
                  href={t.href + qs}
                  className="px-3 py-1.5 rounded-md text-sm transition-colors"
                  style={{
                    color: active ? "var(--text)" : "var(--text-dim)",
                    background: active ? "var(--surface-2)" : "transparent",
                    fontWeight: active ? 500 : 400,
                  }}
                >
                  {t.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <BaseSelector />
          {right}
        </div>
      </header>
      <main className="flex-1 p-5">{children}</main>
    </div>
  );
}
