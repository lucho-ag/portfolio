"use client";

import { useEffect } from "react";
import { initCrtPreset } from "@/lib/crtPreset";

/**
 * Aplica el preset del overlay CRT al cargar: ?crt=classic|soft|off|auto en la URL o la elección
 * guardada del toggle (ver lib/crtPreset.ts).
 */
export default function CrtPreset() {
  useEffect(() => {
    initCrtPreset();
  }, []);

  return null;
}
