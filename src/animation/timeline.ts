import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  CHAPTERS,
  CLIPS,
  INSIDE_SCROLL_LENGTH,
  POWER_ON_LENGTH,
  SCROLL_PX_PER_UNIT,
  TOTAL_SCROLL_UNITS,
  pauseAfter,
  type ActId,
  type PauseId,
} from "@/sequence/manifest";
import { frameState } from "@/sequence/frameState";
import { emitProgress, registerNavigation } from "./navigation";
import { useScene } from "@/store/useScene";

gsap.registerPlugin(ScrollTrigger);

/** Duración (en unidades de timeline) de la entrada/salida de paneles en cada pausa. */
const PANEL_FADE = 12;
/** Los paneles se encienden/apagan en saltos, como un monitor, no con un fade suave. */
const PANEL_EASE = "steps(4)";

interface Segment {
  start: number;
  end: number;
  act: ActId;
  pause: PauseId | null;
}

/**
 * Timeline maestro: único dueño del scroll. Controla el índice de fotograma,
 * las pausas (pin) y la entrada/salida de paneles HTML. 1 unidad de tiempo = 1 fotograma.
 * Los paneles se ubican con `[data-pause="<id>"]`, el acto 4 con `[data-act="inside"]` y la
 * transición con `[data-poweron]` (components/PowerOn.tsx).
 */
export function createMasterTimeline(stage: HTMLElement) {
  const { setActiveAct, setActivePause } = useScene.getState();
  const q = gsap.utils.selector(stage);
  const segments: Segment[] = [];

  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: stage,
      start: "top top",
      end: `+=${TOTAL_SCROLL_UNITS * SCROLL_PX_PER_UNIT}`,
      pin: true,
      scrub: true,
      onUpdate: () => {
        const t = tl.time();
        const seg = segments.find((s) => t >= s.start && t < s.end) ?? segments[segments.length - 1];
        setActiveAct(seg.act);
        setActivePause(seg.pause);
        emitProgress(t);
      },
    },
  });

  let cursor = 0;
  let frame = 0;

  for (const clip of CLIPS) {
    frame += clip.frameCount;
    tl.to(frameState, { frame: frame - 1, duration: clip.frameCount }, cursor);
    segments.push({ start: cursor, end: cursor + clip.frameCount, act: clip.act, pause: null });
    cursor += clip.frameCount;

    const pause = pauseAfter(clip.id);
    if (!pause) continue;

    const panel = q(`[data-pause="${pause.id}"]`);
    tl.addLabel(pause.id, cursor);
    tl.fromTo(panel, { autoAlpha: 0 }, { autoAlpha: 1, duration: PANEL_FADE, ease: PANEL_EASE }, cursor);
    tl.to(panel, { autoAlpha: 0, duration: PANEL_FADE, ease: PANEL_EASE }, cursor + pause.scrollLength - PANEL_FADE);
    segments.push({ start: cursor, end: cursor + pause.scrollLength, act: clip.act, pause: pause.id });
    cursor += pause.scrollLength;
  }

  // Acto 3 → 4: encendido del CRT. La pantalla verde del video llena el cuadro, colapsa en
  // una línea de fósforo y la línea se abre en vertical encendiendo la interfaz.
  const L = POWER_ON_LENGTH;
  const fill = cursor;
  const collapse = fill + L * 0.35;
  const open = fill + L * 0.6;
  const beam = q("[data-poweron-beam]");
  tl.addLabel("poweron", fill);
  tl.fromTo(q("[data-poweron]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, fill);
  tl.fromTo(beam, { opacity: 0, scaleY: 1 }, { opacity: 1, duration: collapse - fill, ease: "power1.in" }, fill);
  tl.fromTo(q("[data-poweron-void]"), { opacity: 0 }, { opacity: 1, duration: 0.01 }, collapse);
  tl.to(beam, { scaleY: 0.004, duration: open - collapse, ease: "power3.in" }, collapse);
  tl.fromTo(
    q('[data-act="inside"]'),
    { autoAlpha: 0, clipPath: "inset(49.8% 0% 49.8% 0%)" },
    { autoAlpha: 1, clipPath: "inset(0% 0% 0% 0%)", duration: fill + L - open, ease: "power2.out" },
    open,
  );
  tl.to(beam, { scaleY: 1, opacity: 0, duration: fill + L - open, ease: "power2.out" }, open);
  tl.to(q("[data-poweron]"), { autoAlpha: 0, duration: 0.01 }, fill + L);
  segments.push({ start: fill, end: fill + L, act: "inversion", pause: null });
  cursor += L;

  // Acto 4: dentro del CRT. Se activa con la interfaz ya encendida (dispara su revelado).
  tl.addLabel("inside", cursor);
  segments.push({ start: cursor, end: cursor + INSIDE_SCROLL_LENGTH, act: "inside", pause: null });
  // Tramo vacío explícito: sin esto la duración del timeline sería menor que el scroll total
  // y ScrollTrigger comprimiría todo (las pausas quedarían corridas respecto del manifest).
  tl.to({}, { duration: INSIDE_SCROLL_LENGTH }, cursor);

  // Capítulos del HUD: cada pausa con su panel ya encendido, el acto 4 con la interfaz prendida.
  const anchors = CHAPTERS.map(({ anchor }) => {
    if (anchor === "start") return 0;
    if (anchor === "inside") return tl.labels.inside + 2;
    return tl.labels[anchor] + PANEL_FADE;
  });
  const unregister = registerNavigation(tl, anchors);

  return { timeline: tl, dispose: unregister };
}
