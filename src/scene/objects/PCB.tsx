"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { AdditiveBlending, type Mesh, type MeshBasicMaterial } from "three";
import { useScene } from "@/store/useScene";
import { PCB_SITES } from "../pcbSites";
import { useSway } from "../useAutoRotate";
import { useFittedModel } from "../useFittedModel";

const URL = "/models/pcb.glb";
/** Separación del halo sobre el componente, para que no parpadee contra su cara superior. */
const LIFT = 0.01;
/** El halo desborda un poco el componente para que el brillo se lea alrededor. */
const HALO_MARGIN = 1.25;

/**
 * PCB de la sección de stack. Modelo: "Drone Control PCB v3" de Plasmabot1 (CC-BY-4.0),
 * ver content/credits.json. El grupo de tecnologías activo enciende su componente.
 */
export default function PCB() {
  const ref = useSway(0.45);
  const { object, size } = useFittedModel(URL, 2.1);
  const active = useScene((s) => s.activeStackGroup);

  return (
    // Inclinación afuera, vaivén adentro: useSway reescribe la rotación del grupo que controla.
    <group rotation={[-0.25, 0, 0]}>
      <group ref={ref}>
        <primitive object={object} />
        {PCB_SITES.map((site, i) => (
          <Halo
            key={site.designator}
            visible={active % PCB_SITES.length === i}
            position={[(site.u - 0.5) * size.x, (0.5 - site.v) * size.y, (site.t - 0.5) * size.z + LIFT]}
            scale={[site.w * size.x * HALO_MARGIN, site.h * size.y * HALO_MARGIN, 1]}
          />
        ))}
      </group>
    </group>
  );
}

/** Halo emisivo sobre un componente: late suave y lo toma el bloom. */
function Halo({ visible, position, scale }: { visible: boolean; position: [number, number, number]; scale: [number, number, number] }) {
  const mesh = useRef<Mesh>(null);
  useFrame((state) => {
    if (!mesh.current) return;
    const material = mesh.current.material as MeshBasicMaterial;
    material.opacity = 0.55 + Math.sin(state.clock.elapsedTime * 4) * 0.2;
  });
  return (
    <mesh ref={mesh} visible={visible} position={position} scale={scale}>
      <planeGeometry />
      <meshBasicMaterial color="#39FF7A" transparent blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

useGLTF.preload(URL);
