import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { SplitText } from "gsap/SplitText";
import { TextPlugin } from "gsap/TextPlugin";
import type { RefObject } from "react";

gsap.registerPlugin(useGSAP, ScrambleTextPlugin, SplitText, TextPlugin);

/**
 * Revelado de texto y ventanas estilo terminal. Se marca el HTML con data-fx y este módulo
 * arma la animación de entrada, en orden de aparición en el DOM:
 *
 *   data-fx-window       ventana: los bordes ([data-fx-edge]) se dibujan en pasos
 *   data-fx="scramble"   texto corto (títulos, labels): se decodifica con caracteres aleatorios
 *   data-fx="type"       texto que se tipea letra por letra
 *   data-fx="lines"      párrafos: se barren línea por línea, como un monitor refrescando
 *   data-fx="item"       elemento que aparece de golpe (íconos, hints)
 *   data-fx-own          sub-bloque con su propio useReveal: el revelado del padre lo saltea
 *
 * El texto real siempre está en el HTML (SEO y lectores de pantalla); la animación solo lo
 * oculta y lo revela. No es scroll-driven: se dispara al activarse la pausa, así que no
 * compite con el timeline maestro.
 */

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=<>/";
/** Separación entre el inicio de un elemento y el siguiente (s). */
const STAGGER = 0.07;

function originalText(el: HTMLElement) {
  el.dataset.text ??= el.textContent ?? "";
  return el.dataset.text;
}

/** TextPlugin y ScrambleText escriben con innerHTML: sin escapar, "<n>" se vuelve una etiqueta. */
function escapeHtml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function buildReveal(scope: HTMLElement): gsap.core.Timeline | null {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;

  const tl = gsap.timeline();
  let cursor = 0;

  /** Un elemento pertenece a este revelado si no está dentro de otro bloque data-fx-own. */
  const owned = (el: Element) => {
    const owner = el.closest("[data-fx-own]");
    return !owner || owner === scope;
  };

  // Bordes sueltos del propio scope (fuera de ventanas), p. ej. un separador.
  const looseEdges = [...scope.querySelectorAll<HTMLElement>("[data-fx-edge]")].filter(
    (e) => owned(e) && !(e.closest("[data-fx-window]") && scope.contains(e.closest("[data-fx-window]"))),
  );
  if (looseEdges.length) {
    tl.fromTo(looseEdges, { scaleX: 0 }, { scaleX: 1, duration: 0.3, ease: "steps(6)" }, 0);
    cursor += 0.1;
  }

  const targets = scope.querySelectorAll<HTMLElement>("[data-fx-window], [data-fx]");
  targets.forEach((el) => {
    if (!owned(el)) return;

    if (el.hasAttribute("data-fx-window")) {
      const edges = [...el.querySelectorAll<HTMLElement>("[data-fx-edge]")].filter(owned);
      const surface = el.querySelectorAll<HTMLElement>("[data-fx-surface]");
      tl.set(surface, { autoAlpha: 0 }, cursor);
      tl.fromTo(
        edges,
        { scaleX: (_, e: HTMLElement) => (e.dataset.fxEdge === "x" ? 0 : 1), scaleY: (_, e: HTMLElement) => (e.dataset.fxEdge === "y" ? 0 : 1) },
        { scaleX: 1, scaleY: 1, duration: 0.3, ease: "steps(6)", stagger: 0.04 },
        cursor,
      );
      tl.to(surface, { autoAlpha: 1, duration: 0.15, ease: "steps(3)" }, cursor + 0.2);
      cursor += 0.25;
      return;
    }

    switch (el.dataset.fx) {
      case "scramble": {
        const text = originalText(el);
        tl.set(el, { text: "" }, cursor);
        tl.to(
          el,
          {
            duration: gsap.utils.clamp(0.35, 0.9, text.length * 0.03),
            scrambleText: { text: escapeHtml(text), chars: SCRAMBLE_CHARS, revealDelay: 0.15, speed: 0.6 },
            ease: "none",
          },
          cursor,
        );
        break;
      }
      case "type": {
        const text = originalText(el);
        tl.set(el, { text: "" }, cursor);
        tl.to(
          el,
          {
            // preserveSpaces: respeta los espacios dobles (columnas alineadas en la terminal).
            text: { value: escapeHtml(text), preserveSpaces: true },
            duration: gsap.utils.clamp(0.4, 1.6, text.length * 0.025),
            ease: "none",
          },
          cursor,
        );
        break;
      }
      case "lines": {
        const split = SplitText.create(el, { type: "lines" });
        tl.fromTo(
          split.lines,
          { clipPath: "inset(0 100% 0 0)" },
          { clipPath: "inset(0 0% 0 0)", duration: 0.25, ease: "steps(10)", stagger: 0.05 },
          cursor,
        );
        break;
      }
      case "item":
        tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1, ease: "steps(1)" }, cursor);
        break;
    }
    cursor += STAGGER;
  });

  return tl;
}

/**
 * Reproduce el revelado cada vez que `active` pasa a true (o cambia `replayKey`).
 * Al desactivarse, el contexto de useGSAP revierte todo: texto y markup originales.
 */
export function useReveal(scope: RefObject<HTMLElement | null>, active: boolean, replayKey?: unknown) {
  useGSAP(
    () => {
      if (active && scope.current) buildReveal(scope.current);
    },
    { scope, dependencies: [active, replayKey], revertOnUpdate: true },
  );
}
