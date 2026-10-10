"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

/**
 * Si el sistema pide reducir el movimiento, muestra la versión estática (el CV) en lugar del
 * recorrido animado, con la opción de verlo igual. En el server siempre renderiza la experiencia:
 * el Boot tapa la pantalla mientras el cliente decide.
 */
export default function MotionGate({ experience, fallback }: { experience: ReactNode; fallback: ReactNode }) {
  const reduce = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
  const [optedIn, setOptedIn] = useState(false);

  if (!reduce || optedIn) return experience;

  return (
    <>
      <div role="note" className="mx-auto mt-6 max-w-3xl border border-phosphor-dim px-4 py-3 text-sm text-phosphor md:mx-8 lg:mx-auto">
        Tu sistema pide reducir el movimiento, así que te mostramos la versión estática.{" "}
        <button onClick={() => setOptedIn(true)} className="font-display text-lg uppercase text-phosphor-hot underline underline-offset-4">
          [▶] Ver la experiencia animada igual
        </button>
      </div>
      {fallback}
    </>
  );
}
