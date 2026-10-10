import type Lenis from "lenis";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { frameState } from "@/sequence/frameState";
import { frameStore } from "@/sequence/loader";
import { CHAPTERS } from "@/sequence/manifest";
import { useScene } from "@/store/useScene";

/**
 * Puente entre el timeline maestro, Lenis y el HUD. El HUD no anima nada por su cuenta:
 * moverse es scrollear la página, así el timeline maestro sigue siendo el único dueño del scroll.
 *
 * Dos formas de llegar a un capítulo:
 * - Al vecino (±1): se recorre la transición real del video a velocidad de reproducción, con los
 *   primeros fotogramas ya decodificados. Recorrer cientos de fotogramas en un segundo no es
 *   posible sin tirones (solo hay una ventana de fotogramas decodificados en memoria).
 * - Saltos largos: cambio de canal. Estática, corte directo al destino cuando su fotograma está
 *   listo, y la imagen vuelve. Rápido y sin tirones en cualquier dirección.
 */

interface Registration {
  timeline: gsap.core.Timeline;
  trigger: ScrollTrigger;
  /** Tiempo del timeline de cada capítulo de CHAPTERS, en el mismo orden. */
  anchors: number[];
}

type ProgressListener = (time: number, duration: number) => void;

let lenis: Lenis | null = null;
let registration: Registration | null = null;
const listeners = new Set<ProgressListener>();

/** Velocidad del recorrido al capítulo vecino, en unidades del timeline (≈ fotogramas) por segundo. */
const TRAVEL_UNITS_PER_S = 55;
const MIN_TRAVEL_S = 1.6;
const MAX_TRAVEL_S = 4.5;
/** Curva suave en los extremos pero sin picos de velocidad que adelanten a la decodificación. */
const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

/** Cambio de canal: tiempo para que la estática tape la imagen y tiempo mínimo en pantalla. */
const CHANNEL_IN_MS = 220;
const CHANNEL_HOLD_MS = 450;

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export function setLenis(instance: Lenis | null) {
  lenis = instance;
}

export function registerNavigation(timeline: gsap.core.Timeline, anchors: number[]) {
  const trigger = timeline.scrollTrigger;
  if (!trigger) throw new Error("El timeline maestro necesita un ScrollTrigger para navegar.");
  registration = { timeline, trigger, anchors };
  emitProgress(timeline.time());
  return () => {
    if (registration?.timeline === timeline) registration = null;
  };
}

/** Lo llama el timeline maestro en cada actualización del scroll. */
export function emitProgress(time: number) {
  if (!registration) return;
  const duration = registration.timeline.duration();
  for (const listener of listeners) listener(time, duration);
}

export function subscribeProgress(listener: ProgressListener) {
  listeners.add(listener);
  if (registration) listener(registration.timeline.time(), registration.timeline.duration());
  return () => {
    listeners.delete(listener);
  };
}

/** Índice del capítulo en curso: el último cuyo ancla ya se pasó. */
export function chapterAt(time: number) {
  if (!registration) return 0;
  let index = 0;
  registration.anchors.forEach((anchor, i) => {
    if (time >= anchor - 1) index = i;
  });
  return index;
}

function scrollFor(time: number) {
  const { timeline, trigger } = registration!;
  return trigger.start + (time / timeline.duration()) * (trigger.end - trigger.start);
}

/** Recorrido real hasta el capítulo vecino, a velocidad de reproducción. */
async function travel(y: number, deltaUnits: number) {
  await frameStore.prime(frameState.frame, deltaUnits > 0 ? 1 : -1);
  const seconds = Math.min(MAX_TRAVEL_S, Math.max(MIN_TRAVEL_S, Math.abs(deltaUnits) / TRAVEL_UNITS_PER_S));
  await new Promise<void>((resolve) => {
    const safety = setTimeout(resolve, seconds * 1000 + 500);
    const done = () => {
      clearTimeout(safety);
      resolve();
    };
    if (lenis) lenis.scrollTo(y, { duration: seconds, easing: easeInOutSine, lock: true, force: true, onComplete: done });
    else {
      window.scrollTo({ top: y, behavior: "smooth" });
      setTimeout(done, seconds * 1000);
    }
  });
}

/** Salto largo: estática, corte al destino con su fotograma ya listo, y vuelve la imagen. */
async function channelSwitch(from: number, to: number, y: number) {
  const { setChannelSwitch } = useScene.getState();
  setChannelSwitch({ from, to, label: CHAPTERS[to].label });
  await wait(CHANNEL_IN_MS);
  if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
  else window.scrollTo(0, y);
  ScrollTrigger.update(); // el timeline se ubica en el destino y fija el fotograma
  await Promise.all([frameStore.ready(frameState.frame), wait(CHANNEL_HOLD_MS)]);
  setChannelSwitch(null);
}

let busy = false;

export async function goToChapter(index: number) {
  if (!registration || busy) return;
  const { timeline, anchors } = registration;
  const i = Math.max(0, Math.min(anchors.length - 1, index));
  const now = timeline.time();
  const target = anchors[i];
  if (Math.abs(target - now) < 0.5) return;

  const current = chapterAt(now);
  busy = true;
  try {
    if (Math.abs(i - current) <= 1) await travel(scrollFor(target), target - now);
    else await channelSwitch(current, i, scrollFor(target));
  } finally {
    busy = false;
  }
}

/** Margen (en unidades del timeline) para considerar que ya se avanzó dentro de un capítulo. */
const REWIND_THRESHOLD = 6;

/**
 * Siguiente / anterior. Como en un reproductor: si ya se avanzó dentro del capítulo actual,
 * "anterior" vuelve a su inicio en lugar de saltar al previo.
 */
export function stepChapter(delta: 1 | -1) {
  if (!registration) return;
  const time = registration.timeline.time();
  const current = chapterAt(time);
  if (delta < 0 && time > registration.anchors[current] + REWIND_THRESHOLD) goToChapter(current);
  else goToChapter(current + delta);
}
