"use client";

import { useSyncExternalStore } from "react";
import { getCrtPreset, setCrtPreset, subscribeCrtPreset } from "@/lib/crtPreset";

/**
 * Prende y apaga el overlay CRT en vivo. ON vuelve al look recomendado para la pantalla
 * (classic en escritorio, soft en celulares); OFF lo saca.
 */
export default function CrtToggle({ className = "" }: { className?: string }) {
  const preset = useSyncExternalStore(subscribeCrtPreset, getCrtPreset, () => "auto" as const);
  const on = preset !== "off";

  return (
    <button
      type="button"
      onClick={() => setCrtPreset(on ? "off" : "auto")}
      aria-pressed={on}
      aria-label={on ? "Desactivar efecto CRT" : "Activar efecto CRT"}
      title="Efecto CRT (scanlines, grano y viñeta)"
      className={`border border-phosphor-dim bg-void/80 px-2 py-0.5 font-display text-lg uppercase backdrop-blur-sm hover:border-phosphor hover:text-phosphor-hot ${className}`}
    >
      <span className="text-phosphor-dim">CRT </span>
      <span className={on ? "text-phosphor" : "text-phosphor-dim"}>{on ? "ON" : "OFF"}</span>
    </button>
  );
}
