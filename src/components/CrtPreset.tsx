"use client";

import { useEffect } from "react";

const PRESETS = ["classic", "soft", "off"] as const;
const KEY = "crt-preset";

/**
 * Permite forzar el preset del overlay CRT con ?crt=classic|soft|off para comparar looks.
 * Se recuerda en la sesión al navegar (p. ej. ir a /cv y volver). Sin parámetro manda el CSS:
 * classic en escritorio, soft en celulares. ?crt=auto vuelve a ese comportamiento.
 */
export default function CrtPreset() {
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("crt");
    let preset: string | null = null;
    try {
      if (param === "auto") sessionStorage.removeItem(KEY);
      else if (param && (PRESETS as readonly string[]).includes(param)) sessionStorage.setItem(KEY, param);
      preset = sessionStorage.getItem(KEY);
    } catch {
      preset = param && (PRESETS as readonly string[]).includes(param) ? param : null;
    }
    if (preset) document.documentElement.dataset.crt = preset;
    else delete document.documentElement.dataset.crt;
  }, []);

  return null;
}
