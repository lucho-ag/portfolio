"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { DoubleSide, SRGBColorSpace, type Group } from "three";
import { useScene } from "@/store/useScene";
import type { SceneObjectProps } from "../Objects3D";

// Proporciones de un DVD real (radio exterior = 1).
const R_OUTER = 1;
const R_LABEL = 0.97;
const R_HUB = 0.36;
const R_HOLE = 0.075;
const THICKNESS = 0.024;
const SEGMENTS = 128;

/** Giro en reposo y pico al cambiar de proyecto (rad/s), y qué tan rápido vuelve al reposo. */
const SPIN_IDLE = 0.5;
const SPIN_LOAD = 14;
const SPIN_DECAY = 1.6;

/**
 * DVD procedural: la cara de la etiqueta lleva la portada del proyecto seleccionado,
 * la cara de datos es metálica e iridiscente. Al cambiar de proyecto acelera como si
 * la lectora cargara el disco y desacelera sola.
 */
export default function DVD({ covers }: SceneObjectProps) {
  const textures = useTexture(covers, (loaded) => {
    for (const t of loaded) {
      t.colorSpace = SRGBColorSpace;
      t.anisotropy = 8;
    }
  });

  const selected = useScene((s) => s.selectedProject);
  const tiltRef = useRef<Group>(null);
  const discRef = useRef<Group>(null);
  const spin = useRef(SPIN_IDLE);

  useEffect(() => {
    spin.current = SPIN_LOAD;
  }, [selected]);

  useFrame((state, delta) => {
    spin.current += (SPIN_IDLE - spin.current) * (1 - Math.exp(-delta * SPIN_DECAY));
    if (discRef.current) discRef.current.rotation.z -= spin.current * delta;
    if (tiltRef.current) {
      const t = state.clock.elapsedTime;
      tiltRef.current.rotation.x = -0.35 + Math.sin(t * 0.6) * 0.05;
      tiltRef.current.rotation.y = 0.45 + Math.sin(t * 0.4) * 0.08;
    }
  });

  const cover = textures[selected % textures.length];

  return (
    <group ref={tiltRef} scale={0.9}>
      <group ref={discRef}>
        {/* Cara de la etiqueta (+Z) con la portada. */}
        <mesh position-z={THICKNESS / 2 + 0.0005}>
          <ringGeometry args={[R_HUB, R_LABEL, SEGMENTS]} />
          <meshStandardMaterial map={cover} roughness={0.6} metalness={0.05} envMapIntensity={0.35} />
        </mesh>
        {/* Borde plateado entre etiqueta y canto. */}
        <mesh position-z={THICKNESS / 2 + 0.0005}>
          <ringGeometry args={[R_LABEL, R_OUTER, SEGMENTS]} />
          <meshStandardMaterial color="#d9dfe0" metalness={1} roughness={0.2} />
        </mesh>
        {/* Hub de policarbonato transparente. */}
        <mesh position-z={THICKNESS / 2}>
          <ringGeometry args={[R_HOLE, R_HUB, 96]} />
          <meshStandardMaterial color="#B8FFC9" transparent opacity={0.3} roughness={0.1} />
        </mesh>
        {/* Anillo de apilado: emisivo, lo toma el bloom. */}
        <mesh position-z={THICKNESS / 2 + 0.001}>
          <ringGeometry args={[R_HUB - 0.018, R_HUB, 96]} />
          <meshStandardMaterial color="#39FF7A" emissive="#39FF7A" emissiveIntensity={1.4} toneMapped={false} />
        </mesh>

        {/* Cara de datos (−Z): metal iridiscente. */}
        <mesh position-z={-THICKNESS / 2} rotation-y={Math.PI}>
          <ringGeometry args={[R_HUB, R_OUTER, SEGMENTS]} />
          <meshPhysicalMaterial
            color="#cfd8d6"
            metalness={1}
            roughness={0.12}
            iridescence={1}
            iridescenceIOR={1.6}
            iridescenceThicknessRange={[200, 800]}
          />
        </mesh>
        <mesh position-z={-THICKNESS / 2} rotation-y={Math.PI}>
          <ringGeometry args={[R_HOLE, R_HUB, 96]} />
          <meshStandardMaterial color="#B8FFC9" transparent opacity={0.3} roughness={0.1} />
        </mesh>

        {/* Cantos exterior e interior. */}
        <mesh rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[R_OUTER, R_OUTER, THICKNESS, SEGMENTS, 1, true]} />
          <meshStandardMaterial color="#9aa5a2" metalness={0.9} roughness={0.3} side={DoubleSide} />
        </mesh>
        <mesh rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[R_HOLE, R_HOLE, THICKNESS, 48, 1, true]} />
          <meshStandardMaterial color="#B8FFC9" transparent opacity={0.4} side={DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}
