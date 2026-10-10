"use client";

import { useRef, type ReactNode } from "react";
import { useReveal } from "@/animation/reveal";
import type { PauseId } from "@/sequence/manifest";
import { useScene } from "@/store/useScene";

/**
 * Panel de una pausa. El timeline maestro lo muestra/oculta vía [data-pause];
 * este componente reproduce el revelado del contenido cuando la pausa se activa.
 * Los children pueden ser server components: el contenido llega como HTML real.
 */
export default function Reveal({
  pause,
  className,
  children,
}: {
  pause: PauseId;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const active = useScene((s) => s.activePause === pause);
  useReveal(ref, active);

  return (
    <div ref={ref} data-pause={pause} className={`invisible ${className ?? ""}`}>
      {children}
    </div>
  );
}
