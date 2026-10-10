"use client";

import { useEffect, useRef } from "react";
import { SEQUENCE_WIDTH } from "./manifest";
import { frameStore } from "./loader";
import { frameState } from "./frameState";

/** Por debajo de esta fracción no vale la pena fundir con el fotograma siguiente. */
const BLEND_EPSILON = 0.02;
/** Pasos de opacidad distintos del fundido: evita redibujar por cambios imperceptibles. */
const BLEND_STEPS = 32;

/**
 * Capa 1: canvas 2D fijo que dibuja el fotograma actual en modo "cover", respetando devicePixelRatio.
 * El índice es fraccionario: se funde el fotograma N con el N+1 según la posición exacta del scroll,
 * así una secuencia muestreada a 12 fps se percibe continua.
 */
export default function SequenceCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d", { alpha: false })!;
    let lastA: ImageBitmap | undefined;
    let lastB: ImageBitmap | undefined;
    let lastStep = -1;
    let raf = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      frameStore.decodeWidth = Math.min(SEQUENCE_WIDTH[frameStore.variant], canvas.width);
      ctx.imageSmoothingQuality = "high";
      ctx.fillStyle = "#040806";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      lastA = lastB = undefined;
    };

    const drawCover = (img: ImageBitmap) => {
      const { width: cw, height: ch } = canvas;
      const scale = Math.max(cw / img.width, ch / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    };

    const tick = () => {
      const f = frameState.frame;
      const i = Math.floor(f);
      const t = f - i;
      frameStore.setCenter(i);

      const a = frameStore.getNearest(i);
      const b = t > BLEND_EPSILON ? frameStore.get(i + 1) : undefined;
      const step = b ? Math.round(t * BLEND_STEPS) : 0;

      if (a && (a !== lastA || b !== lastB || step !== lastStep)) {
        drawCover(a);
        if (b && step > 0) {
          ctx.globalAlpha = step / BLEND_STEPS;
          drawCover(b);
          ctx.globalAlpha = 1;
        }
        lastA = a;
        lastB = b;
        lastStep = step;
      }
      raf = requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 h-full w-full" aria-hidden />;
}
