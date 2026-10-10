"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Lenis sincronizado con el ticker de GSAP para que ScrollTrigger lea el scroll suavizado. */
export default function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.08,
      // Las áreas .crt-scroll (ventanas, terminal) se quedan con la rueda solo si de verdad
      // tienen contenido para scrollear; si no, el scroll suave de la página sigue normal.
      prevent: (node) => !!node.classList?.contains("crt-scroll") && node.scrollHeight > node.clientHeight + 1,
    });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}
