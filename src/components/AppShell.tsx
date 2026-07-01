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
        className="border-b px-3 py-2 flex flex-col gap-2 md:h-14 md:flex-row md:items-center md:justify-between md:gap-4 md:py-0 md:px-5"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <div className="flex items-center gap-3 md:gap-5 min-w-0">
          <span className="font-medium whitespace-nowrap text-base md:text-lg">
            Painel de Oficina
            <span className="hidden lg:inline" style={{ color: "var(--text-dim)" }}>
              {" "}· Vammo
            </span>
          </span>
          <nav className="flex gap-1 overflow-x-auto">
            {TABS.map((t) => {
              const active = path === t.href;
              return (
                <Link
                  key={t.href}
                  href={t.href + qs}
                  className="px-3 py-2 rounded-md text-base whitespace-nowrap transition-colors"
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
        <div className="flex items-center gap-3 justify-between md:justify-end">
          <BaseSelector />
          {right}
        </div>
      </header>
      <main className="flex-1 p-3 md:p-5">{children}</main>
    </div>
  );
}
