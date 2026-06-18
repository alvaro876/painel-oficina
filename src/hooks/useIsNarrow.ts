"use client";

import { useEffect, useState } from "react";

// true em telas estreitas (celular/tablet retrato). Usado pra trocar o mapa
// da Rampa por uma lista, que é bem melhor no toque.
export function useIsNarrow(maxWidth = 820): boolean {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${maxWidth - 1}px)`);
    const update = () => setNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [maxWidth]);
  return narrow;
}
