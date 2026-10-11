/**
 * Preset del overlay CRT. Vive en el atributo data-crt de <html> y el CSS reacciona al instante
 * (ver globals.css), así que cambiarlo no requiere recargar.
 *
 * - Sin atributo ("auto"): classic en escritorio, soft en celulares.
 * - classic | soft | off: forzado por el toggle o por ?crt= en la URL.
 * La elección se recuerda entre visitas (localStorage; si no está disponible, solo dura la sesión).
 */

export type CrtPreset = "auto" | "classic" | "soft" | "off";

const KEY = "crt-preset";
const FORCED = ["classic", "soft", "off"] as const;
const EVENT = "crt-preset-change";

const isForced = (v: string | null): v is (typeof FORCED)[number] => !!v && (FORCED as readonly string[]).includes(v);

export function getCrtPreset(): CrtPreset {
  const value = document.documentElement.dataset.crt ?? null;
  return isForced(value) ? value : "auto";
}

export function setCrtPreset(preset: CrtPreset) {
  if (preset === "auto") delete document.documentElement.dataset.crt;
  else document.documentElement.dataset.crt = preset;
  try {
    if (preset === "auto") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, preset);
  } catch {
    // Sin storage (modo privado, cookies bloqueadas): el cambio vale hasta recargar.
  }
  window.dispatchEvent(new Event(EVENT));
}

/** Al cargar: ?crt= en la URL tiene prioridad; si no, la elección guardada. */
export function initCrtPreset() {
  const param = new URLSearchParams(window.location.search).get("crt");
  if (param === "auto" || isForced(param)) return setCrtPreset(param);
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(KEY);
  } catch {}
  if (isForced(stored)) document.documentElement.dataset.crt = stored;
  window.dispatchEvent(new Event(EVENT));
}

export function subscribeCrtPreset(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  return () => window.removeEventListener(EVENT, onChange);
}
