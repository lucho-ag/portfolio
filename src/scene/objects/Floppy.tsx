"use client";

import { useGLTF } from "@react-three/drei";
import { useSway } from "../useAutoRotate";
import { useFittedModel } from "../useFittedModel";

const URL = "/models/floppy.glb";

/**
 * Disquete de la sección de certs y logros. Modelo: "Diskette" de MaximP (CC-BY-4.0),
 * ver content/credits.json.
 */
export default function Floppy() {
  const ref = useSway(0.5, 0.5);
  const { object } = useFittedModel(URL, 1.2, { envMapIntensity: 0.35 });
  return (
    // Inclinación afuera, vaivén adentro: useSway reescribe la rotación del grupo que controla.
    <group rotation={[-0.2, 0, 0.12]}>
      <group ref={ref}>
        <primitive object={object} />
      </group>
    </group>
  );
}

useGLTF.preload(URL);
