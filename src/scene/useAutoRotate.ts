import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

/** Rotación lenta automática. Muta el ref directamente: nada de setState dentro de useFrame. */
export function useAutoRotate(speed = 0.25) {
  const ref = useRef<Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * speed;
  });
  return ref;
}

/**
 * Vaivén suave para objetos planos (placas, disquetes): un giro completo los pondría de canto
 * y desaparecerían. `amplitude` en radianes.
 */
export function useSway(amplitude = 0.5, speed = 0.4) {
  const ref = useRef<Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = Math.sin(t * speed) * amplitude;
    ref.current.rotation.x = Math.sin(t * speed * 0.7) * amplitude * 0.3;
  });
  return ref;
}
