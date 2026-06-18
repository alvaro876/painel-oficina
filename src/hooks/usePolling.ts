"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface PollResult<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  fetchedAt: Date | null;
  refresh: () => void;
}

// Fetch no mount + setInterval. Pausa quando a aba não está visível
// (economiza CPU da TV e quota das fontes) e refaz ao voltar o foco.
export function usePolling<T>(url: string, intervalMs: number): PollResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const json = (await res.json()) as T;
      setData(json);
      setError(null);
      setFetchedAt(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    const stop = () => {
      if (timer.current) clearInterval(timer.current);
      timer.current = null;
    };
    const start = () => {
      stop();
      timer.current = setInterval(load, intervalMs);
    };
    const onVisibility = () => {
      if (document.hidden) stop();
      else {
        load();
        start();
      }
    };

    load();
    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [load, intervalMs]);

  return { data, error, loading, fetchedAt, refresh: load };
}
